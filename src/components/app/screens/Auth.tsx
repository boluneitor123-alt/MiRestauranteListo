'use client';

import { useState } from 'react';
import { Button, Field, H, Muted, ScreenHeader } from '@/components/ui';

/** Registro (README § 1.2). */
export function Auth({
  defaultName,
  onBack,
  onSubmit,
}: {
  defaultName: string;
  onBack: () => void;
  onSubmit: (data: { name: string; email: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const ready = name.trim().length > 1 && email.includes('@') && password.length >= 6;

  return (
    <div>
      <ScreenHeader title="" onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '6px 24px 34px' }}>
        <H size={30}>Crea tu cuenta</H>
        <Muted size={14} style={{ marginTop: 6 }}>
          Con esto guardamos tu avance y lo recuperas en cualquier equipo.
        </Muted>

        <div style={{ marginTop: 22, display: 'grid', gap: 14 }}>
          <Field label="Tu nombre" value={name} onChange={setName} placeholder={defaultName || 'Tu nombre'} />
          <Field label="Correo" type="email" inputMode="email" value={email} onChange={setEmail} placeholder="tu@correo.com" />
          <Field label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" />
        </div>

        <div style={{ marginTop: 24 }}>
          <Button disabled={!ready} onClick={() => onSubmit({ name: name.trim(), email: email.trim() })}>
            Continuar
          </Button>
        </div>

        <Muted size={12} style={{ marginTop: 14 }}>
          Al continuar aceptas los términos y el aviso de privacidad. Tus datos son tuyos: puedes descargarlos o
          borrarlos cuando quieras.
        </Muted>
      </div>
    </div>
  );
}
