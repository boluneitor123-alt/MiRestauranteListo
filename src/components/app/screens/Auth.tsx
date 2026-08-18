'use client';

import { useState } from 'react';
import { Button, Field, H, Muted, ScreenHeader, text } from '@/components/ui';
import type { AuthOutcome } from '@/state/store';

export type AuthMode = 'registro' | 'entrar';

/**
 * Registro e inicio de sesión (README § 1.2), ahora contra cuentas reales.
 * La contraseña viaja a `/api/auth/*` y nunca se guarda en el equipo.
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
  /** `hasProject` decide si se salta el onboarding. */
  onDone: (result: { hasProject: boolean }) => void;
  onRegister: (input: { name: string; email: string; password: string }) => Promise<AuthOutcome>;
  onLogin: (input: { email: string; password: string }) => Promise<AuthOutcome>;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const registering = mode === 'registro';
  const ready =
    email.includes('@') && password.length >= 8 && (!registering || name.trim().length > 1) && !busy;

  const submit = async () => {
    setBusy(true);
    setError(null);
    const result = registering
      ? await onRegister({ name: name.trim(), email: email.trim(), password })
      : await onLogin({ email: email.trim(), password });
    setBusy(false);

    if (result.ok) onDone({ hasProject: !!result.hasProject });
    else setError(result.message ?? 'No pudimos entrar.');
  };

  return (
    <div>
      <ScreenHeader title="" onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '6px 24px 34px' }}>
        <H size={30}>{registering ? 'Crea tu cuenta' : 'Entra a tu cuenta'}</H>
        <Muted size={14} style={{ marginTop: 6 }}>
          {registering
            ? 'Con esto guardamos tu avance y lo recuperas en cualquier equipo.'
            : 'Tu ruta, tus platillos y tus números están donde los dejaste.'}
        </Muted>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) void submit();
          }}
        >
          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
            {registering ? (
              <Field label="Tu nombre" value={name} onChange={setName} placeholder="Tu nombre" />
            ) : null}
            <Field
              label="Correo"
              type="email"
              inputMode="email"
              value={email}
              onChange={setEmail}
              placeholder="tu@correo.com"
            />
            <Field
              label="Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {error ? (
            <Muted size={13} style={{ marginTop: 12, color: 'var(--color-accent-800)' }}>
              {error}
            </Muted>
          ) : null}

          <div style={{ marginTop: 24 }}>
            <Button type="submit" disabled={!ready}>
              {busy ? 'Un momento…' : registering ? 'Crear mi cuenta' : 'Entrar'}
            </Button>
          </div>
        </form>

        <button
          type="button"
          onClick={() => {
            onChangeMode(registering ? 'entrar' : 'registro');
            setError(null);
          }}
          style={{
            marginTop: 16,
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-accent-700)',
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          {registering ? 'Ya tengo cuenta, quiero entrar' : 'No tengo cuenta, quiero crearla'}
        </button>

        <Muted size={12} style={{ marginTop: 16, color: text(45) }}>
          {registering
            ? 'Al continuar aceptas los términos y el aviso de privacidad. Tus datos son tuyos: puedes descargarlos o borrarlos cuando quieras.'
            : 'Si olvidaste tu contraseña, escríbenos y te ayudamos a recuperar tu acceso.'}
        </Muted>
      </div>
    </div>
  );
}
