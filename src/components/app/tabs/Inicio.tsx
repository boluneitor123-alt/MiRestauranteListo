'use client';

import type { Diagnosis, Target } from '@/domain/diagnosis';
import { fixedExpensesTotal, investment } from '@/domain/finance';
import type { AccessLevel, Capabilities } from '@/domain/access';
import { titularDeEquilibrio } from '@/domain/titular';
import { stageLabel } from '@/domain/progress';
import { minutosDeLeccion } from '@/content/leccionesMeta';
import { DEMO_DISHES } from '@/content/demo';
import { ETAPAS } from '@/content/route';
import type { ProjectState } from '@/domain/projectState';
import { Button, RADIUS } from '@/components/ui';
import { Chrome } from '../inicio/Chrome';
import { Encabezado } from '../inicio/Encabezado';
import { TitularGrande } from '../inicio/TitularGrande';
import { CifrasDelProyecto } from '../inicio/CifrasDelProyecto';
import { SiguientePaso } from '../inicio/SiguientePaso';
import { AlertaDelMentor } from '../inicio/AlertaDelMentor';
import { TusPlatillos } from '../inicio/TusPlatillos';
import { TarjetaDePrueba } from '../inicio/TarjetaDePrueba';

/** Los platillos de la plantilla, para reconocer que el ejemplo sigue puesto. */
const DEMO_DISH_IDS = new Set(DEMO_DISHES.map((d) => d.id));

/** Tablero de Inicio (README § 1.5, entrega-v2 § "Inicio"). */
export function Inicio({
  state,
  diagnosis,
  trial,
  level,
  can,
  precio,
  hasAlerts,
  onGo,
  onOpenProfile,
  onOpenAlerts,
  onOpenProject,
  onOpenPaywall,
  onNewDish,
  onKeepExample,
  onClearExample,
}: {
  state: ProjectState;
  diagnosis: Diagnosis;
  /** Días que le quedan de prueba. `null` con licencia: el aviso desaparece. */
  trial: { daysLeft: number; expired: boolean } | null;
  level: AccessLevel;
  /** El alcance vigente: decide si la cifra de inversión se enseña. */
  can: Capabilities;
  /**
   * El pago único, en pesos, o `null` mientras el entitlement no llega.
   *
   * Sale de los ajustes del panel —el mismo número con el que Stripe arma el
   * cobro— y viaja por el entitlement. Nunca de una constante de pantalla.
   */
  precio: number | null;
  /** Hay una alerta que merece el punto naranja de la campana. */
  hasAlerts: boolean;
  onGo: (target: Target) => void;
  onOpenProfile: () => void;
  onOpenAlerts: () => void;
  /** Abre los datos del proyecto desde el rótulo del encabezado. */
  onOpenProject: () => void;
  onOpenPaywall: () => void;
  /** Sin id abre un platillo nuevo; con id, ese platillo. */
  onNewDish: (id?: string) => void;
  onKeepExample: () => void;
  onClearExample: () => void;
}) {
  const name = (state.profile.name || 'Tu proyecto').split(' ')[0];
  const fixed = fixedExpensesTotal(state.fixed);
  const inversion = investment({
    concepts: state.budget,
    subconcepts: state.budgetSub,
    budgetCap: state.project.budgetCap,
  });
  const titular = titularDeEquilibrio({
    fixedExpenses: fixed,
    grossMargin: state.margin,
    ticket: state.ticket,
    ownerGoal: state.ownerGoal,
    hours: state.hours,
    closedOneDay: state.closedOneDay,
  });
  const minutosDelSiguiente = minutosDeLeccion(diagnosis.nextStep.title);
  // El ejemplo de la plantilla sigue cargado y todavía no decide qué hacer con él.
  const exampleOn = !state.settings.exampleHidden && state.dishes.some((d) => DEMO_DISH_IDS.has(d.id));

  return (
    <div
      className="mrl-measure"
      style={{ padding: '18px 20px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 18 }}
    >
      <Chrome
        initial={name.slice(0, 1).toUpperCase()}
        hasAlerts={hasAlerts}
        onOpenAlerts={onOpenAlerts}
        onOpenProfile={onOpenProfile}
      />

      <Encabezado
        /* Espacio duro antes del saludo: con uno normal, la mano se iba sola
           al segundo renglón en cuanto el nombre pasaba de seis letras. */
        titulo={<>¡Hola, {name}!{'\u00A0'}👋</>}
        bajada="Sigamos construyendo tu restaurante."
        proyecto={state.project.name}
        onOpenProject={onOpenProject}
      />

      {/*
        El orden es el mensaje, y se invirtió a propósito.
        Primero lo que la app ya sabe del negocio de esta persona —la cifra que
        dice si se sostiene, y las tres del diagnóstico—; después la tarea que
        sigue; después lo que va a doler si se deja; y al final su carta.

        Antes abría con la tarea pendiente y la cifra iba de pie de página:
        alguien que acababa de contestar doce preguntas entraba a que le
        pidieran más trabajo, sin ver nada suyo. Inicio tiene que hacer pensar
        «esta app ya sabe cosas de mi negocio», no «tengo tarea».

        Lo que salió de aquí no se borró de la app: Herramientas rápidas y los
        entregables viven en Más, Tareas de tu ruta y Progreso por módulo en Mi
        Ruta, y los mini cursos en Más › Aprende.
      */}
      <TitularGrande titular={titular} onCapturarFijos={() => onGo({ tab: 'numeros', view: 'fijos' })} />

      <CifrasDelProyecto
        inversion={inversion.total}
        gastosFijos={fixed}
        ticket={state.ticket}
        muestraInversion={can.muestraCifrasDeInversion}
        sello={state.selloEstimado ?? ''}
        onAbrirPresupuesto={() =>
          can.muestraCifrasDeInversion ? onGo({ tab: 'numeros', view: 'presupuesto' }) : onOpenPaywall()
        }
        onAbrirFijos={() => onGo({ tab: 'numeros', view: 'fijos' })}
        onAbrirTicket={() => onGo({ tab: 'numeros', view: 'equilibrio' })}
      />

      <SiguientePaso
        titulo={diagnosis.nextStep.title}
        cuerpo={diagnosis.nextStep.body}
        minutos={`${minutosDelSiguiente} min`}
        etapa={stageLabel(ETAPAS, diagnosis.progress.nextTask)}
        onContinue={() => onGo(diagnosis.nextStep.target)}
      />

      <AlertaDelMentor recomendacion={diagnosis.recommendations[0]} onGo={onGo} />

      <TusPlatillos
        dishes={state.dishes}
        subrecipes={state.subrecipes}
        onAbrir={(id) => onNewDish(id)}
        onVerTodos={() => onGo({ tab: 'costeador' })}
        onCostearPrimero={() => onNewDish()}
      />

      <TarjetaDePrueba level={level} trial={trial} precio={precio} onOpenPaywall={onOpenPaywall} />

      {exampleOn ? <AvisoDeEjemplo onKeep={onKeepExample} onClear={onClearExample} /> : null}
    </div>
  );
}

/** La plantilla de ejemplo sigue cargada: se edita o se limpia. */
function AvisoDeEjemplo({ onKeep, onClear }: { onKeep: () => void; onClear: () => void }) {
  return (
    <div style={{ padding: '16px 18px', borderRadius: RADIUS.card, background: 'var(--color-accent-2-100)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: RADIUS.pill,
            background: 'var(--color-accent-2-200)',
            color: 'var(--color-accent-2-900)',
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          Ejemplo
        </span>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-accent-2-900)' }}>
          Llenamos tu proyecto con un ejemplo
        </span>
      </div>
      <p
        className="mrl-prose"
        style={{ margin: '7px 0 12px', fontSize: 12.8, lineHeight: 1.5, color: 'var(--color-accent-2-900)' }}
      >
        Hay 3 platillos costeados, un presupuesto de apertura y gastos fijos de una cafetería real. Sirven para que veas
        cómo se ve todo funcionando. Edítalos con tus datos o empieza en blanco.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button height={44} style={{ flex: 1, minWidth: 190, fontSize: 13.5 }} onClick={onKeep}>
          Los edito con mis datos
        </Button>
        <Button variant="secondary" height={44} style={{ paddingInline: 16, fontSize: 13.5 }} onClick={onClear}>
          Empezar en blanco
        </Button>
      </div>
    </div>
  );
}
