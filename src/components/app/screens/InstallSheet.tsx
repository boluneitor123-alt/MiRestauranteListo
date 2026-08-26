'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import type { PlatformInfo } from '@/lib/device';
import { Button, RADIUS } from '@/components/ui';

/** El evento de Chrome que permite instalar sin salir de la página. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

/** Recuerda que el usuario dijo "después, gracias": no se le vuelve a preguntar. */
const DISMISSED_KEY = 'mrl.install.dismissed.v1';

export function installDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISSED_KEY, '1');
  } catch {
    /* Sin almacenamiento la hoja vuelve a salir; es preferible a romper la app. */
  }
}

/**
 * Guarda el evento `beforeinstallprompt` que dispara Chrome antes de que la
 * app pueda ofrecerse a instalar. Sin él no hay botón nativo.
 */
export function useInstallPrompt(): InstallPromptEvent | null {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  return prompt;
}

/** Los pasos cambian por dispositivo (mensaje 1, § 2). */
function steps(platform: PlatformInfo): { n: string; t: string; d: string }[] {
  if (platform.os === 'iOS' || platform.os === 'iPadOS') {
    return [
      { n: '1', t: 'Toca el botón Compartir', d: 'El cuadro con la flecha hacia arriba, abajo en Safari.' },
      { n: '2', t: 'Elige “Agregar a inicio”', d: 'Baja un poco en la lista de opciones.' },
      { n: '3', t: 'Toca Agregar', d: 'El ícono queda junto a tus otras apps.' },
    ];
  }
  if (platform.kind === 'desktop') {
    return [
      { n: '1', t: 'Busca el ícono de instalar', d: `A la derecha de la barra de direcciones, en ${platform.browser}.` },
      { n: '2', t: 'Confirma Instalar', d: 'Se abre en su propia ventana.' },
    ];
  }
  return [
    { n: '1', t: 'Toca Instalar aquí abajo', d: 'Tu navegador te va a pedir confirmar.' },
    { n: '2', t: 'Confirma Instalar', d: `Si no aparece: menú de ${platform.browser} › Instalar app.` },
  ];
}

/**
 * Hoja de instalación PWA (mensaje 1, § 2).
 *
 * Se marca al terminar de crear la cuenta pero APARECE cuando el usuario
 * llega al tablero, no en medio del onboarding. Tres condiciones para no
 * molestar, que resuelve `shouldShowInstallSheet`:
 *
 *   1. no aparece si ya está instalada
 *   2. no vuelve si dijo "después, gracias"
 *   3. el botón nativo solo se muestra donde el navegador lo permite
 */
export function shouldShowInstallSheet(platform: PlatformInfo, pending: boolean): boolean {
  return pending && !platform.installed && !installDismissed();
}

export function InstallSheet({
  platform,
  onClose,
  onFlash,
}: {
  platform: PlatformInfo;
  onClose: () => void;
  onFlash: (message: string) => void;
}) {
  const prompt = useInstallPrompt();
  // iOS nunca dispara beforeinstallprompt: ahí solo se explican los pasos.
  const canPromptNatively = !!prompt && platform.os !== 'iOS' && platform.os !== 'iPadOS';

  const install = async () => {
    if (!prompt) return onFlash('Sigue los pasos de arriba para instalarla');
    await prompt.prompt();
    onFlash('Confirma la instalación en el aviso de tu navegador');
    rememberDismissal();
    onClose();
  };

  const later = () => {
    rememberDismissal();
    onFlash('Puedes instalarla después desde Más');
    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 78,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: 'color-mix(in srgb, var(--color-text) 46%, transparent)',
        animation: 'mrlFade .2s ease both',
      }}
    >
      <div
        style={{
          background: 'var(--color-neutral-100)',
          borderRadius: '34px 34px 0 0',
          padding: '26px 22px calc(30px + env(safe-area-inset-bottom, 0px))',
          boxShadow: 'var(--shadow-lg)',
          animation: 'mrlUp .32s cubic-bezier(.2,1.1,.3,1) both',
          maxHeight: '86%',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--color-accent-100)',
            color: 'var(--color-accent-800)',
            display: 'grid',
            placeItems: 'center',
            marginBottom: 13,
          }}
        >
          <Smartphone size={26} strokeWidth={2.75} />
        </div>

        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 25, lineHeight: 1.1 }}>
          {platform.kind === 'desktop' ? 'Ténla a un clic' : 'Ponla en tu pantalla de inicio'}
        </div>
        <p className="mrl-prose" style={{ margin: '7px 0 16px', fontSize: 13.2, lineHeight: 1.55, color: 'var(--color-neutral-700)' }}>
          {platform.kind === 'desktop'
            ? 'Instálala como aplicación y ábrela desde tu escritorio, sin buscar la pestaña.'
            : 'Instalada abre en un toque, a pantalla completa y sin la barra del navegador. Es la forma en que la vas a usar todos los días en tu negocio.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {steps(platform).map((step) => (
            <div key={step.n} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  flex: 'none',
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  color: 'var(--color-bg)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {step.n}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{step.t}</div>
                <p
                  className="mrl-prose"
                  style={{ margin: '2px 0 0', fontSize: 12.3, lineHeight: 1.45, color: 'var(--color-neutral-700)' }}
                >
                  {step.d}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
          {canPromptNatively ? <Button onClick={install}>Instalar ahora</Button> : null}
          <button
            type="button"
            onClick={later}
            style={{
              minHeight: 44,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-neutral-700)',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              borderRadius: RADIUS.pill,
            }}
          >
            Después, gracias
          </button>
        </div>
      </div>
    </div>
  );
}
