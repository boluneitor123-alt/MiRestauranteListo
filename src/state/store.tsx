'use client';

/**
 * Estado de la app del emprendedor.
 *
 * Dos mitades bien separadas:
 * - Lo que el usuario captura (`ProjectState`): vive aquí y se cachea localmente.
 * - El acceso (prueba / licencia / bloqueo): **lo decide el servidor**. La app
 *   sólo lo consulta y obedece; nunca lo calcula por su cuenta.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  capabilities as capabilitiesFor,
  type AccessLevel,
  type Capabilities,
} from '@/domain/access';
import { emptyProjectState, importBackup, type ProjectState } from '@/domain/projectState';
import { getDeviceId } from '@/lib/device';

const STATE_KEY = 'mrl.state.v3';

export interface Entitlement {
  level: AccessLevel;
  licensed: boolean;
  code?: string;
  status?: string;
  trial: { startedAt: number; expiresAt: number; daysLeft: number; expired: boolean; label: string };
  capabilities: Capabilities;
  devices?: { used: number; max: number };
  price: number;
  warrantyDays: number;
  trialDays: number;
}

type Action =
  | { type: 'replace'; state: ProjectState }
  | { type: 'patch'; patch: Partial<ProjectState> }
  | { type: 'update'; update: (state: ProjectState) => ProjectState };

function reducer(state: ProjectState, action: Action): ProjectState {
  switch (action.type) {
    case 'replace':
      return action.state;
    case 'patch':
      return { ...state, ...action.patch };
    case 'update':
      return action.update(state);
  }
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthOutcome {
  ok: boolean;
  message?: string;
  /** El usuario ya tenía proyecto guardado: se salta el onboarding. */
  hasProject?: boolean;
  /** A dónde mandarlo. Lo decide el servidor según el role de la cuenta. */
  redirectTo?: string;
}

interface StoreValue {
  state: ProjectState;
  patch: (patch: Partial<ProjectState>) => void;
  update: (update: (state: ProjectState) => ProjectState) => void;
  replace: (state: ProjectState) => void;
  /** Usuario en sesión, `null` si no ha entrado. */
  user: SessionUser | null;
  /** Ya se consultó al servidor quién está en sesión. */
  authReady: boolean;
  register: (input: { name: string; email: string; password: string }) => Promise<AuthOutcome>;
  login: (input: { email: string; password: string }) => Promise<AuthOutcome>;
  logout: () => Promise<void>;
  /** Guardado pendiente contra el servidor. */
  saving: boolean;
  /** Acceso resuelto en el servidor. `null` mientras se consulta. */
  entitlement: Entitlement | null;
  refreshEntitlement: () => Promise<Entitlement | null>;
  /** Reclama una licencia recién pagada (activación automática). */
  claim: () => Promise<boolean>;
  /** Activa con código, desde Más › Recuperar acceso. */
  activate: (code: string) => Promise<{ ok: boolean; message?: string }>;
  deviceId: string;
  online: boolean;
  /** Alcance vigente; en lo que responde el servidor, el más restringido. */
  can: Capabilities;
  toast: string | null;
  flash: (message: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

/** Mientras no se sabe el acceso, se asume lo mínimo: nunca se filtra de más. */
const PENDING_CAPABILITIES = capabilitiesFor('bloqueado');

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => emptyProjectState());
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [online, setOnline] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);
  const loadedFromServer = useRef(false);
  // Última versión del estado, para consultarla dentro de callbacks sin
  // volver a crearlos en cada tecla.
  const latestState = useRef(state);
  latestState.current = state;

  /** Trae el proyecto guardado del servidor. Devuelve si ya había uno. */
  const loadProject = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/project');
      if (!response.ok) return false;
      const data = (await response.json()) as { state: unknown | null };
      if (!data.state) return false;
      dispatch({ type: 'replace', state: importBackup(data.state) });
      loadedFromServer.current = true;
      return true;
    } catch {
      return false;
    }
  }, []);

  // Caché local mientras carga el servidor: evita el parpadeo en frío. Con
  // sesión abierta, la fuente de verdad del contenido es Postgres.
  useEffect(() => {
    setDeviceId(getDeviceId());
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw) dispatch({ type: 'replace', state: importBackup(JSON.parse(raw)) });
    } catch {
      // Un caché corrupto no puede impedir abrir la app.
    }
    hydrated.current = true;

    void (async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = (await response.json()) as { user: SessionUser | null };
        if (data.user) {
          setUser(data.user);
          await loadProject();
        }
      } catch {
        // Sin conexión el bloqueo de red se encarga.
      } finally {
        setAuthReady(true);
      }
    })();
  }, [loadProject]);

  // Guardado: caché local siempre, servidor con sesión abierta y con un respiro
  // para no mandar una petición por cada tecla.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      // Almacenamiento lleno o bloqueado: seguimos en memoria.
    }

    if (!user) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch('/api/project', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state }),
        });
      } catch {
        setOnline(false);
      } finally {
        setSaving(false);
      }
    }, 900);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, user]);

  const refreshEntitlement = useCallback(async (): Promise<Entitlement | null> => {
    const id = getDeviceId();
    if (!id) return null;
    try {
      const response = await fetch('/api/licenses/entitlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: id }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as Entitlement;
      setEntitlement(data);
      setOnline(true);
      return data;
    } catch {
      // Sin conexión no se adivina el acceso: se muestra el bloqueo de red.
      setOnline(false);
      return null;
    }
  }, []);

  // Revalidación en cada arranque y cuando vuelve la red.
  useEffect(() => {
    void refreshEntitlement();
    const back = () => void refreshEntitlement();
    const gone = () => setOnline(false);
    window.addEventListener('online', back);
    window.addEventListener('offline', gone);
    return () => {
      window.removeEventListener('online', back);
      window.removeEventListener('offline', gone);
    };
  }, [refreshEntitlement]);

  const claim = useCallback(async () => {
    const id = getDeviceId();
    try {
      const response = await fetch('/api/licenses/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: id }),
      });
      const data = (await response.json()) as { ok: boolean };
      if (data.ok) await refreshEntitlement();
      return data.ok;
    } catch {
      setOnline(false);
      return false;
    }
  }, [refreshEntitlement]);

  const activate = useCallback(
    async (code: string) => {
      const id = getDeviceId();
      try {
        const response = await fetch('/api/licenses/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, deviceId: id }),
        });
        const data = (await response.json()) as { ok: boolean; message?: string };
        if (data.ok) await refreshEntitlement();
        return data;
      } catch {
        setOnline(false);
        return { ok: false, message: 'Necesitas conexión para desbloquear tu acceso.' };
      }
    },
    [refreshEntitlement],
  );

  const authenticate = useCallback(
    async (path: string, body: Record<string, unknown>): Promise<AuthOutcome> => {
      try {
        const response = await fetch(path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, deviceId: getDeviceId() }),
        });
        const data = (await response.json()) as {
          ok: boolean;
          user?: SessionUser;
          message?: string;
          redirectTo?: string;
        };
        if (!data.ok || !data.user) return { ok: false, message: data.message ?? 'No pudimos entrar.' };

        setUser(data.user);
        const fromServer = await loadProject();
        await refreshEntitlement();
        // El perfil del proyecto hereda nombre y correo de la cuenta: si no,
        // el tablero saluda con el marcador de posición en vez del nombre.
        const cuenta = data.user;
        dispatch({
          type: 'update',
          update: (current) => ({
            ...current,
            profile: {
              ...current.profile,
              name: current.profile.name || cuenta.name,
              email: current.profile.email || cuenta.email,
            },
          }),
        });
        // Si el servidor todavía no tiene proyecto pero este equipo ya venía
        // capturando, no se manda al usuario a repetir el diagnóstico: su
        // avance local se sube en el siguiente guardado.
        const localAnswers = Object.keys(latestState.current.answers).length;
        return { ok: true, hasProject: fromServer || localAnswers >= 12, redirectTo: data.redirectTo };
      } catch {
        setOnline(false);
        return { ok: false, message: 'Necesitas conexión para entrar a tu cuenta.' };
      }
    },
    [loadProject, refreshEntitlement],
  );

  const register = useCallback(
    (input: { name: string; email: string; password: string }) => authenticate('/api/auth/register', input),
    [authenticate],
  );

  const login = useCallback(
    (input: { email: string; password: string }) => authenticate('/api/auth/login', input),
    [authenticate],
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Aunque falle la red, en este equipo la sesión se cierra.
    }
    setUser(null);
    loadedFromServer.current = false;
    try {
      window.localStorage.removeItem(STATE_KEY);
    } catch {
      // Sin caché que limpiar.
    }
    dispatch({ type: 'replace', state: emptyProjectState() });
  }, []);

  const flash = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      patch: (patch) => dispatch({ type: 'patch', patch }),
      update: (update) => dispatch({ type: 'update', update }),
      replace: (next) => dispatch({ type: 'replace', state: next }),
      user,
      authReady,
      register,
      login,
      logout,
      saving,
      entitlement,
      refreshEntitlement,
      claim,
      activate,
      deviceId,
      online,
      can: entitlement?.capabilities ?? PENDING_CAPABILITIES,
      toast,
      flash,
    }),
    [
      state,
      user,
      authReady,
      register,
      login,
      logout,
      saving,
      entitlement,
      refreshEntitlement,
      claim,
      activate,
      deviceId,
      online,
      toast,
      flash,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return value;
}
