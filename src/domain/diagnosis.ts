/**
 * Diagnóstico, mentor y alertas (README § 1.4, § 1.5, § 1.9).
 *
 * Todo sale de lo que el usuario contestó y capturó. Regla dura del § 1.12:
 * **sin licencia, ningún mensaje revela la inversión estimada ni el excedente
 * de presupuesto** — ni el mentor, ni las alertas, ni el diagnóstico.
 */

import { dishMetrics, type CostingContext } from './costing';
import { breakeven, fixedExpensesTotal, investment } from './finance';
import { semaphoreLevel } from './semaphore';
import { projectProgress, type ProjectProgress, type RouteModule } from './progress';
import { money } from './format';
import type { ProjectState } from './projectState';

export type Severity = 'alta' | 'media' | 'baja';

/** Destino del CTA: a qué pestaña o módulo lleva. */
export interface Target {
  tab: 'inicio' | 'ruta' | 'costeador' | 'numeros' | 'mas';
  module?: string;
  view?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  body: string;
  severity: Severity;
  cta: string;
  target: Target;
}

export interface Gap {
  n: string;
  title: string;
  body: string;
}

export interface Diagnosis {
  progress: ProjectProgress;
  /** "Lo que más te falta": las 3 cosas que más mueven la aguja. */
  gaps: Gap[];
  /** Riesgos detectados, en prosa. */
  risks: string[];
  /** Pendientes críticos del tablero y lista de Alertas. */
  recommendations: Recommendation[];
  nextStep: { title: string; body: string; target: Target };
}

export interface DiagnosisInput {
  state: ProjectState;
  modules: readonly RouteModule[];
  /** Con licencia se pueden mostrar montos; en prueba, nunca. */
  showFigures: boolean;
}

const ctxOf = (state: ProjectState): CostingContext => ({ subrecipes: state.subrecipes });

export function diagnose({ state, modules, showFigures }: DiagnosisInput): Diagnosis {
  const progress = projectProgress({
    modules,
    done: state.done,
    skipped: state.skipped,
    extraTasks: state.extraTasks,
  });

  const ctx = ctxOf(state);
  const metrics = state.dishes.map((d) => dishMetrics(d, ctx));
  const priced = metrics.filter((m) => m.hasPrice);
  const inRed = priced.filter((m) => semaphoreLevel(m.foodCostRounded) === 'peligroso').length;

  const invest = investment({
    concepts: state.budget,
    subconcepts: state.budgetSub,
    budgetCap: state.project.budgetCap,
  });
  const fixed = fixedExpensesTotal(state.fixed);
  const answers = state.answers;

  const gaps: Gap[] = [];
  const push = (title: string, body: string) => {
    if (gaps.length < 3) gaps.push({ n: String(gaps.length + 1), title, body });
  };

  if (!state.dishes.length || answers.costeo === 'No') {
    push('Costear tu menú', 'Sin costeo no sabes si tus precios dejan utilidad.');
  }
  if (fixed === 0 || answers.ventas === 'No') {
    push('Calcular tu punto de equilibrio', 'Necesitas saber cuánto vender al día para no perder dinero.');
  }
  if (invest.total === 0) {
    push('Cerrar tu inversión inicial', 'Todavía no sabemos cuánto necesitas para abrir.');
  } else if (invest.exceeded) {
    push('Ajustar tu inversión inicial', 'Tu presupuesto de apertura está por encima de tu tope.');
  }
  if (answers.menuq && answers.menuq !== 'Sí') {
    push('Definir tu menú', 'Un menú corto y decidido se compra mejor y deja más utilidad.');
  }
  if (answers.localq === 'No' || answers.localq === 'Estoy buscando') {
    push('Cerrar tu local', 'La ubicación es la mitad del éxito en comida.');
  }
  if (answers.permisos && answers.permisos !== 'Sí') {
    push('Revisar permisos y trámites', 'Abrir sin permisos expone toda tu inversión.');
  }
  if (answers.nombre === 'No') {
    push('Definir el nombre de tu negocio', 'Sin nombre no puedes empezar marca, redes ni trámites.');
  }
  if (!gaps.length) {
    push('Ensayar tu apertura', 'Ya tienes lo esencial: prueba tiempos de cocina antes del día uno.');
  }

  const risks: string[] = [];
  const recommendations: Recommendation[] = [];

  if (invest.exceeded) {
    risks.push(
      showFigures
        ? `Tu inversión estimada supera tu presupuesto por ${money(Math.abs(invest.difference))}.`
        : 'Tu inversión estimada supera tu presupuesto disponible.',
    );
    recommendations.push({
      id: 'presupuesto-excedido',
      title: 'Tu inversión no cabe en tu presupuesto',
      body: showFigures
        ? `Estás ${money(Math.abs(invest.difference))} arriba de tu tope. Recorta conceptos o consigue más capital.`
        : 'Estás arriba de tu tope. Ábrelo con el pago único para ver por cuánto y qué recortar.',
      severity: 'alta',
      cta: 'Revisar presupuesto',
      target: { tab: 'numeros', view: 'presupuesto' },
    });
  }

  if (answers.permisos && answers.permisos !== 'Sí' && answers.cuando === 'En menos de 3 meses') {
    risks.push('Aún no tienes permisos revisados y quieres abrir pronto.');
    recommendations.push({
      id: 'permisos',
      title: 'Los permisos tardan más de lo que crees',
      body: 'Quieres abrir en menos de 3 meses y los trámites siguen pendientes. Empieza por el aviso de funcionamiento.',
      severity: 'alta',
      cta: 'Ir a Permisos',
      target: { tab: 'ruta', module: 'permisos' },
    });
  }

  if (inRed > 0) {
    risks.push(
      `${inRed === 1 ? 'Un platillo tiene' : `${inRed} platillos tienen`} food cost peligroso: se comen tu utilidad.`,
    );
    recommendations.push({
      id: 'platillos-rojos',
      title: inRed === 1 ? 'Tienes un platillo en rojo' : `Tienes ${inRed} platillos en rojo`,
      body: 'Arriba de 38% de food cost el platillo deja muy poco. Sube el precio, ajusta la porción o quítalo.',
      severity: 'alta',
      cta: 'Abrir el Costeador',
      target: { tab: 'costeador' },
    });
  }

  if (!state.dishes.length) {
    recommendations.push({
      id: 'sin-costeo',
      title: 'Todavía no has costeado ningún platillo',
      body: 'Empieza por tus platillos estrella: son los que van a mover tu venta.',
      severity: 'media',
      cta: 'Costear mi primer platillo',
      target: { tab: 'costeador' },
    });
  }

  if (fixed === 0) {
    risks.push('No has capturado tus gastos fijos, así que tu punto de equilibrio todavía no es real.');
    recommendations.push({
      id: 'sin-gastos-fijos',
      title: 'Captura tus gastos fijos del mes',
      body: 'Renta, nómina y servicios se pagan vendas o no. Son la base de tu punto de equilibrio.',
      severity: 'media',
      cta: 'Ir a Números',
      target: { tab: 'numeros', view: 'fijos' },
    });
  } else {
    const be = breakeven({
      fixedExpenses: fixed,
      grossMargin: state.margin,
      ticket: state.ticket,
      ownerGoal: state.ownerGoal,
      hours: state.hours,
      closedOneDay: state.closedOneDay,
    });
    if (be.ticketsPerDay > 0) {
      recommendations.push({
        id: 'equilibrio',
        title: `Necesitas ${be.ticketsPerDay} tickets al día para no perder`,
        body: `Con ${money(fixed)} de gastos fijos y un ticket de ${money(state.ticket)}, ese es tu piso diario.`,
        severity: 'baja',
        cta: 'Ver punto de equilibrio',
        target: { tab: 'numeros', view: 'equilibrio' },
      });
    }
  }

  if (progress.nextTask) {
    recommendations.push({
      id: `tarea-${progress.nextTask.key}`,
      title: progress.nextTask.title,
      body: progress.nextTask.next,
      severity: 'media',
      cta: 'Abrir la tarea',
      target: { tab: 'ruta', module: progress.nextTask.moduleId },
    });
  }

  const order: Record<Severity, number> = { alta: 0, media: 1, baja: 2 };
  recommendations.sort((a, b) => order[a.severity] - order[b.severity]);

  const nextStep = progress.nextTask
    ? {
        title: progress.nextTask.title,
        body: progress.nextTask.next,
        target: { tab: 'ruta' as const, module: progress.nextTask.moduleId },
      }
    : {
        title: 'Todo listo: define tu fecha de apertura',
        body: 'Completaste tu ruta. Revisa tus números una vez más antes de abrir.',
        target: { tab: 'numeros' as const },
      };

  return { progress, gaps, risks, recommendations, nextStep };
}
