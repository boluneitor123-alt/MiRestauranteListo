'use client';

/**
 * Primitivas visuales de la app del emprendedor (README § 6).
 *
 * Los tokens viven en CSS (`globals.css`); aquí sólo se componen. Alturas de
 * control ≥44px, radios de la escala e inputs a 16px para que iOS no haga zoom.
 */

import type { CSSProperties, ReactNode } from 'react';

export const RADIUS = { frame: 44, sheet: 34, card: 28, block: 24, inner: 20, small: 16, pill: 999 } as const;

export const text = (opacity: number) => `color-mix(in srgb, var(--color-text) ${opacity}%, transparent)`;

export function Card({
  children,
  style,
  radius = RADIUS.card,
  ...rest
}: {
  children: ReactNode;
  style?: CSSProperties;
  radius?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      style={{
        background: 'var(--color-surface)',
        borderRadius: radius,
        boxShadow: 'var(--shadow-sm)',
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function H(props: { size: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 800,
        letterSpacing: '-.02em',
        lineHeight: props.size > 30 ? 1.02 : 1.15,
        fontSize: props.size,
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

export function Kicker({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: color ?? 'var(--color-accent-700)',
      }}
    >
      {children}
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light' | 'success';

export function Button({
  children,
  variant = 'primary',
  height = 52,
  disabled,
  onClick,
  style,
  type = 'button',
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  height?: number;
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  type?: 'button' | 'submit';
}) {
  const palette: Record<ButtonVariant, CSSProperties> = {
    primary: { background: 'var(--color-accent)', color: '#fff' },
    success: { background: 'var(--color-accent-2-600)', color: '#fff' },
    secondary: {
      background: 'transparent',
      color: 'var(--color-text)',
      border: '1.5px solid var(--color-divider)',
    },
    ghost: { background: 'var(--color-neutral-200)', color: 'var(--color-text)' },
    light: { background: '#fff', color: 'var(--color-accent-700)' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        height,
        borderRadius: RADIUS.pill,
        border: 'none',
        fontFamily: 'var(--font-body)',
        fontSize: 15.5,
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...palette[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  prefix,
  inputMode,
  style,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  /** El símbolo va FUERA del input: nunca se reformatea mientras se escribe. */
  prefix?: string;
  inputMode?: 'decimal' | 'numeric' | 'text' | 'email';
  style?: CSSProperties;
}) {
  return (
    <label style={{ display: 'block', ...style }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: text(62), marginBottom: 6 }}>
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {prefix ? <span style={{ fontSize: 16, fontWeight: 700, color: text(55) }}>{prefix}</span> : null}
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            width: '100%',
            height: 48,
            padding: '0 16px',
            borderRadius: RADIUS.pill,
            border: '1.5px solid var(--color-divider)',
            background: 'var(--color-surface)',
            fontSize: 16,
          }}
        />
      </span>
    </label>
  );
}

export function Pill({
  children,
  selected,
  onClick,
  style,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '9px 14px',
        borderRadius: RADIUS.pill,
        border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-divider)'}`,
        background: selected ? 'var(--color-accent-100)' : 'transparent',
        color: selected ? 'var(--color-accent-700)' : text(70),
        fontSize: 13,
        fontWeight: selected ? 800 : 600,
        fontFamily: 'var(--font-body)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ pct, height = 7, color }: { pct: number; height?: number; color?: string }) {
  return (
    <div
      style={{
        height,
        borderRadius: RADIUS.pill,
        background: 'var(--color-neutral-300)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          height: '100%',
          borderRadius: RADIUS.pill,
          background: color ?? 'var(--color-accent)',
          transition: 'width .3s ease',
        }}
      />
    </div>
  );
}

/** Anillo de avance: conic-gradient con disco interior. */
export function ProgressRing({ pct, size = 78 }: { pct: number; size?: number }) {
  const inset = Math.round(size * 0.115);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `conic-gradient(var(--color-accent) ${pct * 3.6}deg, var(--color-neutral-300) 0)`,
        display: 'grid',
        placeItems: 'center',
        transition: 'background .3s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: size - inset * 2,
          height: size - inset * 2,
          borderRadius: '50%',
          background: 'var(--color-surface)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: size > 60 ? 22 : 15 }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

export function Row({
  children,
  gap = 10,
  align = 'center',
  style,
}: {
  children: ReactNode;
  gap?: number;
  align?: CSSProperties['alignItems'];
  style?: CSSProperties;
}) {
  return <div style={{ display: 'flex', alignItems: align, gap, ...style }}>{children}</div>;
}

export function Muted({ children, size = 13, style }: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return <div style={{ fontSize: size, color: text(62), lineHeight: 1.45, ...style }}>{children}</div>;
}

/** Hoja inferior (FAB, información). */
export function Sheet({
  title,
  onClose,
  children,
  z = 50,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  z?: number;
}) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: z, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'var(--color-surface)',
          borderRadius: `${RADIUS.sheet}px ${RADIUS.sheet}px 0 0`,
          padding: '20px 20px 28px',
          animation: 'mrlUp .22s ease both',
          maxHeight: '82%',
          overflowY: 'auto',
        }}
      >
        <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <H size={19}>{title}</H>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 34,
              height: 34,
              borderRadius: RADIUS.pill,
              border: 'none',
              background: 'var(--color-neutral-200)',
              cursor: 'pointer',
              fontSize: 16,
              color: 'var(--color-text)',
            }}
          >
            ×
          </button>
        </Row>
        {children}
      </div>
    </div>
  );
}

/** Encabezado de sub-pantalla: atrás + título + subtítulo. */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  tone = 'default',
  action,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  tone?: 'default' | 'accent' | 'success';
  action?: ReactNode;
}) {
  const background =
    tone === 'accent' ? 'var(--color-accent)' : tone === 'success' ? 'var(--color-accent-2-600)' : 'transparent';
  const color = tone === 'default' ? 'var(--color-text)' : '#fff';

  return (
    <div style={{ background, color, padding: tone === 'default' ? '18px 20px 6px' : '20px 20px 22px' }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={12}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Atrás"
            style={{
              width: 36,
              height: 36,
              borderRadius: RADIUS.pill,
              border: 'none',
              background: tone === 'default' ? 'var(--color-neutral-200)' : 'rgba(255,255,255,.2)',
              color,
              cursor: 'pointer',
              fontSize: 17,
              flexShrink: 0,
            }}
          >
            ‹
          </button>
          <div>
            <H size={19} style={{ color }}>
              {title}
            </H>
            {subtitle ? <div style={{ fontSize: 12.5, opacity: 0.8 }}>{subtitle}</div> : null}
          </div>
        </Row>
        {action}
      </Row>
    </div>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: 'var(--color-divider)', margin: '14px 0' }} />;
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 44, height: 26 }}
      />
      <span
        aria-hidden
        style={{
          width: 46,
          height: 27,
          borderRadius: RADIUS.pill,
          background: checked ? 'var(--color-accent)' : 'var(--color-neutral-400)',
          position: 'relative',
          transition: 'background .2s ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 22 : 3,
            width: 21,
            height: 21,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left .2s ease',
          }}
        />
      </span>
    </label>
  );
}

/** Botón (i): abre la hoja de información de un término. */
export function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Qué significa"
      style={{
        width: 22,
        height: 22,
        borderRadius: RADIUS.pill,
        border: '1.5px solid var(--color-divider)',
        background: 'transparent',
        color: text(55),
        fontSize: 12,
        fontWeight: 800,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      i
    </button>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Card style={{ textAlign: 'center', padding: '28px 20px' }}>
      <H size={17}>{title}</H>
      <Muted style={{ marginTop: 6 }}>{body}</Muted>
      {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
    </Card>
  );
}
