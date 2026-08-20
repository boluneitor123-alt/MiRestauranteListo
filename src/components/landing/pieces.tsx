'use client';

import type { CSSProperties, ReactNode } from 'react';

/** El cuadrito naranja con su letrero en mayúsculas. */
export function Kick({
  children,
  color,
  square,
  style,
}: {
  children: ReactNode;
  color?: string;
  square?: string;
  style?: CSSProperties;
}) {
  return (
    <span className="lp-kick" style={{ color, ...style }}>
      <i style={square ? { background: square } : undefined} />
      {children}
    </span>
  );
}

/** La palomita que va dentro de los chips y de la lista de lo que incluye. */
export function Check({ size = 12, width = 3.6 }: { size?: number; width?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** La flecha de los botones de compra. */
export function Arrow({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="lp-chip">
      <Check />
      {children}
    </span>
  );
}

/** El marco de teléfono de las tres maquetas de "por dentro". */
export function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      className="lp-phone"
      style={{
        border: '2.5px solid var(--ink)',
        borderRadius: 30,
        padding: 9,
        background: 'var(--ink)',
        boxShadow: '5px 5px 0 var(--ink)',
      }}
    >
      <div style={{ borderRadius: 22, overflow: 'hidden', background: 'var(--color-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px 5px' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, flex: 1 }}>9:41</span>
          <span style={{ width: 15, height: 7, border: '1.2px solid var(--ink)', borderRadius: 2 }} />
        </div>
        <div style={{ padding: '11px 13px 15px' }}>{children}</div>
      </div>
    </div>
  );
}

/** El pie de cada maqueta: número de pantalla, nombre y qué se ve. */
export function ShotCaption({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--color-accent-700)',
        }}
      >
        {n}
      </div>
      <div style={{ fontWeight: 800, fontSize: 16.5, marginTop: 3 }}>{title}</div>
      <p style={{ margin: '5px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-soft)', textWrap: 'pretty' }}>
        {body}
      </p>
    </div>
  );
}
