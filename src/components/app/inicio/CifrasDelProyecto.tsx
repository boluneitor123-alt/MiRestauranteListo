'use client';

import { Lock } from 'lucide-react';
import { money } from '@/domain/format';
import { INVESTMENT_HIDDEN_LABEL } from '@/domain/access';
import { RADIUS } from '@/components/ui';

/**
 * Las tres cifras del proyecto, en tarjetas compactas de color.
 *
 * Inversión para abrir, gastos fijos y ticket promedio. Van arriba de la tarea
 * pendiente porque son lo que la app ya sabe del negocio de esta persona: el
 * diagnóstico las dejó estimadas y verlas es la prueba de que las doce
 * preguntas sirvieron para algo.
 *
 * La inversión **no** lleva cifra en prueba. La maqueta la enseñaba en
 * $320,000 y eso contradice el alcance: la cifra de inversión se abre con el
 * pago único. La tarjeta se queda en su lugar, del mismo tamaño y con el
 * candado, que es mejor argumento que esconderla.
 *
 * Ninguna cifra se escribe aquí: todas llegan calculadas, y la etiqueta de
 * abajo es el sello que dejó el diagnóstico.
 */
export function CifrasDelProyecto({
  inversion,
  gastosFijos,
  ticket,
  muestraInversion,
  sello,
  onAbrirPresupuesto,
  onAbrirFijos,
  onAbrirTicket,
}: {
  /** Suma del presupuesto de apertura. */
  inversion: number;
  /** Gastos fijos del mes. */
  gastosFijos: number;
  /** Ticket promedio capturado. */
  ticket: number;
  /** ¿El nivel deja enseñar la cifra de inversión? En prueba, no. */
  muestraInversion: boolean;
  /** «Estimado para taquería con equipo de 1 a 2 personas», o vacío. */
  sello: string;
  onAbrirPresupuesto: () => void;
  onAbrirFijos: () => void;
  onAbrirTicket: () => void;
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 9 }}>
        <Cifra
          rotulo="Inversión para abrir"
          valor={muestraInversion ? money(inversion) : INVESTMENT_HIDDEN_LABEL}
          pie={muestraInversion ? (inversion ? 'estimado' : 'sin capturar') : undefined}
          bajoCandado={!muestraInversion}
          pastel="var(--cat-operacion)"
          tinta="var(--cat-operacion-ink)"
          d1="M4 20h16"
          d2="M7 16.5V10M12 16.5V5.5M17 16.5v-4"
          onClick={onAbrirPresupuesto}
        />
        <Cifra
          rotulo="Gastos fijos"
          valor={money(gastosFijos)}
          pie="al mes"
          pastel="var(--color-accent-2-100)"
          tinta="var(--color-accent-2-700)"
          d1="M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5Z"
          d2="M16.5 12h1.5M3 10.5h18"
          onClick={onAbrirFijos}
        />
        <Cifra
          rotulo="Ticket promedio"
          valor={money(ticket)}
          pie="por cliente"
          pastel="var(--cat-numeros)"
          tinta="var(--cat-numeros-ink)"
          d1="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17"
          d2="M14.2 9.4a2.6 2.6 0 0 0-4.4 1.2c0 2.3 4.4 1.3 4.4 3.5a2.6 2.6 0 0 1-4.4 1.4M12 7v10"
          onClick={onAbrirTicket}
        />
      </div>

      {/*
        El sello sale del estado, tal como lo dejó el diagnóstico: de qué giro
        es la estimación y con cuánta gente. Sin sello no se inventa una
        procedencia — se dice sólo que se pueden corregir.
      */}
      <p
        className="mrl-prose"
        style={{ margin: '9px 2px 0', fontSize: 11.5, lineHeight: 1.45, color: 'var(--color-text-2)' }}
      >
        {sello ? `${sello}. ` : ''}Corrígelos cuando quieras.
      </p>
    </div>
  );
}

function Cifra({
  rotulo,
  valor,
  pie,
  bajoCandado,
  pastel,
  tinta,
  d1,
  d2,
  onClick,
}: {
  rotulo: string;
  valor: string;
  pie?: string;
  bajoCandado?: boolean;
  pastel: string;
  tinta: string;
  d1: string;
  d2: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 44,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 7,
        padding: '13px 11px',
        border: 'none',
        borderRadius: RADIUS.block,
        background: pastel,
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: tinta }}>
        <svg
          width={17}
          height={17}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flex: 'none' }}
          aria-hidden
        >
          <path d={d1} />
          <path d={d2} />
        </svg>
        {bajoCandado ? <Lock size={13} strokeWidth={2.9} style={{ flex: 'none' }} /> : null}
      </span>

      <span style={{ display: 'block', fontSize: 11, fontWeight: 700, lineHeight: 1.25, color: 'var(--color-text-2)' }}>
        {rotulo}
      </span>

      {/*
        Con candado la frase va más chica y a dos renglones: no es una cifra,
        es una promesa, y en el tamaño del número se leería como si lo fuera.
      */}
      {/* `marginTop: auto` empuja la cifra al pie: sin esto la tarjeta con
          candado dejaba su frase a media altura y las tres se veían torcidas
          cuando un rótulo se partía en dos renglones. */}
      <span
        style={{
          display: 'block',
          marginTop: 'auto',
          fontFamily: bajoCandado ? 'var(--font-body)' : 'var(--font-heading)',
          fontSize: bajoCandado ? 12 : 18,
          fontWeight: bajoCandado ? 800 : 400,
          lineHeight: 1.15,
          letterSpacing: bajoCandado ? 0 : '-.02em',
          color: bajoCandado ? tinta : 'var(--color-text)',
        }}
      >
        {valor}
      </span>

      {pie ? (
        <span style={{ display: 'block', fontSize: 10.5, color: 'var(--color-text-2)' }}>{pie}</span>
      ) : null}
    </button>
  );
}
