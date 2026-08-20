/**
 * Extrae el contenido literal del prototipo de diseño y lo emite como
 * módulos TypeScript en src/content/. El prototipo es la fuente de verdad:
 * este script copia, no reescribe. Vuelve a correrlo si llega una entrega nueva.
 *
 *   node scripts/extraer-diseno.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const APP = 'entrega-claude-code/diseno/MiRestauranteListo.dc.html';
const ART = 'entrega-claude-code/diseno/art/illustrations.js';
// Las 26 de los cursos de Delivery y Contratar llegaron después, en su propio
// archivo y bajo otro nombre de variable. El sistema visual es el mismo.
const ART_CURSOS = 'entrega-claude-code/diseno/art/illustrations-cursos.js';
const OUT = 'src/content';

const src = readFileSync(APP, 'utf8');
const desde = src.indexOf('const CATS = [');
const hasta = src.indexOf("const CARD = 'padding:16px");
if (desde < 0 || hasta < 0) throw new Error('No encontré el bloque de constantes del prototipo');

const ctx = createContext({});
runInContext(src.slice(desde, hasta), ctx);
const g = (n) => runInContext(n, ctx);

const art = createContext({ window: {} });
runInContext(readFileSync(ART, 'utf8'), art);
runInContext(readFileSync(ART_CURSOS, 'utf8'), art);
const MRL_ART = {
  ...runInContext('window.MRL_ART', art),
  ...runInContext('window.MRL_ART_CURSOS', art),
};

const cabecera = (que) =>
  `// Generado por scripts/extraer-diseno.mjs desde el prototipo de diseño.\n` +
  `// ${que}\n// No edites a mano: vuelve a correr el script.\n\n`;

const json = (v) => JSON.stringify(v, null, 2);

/** Slug de una lección: minúsculas, sin acentos, con guiones. Igual que illo() en el prototipo. */
const slug = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 44);

// ── Ruta: 14 módulos, 90 tareas ────────────────────────────────────────────
const CATS = g('CATS');
const tareas = CATS.flatMap((c) => c.tasks);
if (tareas.length !== 90) throw new Error(`Esperaba 90 tareas, encontré ${tareas.length}`);

writeFileSync(`${OUT}/route.ts`, cabecera('Los 14 módulos de Mi Ruta con sus 90 tareas (const CATS).') +
`export type RouteTask = {
  /** Título exacto de la tarea. Es la llave de LESSONS y de las ilustraciones. */
  t: string;
  /** Pista corta que se ve bajo el título. */
  h: string;
  /** 1 si el proyecto de ejemplo la trae completada. */
  d?: number;
  /** Por qué importa. */
  why: string;
  /** Tu tarea de hoy. */
  n: string;
};

export type RouteModule = {
  id: string;
  /** Token de color del módulo, sin el prefijo --color-. */
  col: string;
  name: string;
  desc: string;
  /** true en los cuatro mini cursos con estrella. */
  course?: boolean;
  tasks: RouteTask[];
};

export const CATS: RouteModule[] = ${json(CATS)};

/** Los 10 módulos de la ruta normal. */
export const RUTA_CATS = CATS.filter((c) => !c.course);
/** Los 4 mini cursos con estrella. */
export const CURSO_CATS = CATS.filter((c) => c.course);

export const TOTAL_TASKS = CATS.reduce((a, c) => a + c.tasks.length, 0);
export const TOTAL_MODULES = CATS.length;

/** Llave estable de una tarea dentro de su módulo: id del módulo + índice. */
export const taskKey = (catId: string, index: number) => catId + index;

export const SKIP_REASONS: string[] = ${json(g('SKIP_REASONS'))};

// ── Adaptador para el dominio ──────────────────────────────────────────────
// El dominio (progreso, diagnóstico, landing) habla en español largo; el
// prototipo abrevia. Traducimos aquí, una sola vez.

export interface SeedTask {
  title: string;
  hint: string;
  why: string;
  next: string;
  demoDone: boolean;
}

export interface SeedModule {
  id: string;
  name: string;
  desc: string;
  col: string;
  course: boolean;
  tasks: SeedTask[];
}

export const ROUTE_MODULES: readonly SeedModule[] = CATS.map((c) => ({
  id: c.id,
  name: c.name,
  desc: c.desc,
  col: c.col,
  course: !!c.course,
  tasks: c.tasks.map((t) => ({
    title: t.t,
    hint: t.h,
    why: t.why,
    next: t.n,
    demoDone: !!t.d,
  })),
}));

/** Los 90 pasos de la ruta completa, cursos incluidos. */
export const TOTAL_ROUTE_TASKS = TOTAL_TASKS;
`);

// ── Lecciones ──────────────────────────────────────────────────────────────
const LESSONS = g('LESSONS');
const faltan = tareas.filter((t) => !LESSONS[t.t]).map((t) => t.t);
if (faltan.length) throw new Error(`Tareas sin lección: ${faltan.join(', ')}`);

writeFileSync(`${OUT}/lessons.ts`, cabecera('El contenido de las 90 lecciones (const LESSONS), indexado por título de tarea.') +
`export type LessonExample = {
  /** Título de la tabla de ejemplo. */
  t: string;
  /** Renglones [concepto, valor]. */
  r: [string, string][];
  /** Nota que explica qué significan los números. */
  n: string;
};

export type Lesson = {
  /** Minutos que toma. */
  m: number;
  /** Descripción de la ilustración (texto alternativo). */
  img?: string;
  /** Pasos, en orden. */
  s: string[];
  /** El error típico. */
  e: string;
  /** Checklist de "ya quedó cuando…". */
  d: string[];
  /** Tabla de ejemplo. Solo 44 de las 90 lecciones la traen: si falta, no se pinta. */
  x?: LessonExample;
};

export const LESSONS: Record<string, Lesson> = ${json(LESSONS)};

/** Lección vacía para una tarea que el usuario agregó a mano. */
export const FALLBACK_LESSON: Lesson = ${json(g('FALLBACK_LESSON'))};

export const getLesson = (title: string): Lesson => LESSONS[title] ?? FALLBACK_LESSON;
`);

// ── Diagnóstico ────────────────────────────────────────────────────────────
writeFileSync(`${OUT}/onboarding.ts`, cabecera('Las 12 preguntas del diagnóstico (const QS) y el recorrido guiado (const TOUR).') +
`export type Question = {
  id: string;
  /** Categoría que se ve arriba, en mayúsculas. */
  k: string;
  q: string;
  /** Ayuda opcional bajo la pregunta. */
  help?: string;
  /** Opciones, como botones grandes. */
  o: string[];
};

export const QS: Question[] = ${json(g('QS'))};

export type TourStep = {
  tab: string;
  view?: string;
  fab?: boolean;
  t: string;
  b: string;
  tip: string;
};

export const TOUR: TourStep[] = ${json(g('TOUR'))};

// ── Adaptador ──────────────────────────────────────────────────────────────

export interface OnboardingQuestion {
  id: string;
  /** Categoría en mayúsculas sobre la pregunta. */
  kicker: string;
  question: string;
  help: string;
  options: string[];
}

export const ONBOARDING_QUESTIONS: readonly OnboardingQuestion[] = QS.map((q) => ({
  id: q.id,
  kicker: q.k,
  question: q.q,
  help: q.help ?? '',
  options: q.o,
}));

export interface TourStepView {
  tab: string;
  view?: string;
  fab?: boolean;
  title: string;
  body: string;
  tip: string;
}

export const TOUR_STEPS: readonly TourStepView[] = TOUR.map((s) => ({
  tab: s.tab,
  view: s.view,
  fab: s.fab,
  title: s.t,
  body: s.b,
  tip: s.tip,
}));
`);

// ── Plantillas por giro y rangos de referencia ─────────────────────────────
writeFileSync(`${OUT}/giros.ts`, cabecera('Plantillas por tipo de negocio (GIROS, TEMPLATES) y rangos de referencia (BENCH).') +
`export const GIROS: string[][] = ${json(g('GIROS'))};

export type Bench = { fc: [number, number]; renta: [number, number]; nomina: [number, number]; ticket: number };

/** Rangos de referencia por giro: food cost %, renta y nómina como % de venta. */
export const BENCH: Record<string, Bench> = ${json(g('BENCH'))};

export const TEMPLATES = ${json(g('TEMPLATES'))} as const;
`);

// ── Presupuesto, gastos fijos y platillos de ejemplo ───────────────────────
writeFileSync(`${OUT}/demo.ts`, cabecera('El proyecto de ejemplo: presupuesto, gastos fijos, platillos y sub-recetas.') +
`export const BUDGET: [string, string, number][] = ${json(g('BUDGET'))};
export const FIXED: [string, string, number][] = ${json(g('FIXED'))};
export const DISHES = ${json(g('DISHES'))};
export const SUBRECIPES = ${json(g('SUBRECIPES'))};
export const LAYOUTS = ${json(g('LAYOUTS'))};
export const UNITS: [string, number, string][] = ${json(g('UNITS'))};
/** Explicaciones de los botones (i): [título, qué es, cómo se calcula]. */
export const INFO: Record<string, [string, string, string]> = ${json(g('INFO'))};

// ── Adaptador al dominio ───────────────────────────────────────────────────

import type { Dish, Subrecipe, Ingredient } from '@/domain/types';
import type { UnitCode } from '@/domain/units';

type ProtoIng = {
  name: string;
  qty: number;
  u: string;
  uc?: number;
  bu?: string;
  buyPrice?: number;
  buyQty?: number;
  merma?: number;
  sub?: string;
};

const toIngredient = (ing: ProtoIng, id: string): Ingredient => ({
  id,
  name: ing.name,
  qty: ing.qty,
  unit: ing.u as UnitCode,
  ...(ing.uc !== undefined ? { unitPrice: ing.uc } : {}),
  ...(ing.buyPrice !== undefined ? { buyPrice: ing.buyPrice } : {}),
  ...(ing.buyQty !== undefined ? { buyQty: ing.buyQty } : {}),
  ...(ing.bu !== undefined ? { buyUnit: ing.bu as UnitCode } : {}),
  ...(ing.merma !== undefined ? { waste: ing.merma } : {}),
  ...(ing.sub !== undefined ? { subrecipeId: ing.sub } : {}),
});

export const DEMO_DISHES: readonly Dish[] = DISHES.map((d) => ({
  id: d.id,
  name: d.name,
  price: d.price,
  ingredients: (d.ing as ProtoIng[]).map((ing, i) => toIngredient(ing, d.id + 'i' + i)),
}));

export const DEMO_SUBRECIPES: readonly Subrecipe[] = SUBRECIPES.map((s) => ({
  id: s.id,
  name: s.name,
  yieldQty: s.yieldQty,
  unit: s.u as UnitCode,
  ingredients: (s.ing as ProtoIng[]).map((ing, i) => toIngredient(ing, s.id + 'i' + i)),
}));
`);

// ── Textos de Más: FAQ, recursos, tutorial, términos, changelog ────────────
writeFileSync(`${OUT}/catalog.ts`, cabecera('Textos de la pestaña Más: preguntas frecuentes, recursos, tutorial, términos y novedades.') +
`export const FAQ: [string, string][] = ${json(g('FAQ'))};
export const RECURSOS = ${json(g('RECURSOS'))};
export const TUTORIAL = ${json(g('TUTORIAL'))};
export const TERMS = ${json(g('TERMS'))};
export const CHANGELOG: [string, string, string][] = ${json(g('CHANGELOG'))};
export const SUPPLIERS = ${json(g('SUPPLIERS'))};
export const NOTES = ${json(g('NOTES'))};
export const ACCENTS: [string, string][] = ${json(g('ACCENTS'))};
export const RES_FILES = ${json(g('RES_FILES'))};

// ── Adaptador ──────────────────────────────────────────────────────────────

import type { Concept } from '@/domain/finance';
import { BUDGET, FIXED } from './demo';
import { GIROS as GIRO_ROWS } from './giros';

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: readonly FaqItem[] = FAQ.map(([q, a]) => ({ q, a }));

/** Alias histórico: el resto del repo importa FAQ ya en forma de objeto. */
export const FAQ_LIST = FAQ_ITEMS;

export interface GiroBenchmark {
  name: string;
  /** Inversión típica para abrir. */
  investment: string;
  foodCost: string;
  ticket: string;
  team: string;
}

export const GIROS: readonly GiroBenchmark[] = GIRO_ROWS.map(([name, investment, foodCost, ticket, team]) => ({
  name,
  investment,
  foodCost,
  ticket,
  team,
}));

const toConcepts = (rows: [string, string, number][]): readonly Concept[] =>
  rows.map(([key, label, amount]) => ({ key, label, amount }));

export const BUDGET_CONCEPTS = toConcepts(BUDGET);
export const FIXED_CONCEPTS = toConcepts(FIXED);
`);

// ── Ilustraciones ──────────────────────────────────────────────────────────
// Los SVG del prototipo repiten los mismos id internos (dot, fade…). Al poner
// varios en una misma página se pisarían, así que cada uno lleva su prefijo.
let colisiones = 0;
const ilustraciones = {};
for (const [clave, svg] of Object.entries(MRL_ART)) {
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  let limpio = svg;
  for (const id of new Set(ids)) {
    colisiones++;
    const nuevo = `${clave}--${id}`;
    limpio = limpio
      .split(`id="${id}"`).join(`id="${nuevo}"`)
      .split(`url(#${id})`).join(`url(#${nuevo})`)
      .split(`href="#${id}"`).join(`href="#${nuevo}"`)
      .split(`xlink:href="#${id}"`).join(`xlink:href="#${nuevo}"`);
  }
  ilustraciones[clave] = limpio;
}

const conIlustracion = tareas.filter((t) => ilustraciones[slug(t.t)]).length;

writeFileSync(`${OUT}/illustrations.ts`, cabecera(
  `Las ${Object.keys(ilustraciones).length} ilustraciones SVG (window.MRL_ART), indexadas por el título de la lección\n` +
  `// en minúsculas, sin acentos y con guiones. Los id internos van prefijados para que no\n` +
  `// se pisen entre sí. Cubren ${conIlustracion} de las ${tareas.length} tareas.`) +
`export const MRL_ART: Record<string, string> = ${json(ilustraciones)};

/** Slug de una lección: minúsculas, sin acentos, con guiones. */
export const lessonSlug = (title: string): string =>
  title.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 44);

/** Devuelve el SVG de una lección, o null si todavía no tiene ilustración. */
export const lessonArt = (title: string): string | null => MRL_ART[lessonSlug(title)] ?? null;
`);

console.log(`módulos ${CATS.length} · tareas ${tareas.length} · lecciones ${Object.keys(LESSONS).length}`);
console.log(`ilustraciones ${Object.keys(ilustraciones).length} (cubren ${conIlustracion} tareas) · ${colisiones} id prefijados`);
console.log(`preguntas ${g('QS').length} · pasos del recorrido ${g('TOUR').length} · giros ${g('GIROS').length}`);
