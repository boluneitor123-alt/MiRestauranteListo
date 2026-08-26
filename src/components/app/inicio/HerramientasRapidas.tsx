'use client';

import { ArrowRight, ChevronRight } from 'lucide-react';
import type { Target } from '@/domain/diagnosis';
import { RADIUS } from '@/components/ui';

/**
 * "Herramientas rápidas": las seis entradas de Inicio, cada una con el pastel
 * de su categoría. Los pasteles clasifican; el naranja sigue siendo el que
 * dirige la atención, y por eso ninguna de estas tarjetas lo usa.
 */
type Herramienta = {
  label: string;
  desc: string;
  /** Token del pastel, sin el prefijo --cat-. */
  cat: string;
  target: Target;
  d1: string;
  d2: string;
};

const HERRAMIENTAS: Herramienta[] = [
  {
    label: 'Calculadoras',
    desc: 'Números reales para tomar decisiones',
    cat: 'numeros',
    target: { tab: 'numeros', view: 'presupuesto' },
    d1: 'M4 4.5A2.5 2.5 0 0 1 6.5 2h11A2.5 2.5 0 0 1 20 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5Z',
    d2: 'M8 6h8M8 10.5h.01M12 10.5h.01M16 10.5h.01M8 14.5h.01M12 14.5h.01M16 14.5v3.5M8 18h4',
  },
  {
    label: 'Menú rentable',
    desc: 'Costea cada platillo y define precios',
    cat: 'menu',
    target: { tab: 'costeador' },
    d1: 'M4 11h16a8 8 0 0 0-16 0Z',
    d2: 'M4.5 14.5h15M6 18h12',
  },
  {
    label: 'Permisos',
    desc: 'Checklist completo por estado',
    cat: 'permisos',
    target: { tab: 'ruta', module: 'permisos' },
    d1: 'M8 3h8l4 4v14H4V3h4Z',
    d2: 'M8 12h8M8 16h5M9.5 3v3h5V3',
  },
  {
    label: 'Marketing',
    desc: 'Estrategias para atraer clientes desde el día 1',
    cat: 'marketing',
    target: { tab: 'ruta', module: 'marketing' },
    d1: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z',
    d2: 'M15.5 8.5a5 5 0 0 1 0 7',
  },
  {
    label: 'Operación',
    desc: 'Construye tu equipo paso a paso',
    cat: 'operacion',
    target: { tab: 'ruta', module: 'personal' },
    d1: 'M18 20v-1.5a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4V20',
    d2: 'M12 4.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2',
  },
  {
    label: 'Recursos',
    desc: 'Plantillas y guías listas para usar',
    cat: 'recursos',
    target: { tab: 'mas' },
    d1: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h3l2 2.5h6A2.5 2.5 0 0 1 20 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Z',
    d2: 'M4 10h16',
  },
];

export function HerramientasRapidas({ onGo }: { onGo: (target: Target) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 2px 12px' }}>
        <h4 style={{ margin: 0, flex: 1, fontSize: 19, letterSpacing: '-.01em', fontFamily: 'var(--font-heading)' }}>
          Herramientas rápidas
        </h4>
        <button
          type="button"
          onClick={() => onGo({ tab: 'ruta' })}
          className="mrl-hit"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 4px',
            border: 'none',
            background: 'none',
            color: 'var(--color-accent-800)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Ver todas
          <ArrowRight size={14} strokeWidth={3} />
        </button>
      </div>

      {/* La rejilla vive en `.mrl-qtools`: en línea, el media query de 390px no podría ganarle. */}
      <div className="mrl-qtools">
        {HERRAMIENTAS.map((h) => (
          <button
            key={h.label}
            type="button"
            onClick={() => onGo(h.target)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              textAlign: 'left',
              padding: '15px 14px',
              border: 'none',
              borderRadius: RADIUS.block,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              background: `var(--cat-${h.cat})`,
              color: `var(--cat-${h.cat}-ink)`,
            }}
          >
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 38,
                height: 38,
                flex: 'none',
                borderRadius: 11,
                background: 'rgb(255 255 255 / 0.72)',
                color: `var(--cat-${h.cat}-ink)`,
              }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={h.d1} />
                <path d={h.d2} />
              </svg>
            </span>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{h.label}</span>
            <span style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.35, opacity: 0.78 }}>{h.desc}</span>
              <ChevronRight size={15} strokeWidth={2.9} style={{ flex: 'none', opacity: 0.6 }} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
