import { describe, expect, it } from 'vitest';
import { AuthService, SESSION_DAYS } from '../service';
import { MemoryAuthStore } from '../memoryStore';
import { hashPassword, isValidEmail, normalizeEmail, verifyPassword } from '../passwords';

const NOW = Date.UTC(2026, 0, 10);
const DAY = 86_400_000;

function setup() {
  const store = new MemoryAuthStore();
  let now = NOW;
  const service = new AuthService(store, () => now);
  return { store, service, advance: (ms: number) => (now += ms) };
}

const cuenta = { name: 'Ana Rodríguez', email: 'Ana@Correo.com ', password: 'secreto-largo' };

describe('hash de contraseñas', () => {
  it('nunca guarda la contraseña en claro', async () => {
    const hash = await hashPassword('secreto-largo');
    expect(hash).not.toContain('secreto-largo');
    expect(hash.startsWith('scrypt$')).toBe(true);
  });

  it('da un hash distinto cada vez y aun así verifica', async () => {
    const a = await hashPassword('secreto-largo');
    const b = await hashPassword('secreto-largo');
    expect(a).not.toBe(b);
    expect(await verifyPassword('secreto-largo', a)).toBe(true);
    expect(await verifyPassword('secreto-largo', b)).toBe(true);
  });

  it('rechaza la contraseña equivocada y los hashes corruptos', async () => {
    const hash = await hashPassword('secreto-largo');
    expect(await verifyPassword('otra-cosa', hash)).toBe(false);
    expect(await verifyPassword('secreto-largo', 'basura')).toBe(false);
    expect(await verifyPassword('secreto-largo', '')).toBe(false);
  });

  it('normaliza correos', () => {
    expect(normalizeEmail(' Ana@Correo.com ')).toBe('ana@correo.com');
    expect(isValidEmail('ana@correo.com')).toBe(true);
    expect(isValidEmail('ana@correo')).toBe(false);
    expect(isValidEmail('sin-arroba.com')).toBe(false);
  });
});

describe('registro', () => {
  it('crea la cuenta y deja la sesión abierta', async () => {
    const { service } = setup();
    const result = await service.register(cuenta);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.email).toBe('ana@correo.com');
    expect(result.user.name).toBe('Ana Rodríguez');
    expect(result.expiresAt).toBe(NOW + SESSION_DAYS * DAY);
    expect(await service.userFromToken(result.token)).toMatchObject({ email: 'ana@correo.com' });
  });

  it('no permite dos cuentas con el mismo correo, aunque cambie el formato', async () => {
    const { service } = setup();
    await service.register(cuenta);
    const repetida = await service.register({ ...cuenta, email: 'ANA@correo.com' });

    expect(repetida).toMatchObject({ ok: false, error: 'correo-ocupado' });
  });

  it('valida nombre, correo y largo de contraseña', async () => {
    const { service } = setup();
    expect(await service.register({ ...cuenta, name: '  ' })).toMatchObject({ error: 'nombre-requerido' });
    expect(await service.register({ ...cuenta, email: 'no-es-correo' })).toMatchObject({ error: 'correo-invalido' });
    expect(await service.register({ ...cuenta, password: 'corta' })).toMatchObject({ error: 'contrasena-corta' });
  });

  it('guarda la contraseña hasheada, nunca en claro', async () => {
    const { service, store } = setup();
    await service.register(cuenta);
    const user = await store.findUserByEmail('ana@correo.com');
    expect(user?.passwordHash).not.toContain('secreto-largo');
  });
});

describe('inicio de sesión', () => {
  it('entra con las credenciales correctas', async () => {
    const { service } = setup();
    await service.register(cuenta);
    const result = await service.login({ email: 'ana@correo.com', password: 'secreto-largo' });

    expect(result.ok).toBe(true);
    if (result.ok) expect(await service.userFromToken(result.token)).toBeDefined();
  });

  it('no dice si el correo existe o no', async () => {
    const { service } = setup();
    await service.register(cuenta);

    const malaContrasena = await service.login({ email: 'ana@correo.com', password: 'equivocada' });
    const correoInexistente = await service.login({ email: 'nadie@correo.com', password: 'secreto-largo' });

    expect(malaContrasena).toMatchObject({ ok: false, error: 'credenciales-invalidas' });
    expect(correoInexistente).toMatchObject({ ok: false, error: 'credenciales-invalidas' });
    if (!malaContrasena.ok && !correoInexistente.ok) {
      expect(malaContrasena.message).toBe(correoInexistente.message);
    }
  });
});

describe('sesiones', () => {
  it('cerrar sesión invalida el token de verdad', async () => {
    const { service } = setup();
    const result = await service.register(cuenta);
    if (!result.ok) throw new Error('registro falló');

    await service.logout(result.token);
    expect(await service.userFromToken(result.token)).toBeUndefined();
  });

  it('una sesión vencida ya no vale', async () => {
    const { service, advance } = setup();
    const result = await service.register(cuenta);
    if (!result.ok) throw new Error('registro falló');

    advance(SESSION_DAYS * DAY - 1);
    expect(await service.userFromToken(result.token)).toBeDefined();

    advance(2);
    expect(await service.userFromToken(result.token)).toBeUndefined();
  });

  it('ignora tokens inventados', async () => {
    const { service } = setup();
    expect(await service.userFromToken('token-inventado')).toBeUndefined();
    expect(await service.userFromToken(undefined)).toBeUndefined();
  });

  it('recuerda desde qué equipo se inició sesión', async () => {
    const { service } = setup();
    const result = await service.register({ ...cuenta, deviceId: 'eq-1' });
    if (!result.ok) throw new Error('registro falló');

    expect((await service.sessionFromToken(result.token))?.deviceId).toBe('eq-1');
  });
});

describe('rol de la cuenta (LEEME: nunca una lista en el cliente)', () => {
  const conDueño = async (ownerEmail: string | undefined, email: string) => {
    const previo = process.env.OWNER_EMAIL;
    if (ownerEmail === undefined) delete process.env.OWNER_EMAIL;
    else process.env.OWNER_EMAIL = ownerEmail;
    try {
      const service = new AuthService(new MemoryAuthStore());
      const result = await service.register({ name: 'Quien sea', email, password: 'contrasena-larga' });
      return result.ok ? result.user.role : null;
    } finally {
      if (previo === undefined) delete process.env.OWNER_EMAIL;
      else process.env.OWNER_EMAIL = previo;
    }
  };

  it('crea toda cuenta nueva como owner', async () => {
    expect(await conDueño(undefined, 'ana@tacosana.mx')).toBe('owner');
  });

  it('marca como admin sólo el correo del dueño de la variable de entorno', async () => {
    expect(await conDueño('jefa@mirestaurantelisto.com', 'jefa@mirestaurantelisto.com')).toBe('admin');
    expect(await conDueño('jefa@mirestaurantelisto.com', 'ana@tacosana.mx')).toBe('owner');
  });

  it('no distingue mayúsculas ni espacios en el correo del dueño', async () => {
    expect(await conDueño('  Jefa@MiRestauranteListo.com ', 'jefa@mirestaurantelisto.com')).toBe('admin');
  });

  it('sin OWNER_EMAIL no hay admins automáticos', async () => {
    expect(await conDueño('', 'jefa@mirestaurantelisto.com')).toBe('owner');
  });
});

describe('el rol se revisa en cada entrada, no sólo al registrarse', () => {
  const CUENTA = { name: 'Jefa', email: 'jefa@mirestaurantelisto.com', password: 'contrasena-larga' };

  /** Registra con un OWNER_EMAIL y entra con otro. */
  const registrarYEntrar = async (alRegistrar: string | undefined, alEntrar: string | undefined) => {
    const previo = process.env.OWNER_EMAIL;
    const poner = (v: string | undefined) => {
      if (v === undefined) delete process.env.OWNER_EMAIL;
      else process.env.OWNER_EMAIL = v;
    };
    try {
      const store = new MemoryAuthStore();
      const service = new AuthService(store);
      poner(alRegistrar);
      const registro = await service.register(CUENTA);
      if (!registro.ok) throw new Error('registro falló');
      poner(alEntrar);
      const entrada = await service.login({ email: CUENTA.email, password: CUENTA.password });
      if (!entrada.ok) throw new Error('entrada falló');
      const guardado = await store.findUserByEmail(CUENTA.email);
      return { registro: registro.user.role, sesion: entrada.user.role, guardado: guardado?.role };
    } finally {
      poner(previo);
    }
  };

  it('promueve la cuenta que se registró antes de configurar OWNER_EMAIL', async () => {
    // Es el caso real: la cuenta existía desde antes y quedó congelada.
    const r = await registrarYEntrar(undefined, CUENTA.email);
    expect(r.registro).toBe('owner');
    expect(r.sesion).toBe('admin');
    expect(r.guardado).toBe('admin');
  });

  it('degrada al que dejó de ser el dueño cuando la variable cambia', async () => {
    const r = await registrarYEntrar(CUENTA.email, 'otra@mirestaurantelisto.com');
    expect(r.registro).toBe('admin');
    expect(r.sesion).toBe('owner');
    expect(r.guardado).toBe('owner');
  });

  it('con OWNER_EMAIL sin configurar no toca el rol guardado', async () => {
    // Un despliegue al que se le olvidó la variable no debe dejar sin panel al
    // dueño: no hay pantalla para devolverle el acceso.
    const r = await registrarYEntrar(CUENTA.email, undefined);
    expect(r.registro).toBe('admin');
    expect(r.sesion).toBe('admin');
    expect(r.guardado).toBe('admin');

    const vacia = await registrarYEntrar(CUENTA.email, '');
    expect(vacia.guardado).toBe('admin');
  });

  it('deja en paz a quien ya tiene el rol correcto', async () => {
    expect((await registrarYEntrar(CUENTA.email, CUENTA.email)).guardado).toBe('admin');
    expect((await registrarYEntrar('otra@x.mx', 'otra@x.mx')).guardado).toBe('owner');
  });
});
