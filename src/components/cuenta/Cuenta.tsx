'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useStore } from '@/state/store';
import { GUARANTEE_SHORT, LAUNCH } from '@/content/landing';
import { Arrow, Check, Ilustracion, Uline } from '@/components/landing/pieces';

/**
 * Crear cuenta · iniciar sesión · recuperar acceso (entrega-v2 § "Flujo de
 * autenticación").
 *
 * Vive en su propia ruta, fuera de la app: antes era una pantalla interna de
 * `/app`, y eso hacía que salir con el botón de atrás dejara al usuario dentro
 * de la sesión anterior.
 *
 * Habla el idioma visual de la landing —crema, borde de tinta, sombra dura,
 * display Archivo y notas a mano— y por eso reutiliza `landing.css` en vez de
 * los tokens de la app: quien llega aquí viene de la página de venta y no
 * debería sentir que cambió de sitio.
 *
 * Crear cuenta e iniciar sesión no son pestañas dentro de una tarjeta: son dos
 * estados de la misma página, y el cambio entre uno y otro vive en el
 * encabezado.
 *
 * Sólo correo. Google y Apple entran cuando haya OAuth de verdad configurado;
 * un botón que no lleva a ningún lado es peor que no tenerlo.
 */

export type CuentaVista = 'signup' | 'login' | 'reset';

const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Fuerza de la contraseña, igual que el prototipo: 0 a 4. */
export function passwordStrength(pass: string): number {
  let n = 0;
  if (pass.length >= 8) n += 1;
  if (pass.length >= 12) n += 1;
  if (/[0-9]/.test(pass)) n += 1;
  if (/[^a-zA-Z0-9]/.test(pass)) n += 1;
  return Math.min(4, n);
}

const STRENGTH: Array<[string, string]> = [
  ['Muy corta', 'var(--rose-d)'],
  ['Débil', 'var(--rose-d)'],
  ['Aceptable', 'var(--amber-d)'],
  ['Buena', 'var(--sage-d)'],
  ['Excelente', 'var(--sage-d)'],
];

/** Los tres pasos que faltan para estar dentro. El primero es esta pantalla. */
const PASOS = ['Cuenta', 'Tu restaurante', 'Tu ruta'] as const;

/** Lo que Arnold ya trae resuelto en su libreta, al lado del dibujo. */
const PALOMEOS = ['Tengo la idea', 'Hacer mis números', 'Preparar mi apertura'] as const;

/**
 * Lo que cambia entre un estado y otro: el rótulo, el titular con su palabra
 * subrayada, la línea de apoyo y la nota a mano de Arnold. El esqueleto es el
 * mismo en los tres.
 */
const TEXTOS: Record<CuentaVista, { etiqueta: string; titulo: string; palabra: string; apoyo: string; nota: string }> = {
  signup: {
    etiqueta: 'Bienvenido a tu ruta',
    titulo: 'Tu restaurante empieza',
    palabra: 'aquí.',
    apoyo: `Crea tu cuenta y empieza tu prueba de ${LAUNCH.trialDays} días, sin tarjeta de crédito.`,
    nota: 'Vamos paso a paso.',
  },
  login: {
    etiqueta: 'Qué bueno verte de nuevo',
    titulo: 'Continúa donde',
    palabra: 'lo dejaste.',
    apoyo: 'Entra con tu correo y tu contraseña.',
    nota: 'Seguimos donde lo dejamos.',
  },
  reset: {
    etiqueta: 'Recuperar mi acceso',
    titulo: 'Recupera tu',
    palabra: 'acceso.',
    apoyo: 'Escríbenos con el correo de tu cuenta y te ayudamos a recuperarla a mano.',
    nota: 'Vamos paso a paso.',
  },
};

export function Cuenta({ vistaInicial }: { vistaInicial: CuentaVista }) {
  const { register, login, user, authReady } = useStore();
  const [vista, setVista] = useState<CuentaVista>(vistaInicial);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [pass, setPass] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [tocado, setTocado] = useState({ nombre: false, correo: false, pass: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // El hash decide la vista, para poder enlazar directo a "iniciar sesión".
  useEffect(() => {
    const h = (window.location.hash || '').replace('#', '');
    if (h === 'login' || h === 'signup' || h === 'reset') setVista(h);
  }, []);

  // Con sesión abierta esta página no tiene nada que hacer.
  useEffect(() => {
    if (authReady && user) window.location.href = '/app';
  }, [authReady, user]);

  const esSignup = vista === 'signup';
  const esLogin = vista === 'login';
  const esReset = vista === 'reset';

  const nombreOk = nombre.trim().length >= 2;
  const correoOk = MAIL_RE.test(correo.trim());
  const passOk = pass.length >= 8;

  const errNombre = esSignup && tocado.nombre && !nombreOk ? 'Escribe tu nombre.' : '';
  const errCorreo = tocado.correo && !correoOk ? (correo.trim() ? 'Ese correo no se ve bien. Revísalo.' : 'Escribe tu correo.') : '';
  const errPass = esSignup && tocado.pass && !passOk ? 'Usa al menos 8 caracteres.' : esLogin && tocado.pass && !pass ? 'Escribe tu contraseña.' : '';

  const puede = esReset ? correoOk : esSignup ? nombreOk && correoOk && passOk : correoOk && !!pass;

  const ir = (v: CuentaVista) => {
    setVista(v);
    setError('');
    setTocado({ nombre: false, correo: false, pass: false });
    try {
      window.history.replaceState(null, '', `#${v}`);
    } catch {
      /* sin historial, la vista igual cambia */
    }
  };

  const enviar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTocado({ nombre: true, correo: true, pass: true });
    if (!puede || busy) return;

    if (esReset) {
      // Todavía no hay correo de recuperación: se dice, no se simula.
      setError('');
      setVista('reset');
      setBusy(false);
      window.location.href = `mailto:hola@mirestaurantelisto.com?subject=${encodeURIComponent(
        'Recuperar mi acceso',
      )}&body=${encodeURIComponent(`Mi correo de la cuenta es: ${correo.trim()}`)}`;
      return;
    }

    setBusy(true);
    setError('');
    const r = esSignup
      ? await register({ name: nombre.trim(), email: correo.trim(), password: pass })
      : await login({ email: correo.trim(), password: pass });
    setBusy(false);

    if (!r.ok) {
      setError(r.message ?? 'No pudimos entrar. Inténtalo otra vez.');
      return;
    }
    // El servidor decide: una cuenta de administración va al panel.
    window.location.href = r.redirectTo && r.redirectTo !== '/app' ? r.redirectTo : '/app';
  };

  const fuerza = passwordStrength(pass);
  const t = TEXTOS[vista];

  return (
    <div className="lp cta-page">
      <header className="lp-head">
        <div>
          <a href="/" className="lp-marca">
            <span>MRL</span>
            <span>
              Mi<span style={{ color: 'var(--orange-texto)' }}>Restaurante</span>Listo
            </span>
          </a>

          {/*
            El cambio de estado vive aquí, no en unas pestañas dentro de la
            tarjeta: la página entera cambia, no una parte de ella.
          */}
          <div className="cta-cambio">
            <span>{esSignup ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}</span>
            {esSignup ? (
              <button type="button" className="lp-btn" onClick={() => ir('login')}>
                Iniciar sesión
              </button>
            ) : (
              <button type="button" className="lp-btn lp-btn-amber" onClick={() => ir('signup')}>
                Crear cuenta
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="lp-sec cta-sec">
        <p className="cta-etiqueta">{t.etiqueta}</p>

        <h1 className="cta-h1">
          {t.titulo}{' '}
          <span className="lp-uwrap" style={{ color: 'var(--orange-display)' }}>
            {t.palabra}
            <Uline color="#1C1A17" />
          </span>
        </h1>

        <p className="cta-apoyo">{t.apoyo}</p>

        {/* El camino completo, para que se vea que esto es el primer paso de tres. */}
        <ol className="cta-pasos" aria-label="Pasos para entrar">
          {PASOS.map((paso, i) => (
            <li key={paso} className={i === 0 ? 'on' : ''} aria-current={i === 0 ? 'step' : undefined}>
              {paso}
            </li>
          ))}
        </ol>

        <div className="cta-split">
          <div className="cta-card">
            <form onSubmit={enviar} className="cta-form">
              {esSignup ? (
                <Campo
                  id="cta-nombre"
                  icono={<User size={20} />}
                  type="text"
                  autoComplete="name"
                  label="Nombre completo"
                  value={nombre}
                  error={errNombre}
                  onChange={setNombre}
                  onBlur={() => setTocado((t) => ({ ...t, nombre: true }))}
                />
              ) : null}

              <Campo
                id="cta-correo"
                icono={<Mail size={20} />}
                type="email"
                autoComplete="email"
                label="Correo electrónico"
                value={correo}
                error={errCorreo}
                onChange={setCorreo}
                onBlur={() => setTocado((t) => ({ ...t, correo: true }))}
              />

              {!esReset ? (
                <Campo
                  id="cta-pass"
                  icono={<Lock size={20} />}
                  type={verPass ? 'text' : 'password'}
                  autoComplete={esSignup ? 'new-password' : 'current-password'}
                  label={esSignup ? 'Crea una contraseña' : 'Contraseña'}
                  value={pass}
                  error={errPass}
                  onChange={setPass}
                  onBlur={() => setTocado((t) => ({ ...t, pass: true }))}
                  accion={
                    <button
                      type="button"
                      aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="cta-ojo"
                      onClick={() => setVerPass((v) => !v)}
                    >
                      {verPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  }
                />
              ) : null}

              {esSignup && pass ? (
                <div className="cta-fuerza">
                  <span>
                    Seguridad: <b style={{ color: STRENGTH[fuerza][1] }}>{STRENGTH[fuerza][0]}</b>
                  </span>
                  <span className="cta-barras">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} style={{ background: i < fuerza ? STRENGTH[fuerza][1] : 'var(--cream-2)' }} />
                    ))}
                  </span>
                </div>
              ) : null}

              {esLogin ? (
                <button type="button" className="cta-link" onClick={() => ir('reset')}>
                  ¿Olvidaste tu contraseña?
                </button>
              ) : null}

              {error ? (
                <div role="alert" className="cta-error">
                  {error}
                </div>
              ) : null}

              <button type="submit" className="lp-cta" disabled={busy}>
                {busy
                  ? esSignup
                    ? 'Creando tu cuenta…'
                    : 'Entrando…'
                  : esSignup
                    ? 'Crear mi cuenta'
                    : esLogin
                      ? 'Iniciar sesión'
                      : 'Escribir a soporte'}
                {busy ? null : <Arrow size={19} />}
              </button>

              {esReset ? (
                <button type="button" className="cta-link" onClick={() => ir('login')}>
                  Volver a iniciar sesión
                </button>
              ) : null}
            </form>

            {esSignup ? (
              <p className="cta-legal">
                {/* Enlaces dentro de una frase: la excepción documentada al mínimo de 44px. */}
                Al crear tu cuenta aceptas nuestros{' '}
                <a className="mrl-inline" href="/terminos">
                  Términos de uso
                </a>{' '}
                y la{' '}
                <a className="mrl-inline" href="/privacidad">
                  Política de privacidad
                </a>
                .
              </p>
            ) : null}
          </div>

          <aside className="cta-arnold">
            <div className="cta-arnold-fila">
              {/*
                El envoltorio no sobra: `Ilustracion` monta un `<picture>` con
                `display: contents`, y dentro de una rejilla eso convierte a
                sus `<source>` en celdas vacías que corren el dibujo de lugar.
              */}
              <div className="cta-arnold-ilo">
                <Ilustracion
                  nombre="arnold-hero"
                  alt="Arnold con su libreta, listo para empezar su plan"
                  ancho={1000}
                  alto={833}
                  sizes="(max-width: 560px) 34vw, 120px"
                />
              </div>
              <ul className="cta-palomeos">
                {PALOMEOS.map((texto) => (
                  <li key={texto}>
                    <Check size={19} />
                    {texto}
                  </li>
                ))}
              </ul>
            </div>
            <p className="lp-hand cta-nota">{t.nota}</p>
            <p className="cta-garantia">{GUARANTEE_SHORT}</p>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Campo({
  id,
  icono,
  label,
  value,
  error,
  type,
  autoComplete,
  accion,
  onChange,
  onBlur,
}: {
  id: string;
  icono: React.ReactNode;
  label: string;
  value: string;
  error: string;
  type: string;
  autoComplete: string;
  accion?: React.ReactNode;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <div>
      <div className="cta-campo" style={error ? { borderColor: 'var(--rose-d)' } : undefined}>
        <span className="cta-campo-i">{icono}</span>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          aria-label={label}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        {accion}
      </div>
      {error ? (
        <div role="alert" className="cta-campo-err">
          {error}
        </div>
      ) : null}
    </div>
  );
}
