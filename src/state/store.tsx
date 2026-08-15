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

interface StoreValue {
  state: ProjectState;
  patch: (patch: Partial<ProjectState>) => void;
  update: (update: (state: ProjectState) => ProjectState) => void;
  replace: (state: ProjectState) => void;
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
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  // Caché local de lo capturado. El servidor es la fuente para el acceso, no
  // para el contenido: sin conexión la app se bloquea igual (README § 1.12).
  useEffect(() => {
    setDeviceId(getDeviceId());
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw) dispatch({ type: 'replace', state: importBackup(JSON.parse(raw)) });
    } catch {
      // Un caché corrupto no puede impedir abrir la app.
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      // Almacenamiento lleno o bloqueado: seguimos en memoria.
    }
  }, [state]);

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
    [state, entitlement, refreshEntitlement, claim, activate, deviceId, online, toast, flash],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return value;
}
