'use client';

import { useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { Button, Field, H, Muted, RADIUS, text } from '@/components/ui';
import type { AuthOutcome } from '@/state/store';

export type AuthMode = 'registro' | 'entrar';

/** Fuerza de la contraseña, igual que el prototipo: 0 a 4. */
function passwordStrength(pass: string): number {
  let n = 0;
  if (pass.length >= 8) n += 1;
  if (pass.length >= 12) n += 1;
  if (/[0-9]/.test(pass)) n += 1;
  if (/[^a-zA-Z0-9]/.test(pass)) n += 1;
  return Math.min(4, n);
}

const STRENGTH_LABELS = [
  'Escribe tu contraseña',
  'Muy corta todavía',
  'Va bien, súmale un número',
  'Buena',
  'Excelente',
];

const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PERKS = [
  { t: 'Tu avance se guarda solo', d: 'Cada tarea, platillo y gasto queda respaldado en tu cuenta.' },
  { t: 'Entra desde cualquier teléfono', d: 'Hasta 3 dispositivos con la misma cuenta.' },
  { t: '7 días de prueba', d: 'Sin tarjeta. Empiezas con el Costeador y tu ruta abiertos.' },
];

/**
 * Crear cuenta en 3 pasos y entrar (mensaje 1, § 2).
 *
 * El contenido vive en su propia área con scroll y el botón queda anclado en
 * una barra al fondo: así el teclado no lo empuja abajo del pliegue mientras
 * el usuario escribe.
 *
 * La cuenta se crea de verdad al salir del paso 2, que es donde el botón dice
 * "Crear mi cuenta". El paso 3 ya solo confirma.
 */
export function Auth({
  mode,
  onChangeMode,
  onBack,
  onDone,
  onRegister,
  onLogin,
}: {
  mode: AuthMode;
  onChangeMode: (mode: AuthMode) => void;
  onBack: () => void;
  /** `hasProject` decide si se salta el onboarding; `redirectTo` lo manda al panel. */
  onDone: (result: { hasProject: boolean; redirectTo?: string }) => void;
  onRegister: (input: { name: string; email: string; password: string }) => Promise<AuthOutcome>;
  onLogin: (input: { email: string; password: string }) => Promise<AuthOutcome>;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const registering = mode === 'registro';
  const first = name.trim().split(' ')[0] || '';
  const nameOk = name.trim().length >= 2;
  const mailOk = MAIL_RE.test(email.trim());
  const passOk = password.length >= 8;

  if (!registering) {
    return (
      <Login
        onBack={onBack}
        onChangeMode={onChangeMode}
        onDone={onDone}
        onLogin={onLogin}
      />
    );
  }

  const strength = passwordStrength(password);
  const stepOk = [nameOk, mailOk && passOk, true][step];
  const cta = ['Continuar', 'Crear mi cuenta', 'Conocer mi proyecto'][step];
  const foot = [
    'Al continuar aceptas los términos y el aviso de privacidad.',
    'No compartimos tu correo con nadie ni te mandamos publicidad.',
    'Toma 3 minutos y puedes cambiar tus respuestas después.',
  ][step];
  const title = [
    nameOk ? `Mucho gusto, ${first}` : 'Empecemos por tu nombre',
    'Protege tu avance',
    `¡Listo, ${first}!`,
  ][step];
  const help = [
    'Así te vamos a saludar cada vez que entres, y así firmamos los documentos que exportas.',
    'Tu correo y contraseña guardan tu proyecto en la nube. Si cambias de teléfono, entras y sigue todo ahí.',
    'Tu cuenta quedó creada. Ahora vamos a conocer tu proyecto.',
  ][step];

  const next = async () => {
    if (!stepOk || busy) return;
    if (step === 0) return setStep(1);
    if (step === 1) {
      setBusy(true);
      setError(null);
      const result = await onRegister({ name: name.trim(), email: email.trim(), password });
      setBusy(false);
      if (!result.ok) return setError(result.message ?? 'No pudimos crear tu cuenta.');
      return setStep(2);
    }
    onDone({ hasProject: false });
  };

  return (
    <Shell
      step={step}
      kicker={`Paso ${step + 1} de 3`}
      title={title}
      help={help}
      cta={cta}
      ctaDisabled={!stepOk || busy}
      busy={busy}
      foot={foot}
      error={error}
      onBack={() => (step === 0 ? onBack() : setStep(step - 1))}
      onNext={next}
    >
      {step === 0 ? (
        <div>
          <Field label="¿Cómo te llamas?" value={name} onChange={setName} placeholder="Tu nombre" />
          {nameOk ? (
            <div
              style={{
                marginTop: 14,
                padding: '15px 17px',
                borderRadius: 22,
                background: 'var(--color-accent-2-100)',
                animation: 'mrlUp .3s ease both',
              }}
            >
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, color: 'var(--color-accent-2-900)' }}>
                Mucho gusto, {first}
              </div>
              <p
                className="mrl-prose"
                style={{ margin: '5px 0 0', fontSize: 12.8, lineHeight: 1.5, color: 'var(--color-accent-2-900)' }}
              >
                A partir de aquí la app te habla por tu nombre y guarda todo lo que captures.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <Field label="Tu correo" value={email} onChange={setEmail} placeholder="tu@correo.com" type="email" />
          <div style={{ marginTop: 14 }}>
            <Field
              label="Una contraseña"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 8 caracteres"
              type="password"
            />
          </div>

          {/* Medidor de fuerza: cuatro barras. */}
          <div style={{ display: 'flex', gap: 5, marginTop: 10 }} aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background:
                    i < strength
                      ? strength <= 1
                        ? 'var(--color-accent)'
                        : strength === 2
                          ? 'var(--color-accent-400)'
                          : 'var(--color-accent-2-600)'
                      : 'var(--color-neutral-300)',
                  transition: 'background .2s ease',
                }}
              />
            ))}
          </div>
          <p style={{ margin: '7px 0 0', fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-700)' }}>
            {STRENGTH_LABELS[strength]}
          </p>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              [mailOk, 'Correo con formato válido'] as const,
              [passOk, 'Contraseña de 8 caracteres o más'] as const,
              [/[0-9]/.test(password), 'Incluye al menos un número'] as const,
            ].map(([on, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    flex: 'none',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: on ? 'var(--color-accent-2-600)' : 'var(--color-neutral-300)',
                    color: on ? 'var(--color-bg)' : 'transparent',
                    transition: 'background .2s ease',
                  }}
                >
                  <Check size={11} strokeWidth={3.6} />
                </span>
                <span
                  style={{
                    fontSize: 12.8,
                    fontWeight: on ? 700 : 400,
                    color: on ? 'var(--color-text)' : 'var(--color-neutral-600)',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <div
            style={{
              padding: 20,
              borderRadius: 28,
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              boxShadow: 'var(--shadow-md)',
              animation: 'mrlPop .4s cubic-bezier(.2,1.4,.4,1) both',
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: 'color-mix(in srgb, var(--color-bg) 24%, transparent)',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 12,
              }}
            >
              <Check size={27} strokeWidth={3.2} />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 25, lineHeight: 1.1 }}>Cuenta creada</div>
            <p className="mrl-prose" style={{ margin: '7px 0 0', fontSize: 13, lineHeight: 1.5, opacity: 0.93 }}>
              Te vamos a hacer 12 preguntas rápidas sobre tu proyecto. Con eso armamos tu diagnóstico y tu ruta
              personalizada.
            </p>
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {PERKS.map((perk) => (
              <div
                key={perk.t}
                style={{
                  display: 'flex',
                  gap: 11,
                  alignItems: 'flex-start',
                  padding: '14px 16px',
                  borderRadius: 22,
                  background: 'var(--color-neutral-100)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    flex: 'none',
                    borderRadius: '50%',
                    background: 'var(--color-accent-2-100)',
                    color: 'var(--color-accent-2-800)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Check size={14} strokeWidth={3.2} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{perk.t}</div>
                  <p
                    className="mrl-prose"
                    style={{ margin: '2px 0 0', fontSize: 12.3, lineHeight: 1.45, color: 'var(--color-neutral-700)' }}
                  >
                    {perk.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

/**
 * Marco de las pantallas de acceso: barra de tres tramos, contenido con su
 * propio scroll y el botón anclado abajo.
 */
function Shell({
  step,
  kicker,
  title,
  help,
  cta,
  ctaDisabled,
  busy,
  foot,
  error,
  onBack,
  onNext,
  children,
  extra,
}: {
  /** −1 en el inicio de sesión, que no lleva barra de pasos. */
  step: number;
  kicker: string;
  title: string;
  help: string;
  cta: string;
  ctaDisabled: boolean;
  busy: boolean;
  foot: string;
  error: string | null;
  onBack: () => void;
  onNext: () => void;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <div
        className="mrl-scroll"
        style={{ flex: 1, minHeight: 0, padding: '48px 28px 8px', display: 'flex', flexDirection: 'column' }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Atrás"
          style={{
            alignSelf: 'flex-start',
            width: 44,
            height: 44,
            borderRadius: RADIUS.pill,
            border: '1.5px solid var(--color-divider)',
            background: 'transparent',
            color: 'var(--color-text)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={18} strokeWidth={2.75} />
        </button>

        {step >= 0 ? (
          <div style={{ display: 'flex', gap: 6, marginTop: 20 }} aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: i <= step ? 'var(--color-accent)' : 'var(--color-neutral-300)',
                  transition: 'background .3s ease',
                }}
              />
            ))}
          </div>
        ) : null}

        <p
          style={{
            margin: '12px 0 3px',
            fontSize: 11,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--color-accent-700)',
          }}
        >
          {kicker}
        </p>
        <H size={30} style={{ margin: '0 0 6px' }}>
          {title}
        </H>
        <p className="mrl-prose" style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.5, color: text(65) }}>
          {help}
        </p>

        {children}

        {error ? (
          <div
            role="alert"
            style={{
              marginTop: 14,
              padding: '12px 14px',
              borderRadius: RADIUS.small,
              background: 'var(--color-accent-100)',
              color: 'var(--color-accent-900)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        {extra}

        <div style={{ height: 14, flex: 'none' }} />
      </div>

      {/* Barra anclada: el teclado no la empuja abajo del pliegue. */}
      <div
        style={{
          flex: 'none',
          padding: '12px 28px calc(22px + env(safe-area-inset-bottom, 0px))',
          background: 'var(--color-bg)',
          borderTop: '1px solid var(--color-divider)',
          display: 'flex',
          flexDirection: 'column',
          gap: 9,
        }}
      >
        <Button disabled={ctaDisabled} onClick={onNext}>
          {busy ? 'Un momento…' : cta}
        </Button>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 12, lineHeight: 1.45, color: text(55) }}>{foot}</p>
      </div>
    </div>
  );
}

/** Inicio de sesión: una sola pantalla, sin barra de pasos. */
function Login({
  onBack,
  onChangeMode,
  onDone,
  onLogin,
}: {
  onBack: () => void;
  onChangeMode: (mode: AuthMode) => void;
  onDone: (result: { hasProject: boolean; redirectTo?: string }) => void;
  onLogin: (input: { email: string; password: string }) => Promise<AuthOutcome>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = MAIL_RE.test(email.trim()) && password.length >= 8 && !busy;

  const submit = async () => {
    if (!ready) return;
    setBusy(true);
    setError(null);
    const result = await onLogin({ email: email.trim(), password });
    setBusy(false);
    if (result.ok) onDone({ hasProject: !!result.hasProject, redirectTo: result.redirectTo });
    else setError(result.message ?? 'No pudimos entrar.');
  };

  return (
    <Shell
      step={-1}
      kicker="Ya tengo cuenta"
      title="Entra a tu cuenta"
      help="Tu ruta, tus platillos y tus números están donde los dejaste."
      cta="Entrar"
      ctaDisabled={!ready}
      busy={busy}
      foot="Si cambiaste de teléfono, entra aquí: tu proyecto se descarga solo."
      error={error}
      onBack={onBack}
      onNext={submit}
      extra={
        <button
          type="button"
          onClick={() => onChangeMode('registro')}
          style={{
            marginTop: 18,
            border: 'none',
            background: 'transparent',
            color: 'var(--color-accent-700)',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            alignSelf: 'flex-start',
            padding: 0,
          }}
        >
          Todavía no tengo cuenta
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
        <Field label="Tu correo" value={email} onChange={setEmail} placeholder="tu@correo.com" type="email" />
        <Field
          label="Tu contraseña"
          value={password}
          onChange={setPassword}
          placeholder="Mínimo 8 caracteres"
          type="password"
        />
      </div>
    </Shell>
  );
}
