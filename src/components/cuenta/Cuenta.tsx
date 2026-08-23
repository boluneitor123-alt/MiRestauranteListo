'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Laptop, Lock, Mail, Smartphone, Tablet, User } from 'lucide-react';
import { useStore } from '@/state/store';
import { GUARANTEE_SHORT, LAUNCH } from '@/content/landing';

/**
 * Crear cuenta · iniciar sesión · recuperar acceso (entrega-v2 § "Flujo de
 * autenticación").
 *
 * Vive en su propia ruta, fuera de la app: antes era una pantalla interna de
 * `/app`, y eso hacía que salir con el botón de atrás dejara al usuario dentro
 * de la sesión anterior.
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
  ['Muy corta', 'var(--color-danger)'],
  ['Débil', 'var(--color-danger)'],
  ['Aceptable', 'var(--color-warn-700)'],
  ['Buena', 'var(--color-accent-2-700)'],
  ['Excelente', 'var(--color-accent-2-700)'],
];

const VENTAJAS = [
  [`${LAUNCH.trialDays} DÍAS SIN RIESGO`, 'Pruébala completa antes de pagar nada.'],
  ['SIN TARJETA', 'No pedimos tarjeta para la prueba.'],
  ['ACCESO INMEDIATO', 'Empieza a usarlo al instante.'],
] as const;

const EQUIPOS = [
  { label: 'Celular', icon: Smartphone },
  { label: 'Tablet', icon: Tablet },
  { label: 'Computadora', icon: Laptop },
] as const;

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

  return (
    <div className="cta-page">
      <div className="cta-wrap">
        <section className="cta-hero">
          <a href="/" className="cta-marca">
            <span className="cta-logo">MRL</span>
            <span>
              Mi<b>Restaurante</b>Listo
            </span>
          </a>

          <h1 className="cta-h1">
            Tu restaurante
            <br />
            empieza aquí.
          </h1>
          <p className="cta-sub">
            Crea tu cuenta y accede a todas las herramientas, calculadoras y pasos para abrir tu negocio de comida con
            números reales.
          </p>

          <ul className="cta-ventajas">
            {VENTAJAS.map(([titulo, texto]) => (
              <li key={titulo}>
                <span className="cta-check">
                  <Check size={14} strokeWidth={3.4} />
                </span>
                <span>
                  <b>{titulo}</b>
                  <span>{texto}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="cta-garantia">{GUARANTEE_SHORT}</p>
        </section>

        <section className="cta-card">
          <div className="cta-tabs">
            <button type="button" className={esSignup ? 'on' : ''} onClick={() => ir('signup')}>
              Crear cuenta
            </button>
            <button type="button" className={esLogin ? 'on' : ''} onClick={() => ir('login')}>
              Iniciar sesión
            </button>
          </div>

          <form onSubmit={enviar} className="cta-form">
            <h2 className="cta-h2">
              {esSignup ? 'Crea tu cuenta' : esLogin ? 'Bienvenido de vuelta' : 'Recupera tu acceso'}
            </h2>
            <p className="cta-h2-sub">
              {esSignup
                ? `Empieza tu prueba gratuita de ${LAUNCH.trialDays} días, sin tarjeta de crédito.`
                : esLogin
                  ? 'Entra con tu correo y tu contraseña.'
                  : 'Escríbenos con el correo de tu cuenta y te ayudamos a recuperarla a mano.'}
            </p>

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
                    <span key={i} style={{ background: i < fuerza ? STRENGTH[fuerza][1] : 'var(--color-neutral-300)' }} />
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

            <button type="submit" className="cta-cta" disabled={busy}>
              {busy
                ? esSignup
                  ? 'Creando tu cuenta…'
                  : 'Entrando…'
                : esSignup
                  ? 'Crear mi cuenta'
                  : esLogin
                    ? 'Iniciar sesión'
                    : 'Escribir a soporte'}
              {busy ? null : <ArrowRight size={19} strokeWidth={2.8} />}
            </button>

            {esReset ? (
              <button type="button" className="cta-link cta-centro" onClick={() => ir('login')}>
                Volver a iniciar sesión
              </button>
            ) : null}
          </form>

          {esSignup ? (
            <p className="cta-legal">
              {/* Enlaces dentro de una línea de texto: la excepción documentada al mínimo de 44px. */}
              Al crear tu cuenta aceptas nuestros{' '}
              <a className="mrl-inline" href="/#faq">
                Términos de uso
              </a>{' '}
              y la{' '}
              <a className="mrl-inline" href="/#faq">
                Política de privacidad
              </a>
              .
            </p>
          ) : null}

          <div className="cta-equipos">
            <div className="cta-equipos-t">Accede desde cualquier dispositivo:</div>
            <div className="cta-equipos-l">
              {EQUIPOS.map(({ label, icon: Icono }) => (
                <div key={label}>
                  <Icono size={30} strokeWidth={1.7} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {esLogin ? (
            <p className="cta-pie">
              ¿Aún no tienes cuenta?{' '}
              <button type="button" className="cta-link" onClick={() => ir('signup')}>
                Crear cuenta
              </button>
            </p>
          ) : null}
        </section>
      </div>
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
      <div className="cta-campo" style={error ? { borderColor: 'var(--color-danger)' } : undefined}>
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
