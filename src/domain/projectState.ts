/**
 * Estado del proyecto del emprendedor (README § 5).
 *
 * Es la forma normalizada que usan la app, la API y los documentos imprimibles.
 * El prototipo guardaba todo en `localStorage['mrl.state.v2']`; aquí vive en el
 * servidor y el respaldo `.json` del prototipo entra por `importBackup`.
 */

import { BUDGET_CONCEPTS, FIXED_CONCEPTS } from '@/content/catalog';
import { ROUTE_MODULES } from '@/content/route';
import { taskKey, type ExtraTask } from './progress';
import type { Concept, Subconcept } from './finance';
import type { Dish, Ingredient, Subrecipe } from './types';
import { SURVIVAL_DEFAULTS } from './survival';
import { DELIVERY_DEFAULTS, type DeliveryInput } from './delivery';
import { DEFAULT_FOOD_COST_TARGET } from './costing';
import { BREAKEVEN_DEFAULTS } from './finance';
import { DEFAULT_LAYOUT_ID } from './menu';
import { isUnitCode, type UnitCode } from './units';

export interface Profile {
  name: string;
  email: string;
  phone: string;
  city: string;
}

export interface ProjectData {
  name: string;
  giro: string;
  /** Presupuesto tope para abrir. */
  budgetCap: number;
  openDate: string;
  people: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  date: string;
}

export interface Supplier {
  id: string;
  name: string;
  item: string;
  contact: string;
  terms: string;
  delivery: string;
}

/** Los tres supuestos de la prueba de estrés, en porcentaje. */
export interface StressTest {
  /** Si tus insumos suben. */
  supplies: number;
  /** Si tu renta sube. */
  rent: number;
  /** Si vendes menos de lo que esperas. */
  sales: number;
}

export const NO_STRESS: StressTest = { supplies: 0, rent: 0, sales: 0 };

/**
 * Los cinco números del Administrador de anuncios de Meta. Se guardan como el
 * usuario los capturó para que pueda volver a abrir el análisis.
 */
export interface AdsCapture {
  spend: number;
  days: number;
  reach: number;
  results: number;
  visits: number;
}

export const EMPTY_ADS: AdsCapture = { spend: 0, days: 0, reach: 0, results: 0, visits: 0 };

export interface AppSettings {
  alerts: boolean;
  weekly: boolean;
  /** "Guardar en el teléfono". */
  saveOnDevice: boolean;
  currency: 'MXN' | 'USD';
  accent: string;
  dark: boolean;
  tourDone: boolean;
}

export interface ProjectState {
  profile: Profile;
  project: ProjectData;
  /** Respuestas del onboarding, por id de pregunta. */
  answers: Record<string, string>;
  /** Tareas completadas, por clave del dominio. */
  done: Record<string, boolean>;
  /** Módulos omitidos → motivo. */
  skipped: Record<string, string>;
  extraTasks: ExtraTask[];
  dishes: Dish[];
  subrecipes: Subrecipe[];
  budget: Concept[];
  budgetSub: Record<string, Subconcept[]>;
  fixed: Concept[];
  notes: Note[];
  suppliers: Supplier[];
  ticket: number;
  margin: number;
  /** ¿Cuánto quieres ganar tú al mes? */
  ownerGoal: number;
  hours: number;
  closedOneDay: boolean;
  /** Horas que trabaja el dueño a la semana. Alimenta "Lo que vale tu hora". */
  weeklyHours: number;
  /** Minutos que tarda tu platillo promedio. Alimenta la utilidad por minuto. */
  prepMinutes: number;
  /** Cuántos platillos salen al día en total, para estimar la compra de insumos. */
  dailyMix: number;
  /** Prueba de estrés: cuánto suben los insumos, cuánto la renta, cuánto baja la venta. */
  stress: StressTest;
  /** Lo último que capturó en la calculadora de delivery. */
  delivery: DeliveryInput;
  /** Lo último que capturó en el analizador de anuncios. */
  ads: AdsCapture;
  /**
   * Sugerencias del plan de acción de Mi Menú archivadas con "No, gracias",
   * por clave de sugerencia (`tipo|platillo`).
   */
  ignoredActions: Record<string, boolean>;
  fcTarget: number;
  layout: string;
  settings: AppSettings;
}

/** Los seis acentos de Ajustes (const ACCENTS del prototipo). El primero es la marca. */
export const ACCENT_OPTIONS = [
  { name: 'Naranja', value: '#e07a2b' },
  { name: 'Terracota', value: '#c67139' },
  { name: 'Ámbar', value: '#e0891c' },
  { name: 'Verde', value: '#1f8a5a' },
  { name: 'Azul', value: '#2f6fd0' },
  { name: 'Ciruela', value: '#8d3f6d' },
] as const;

/** El naranja de marca. Con él manda la rampa escrita a mano en globals.css. */
export const BRAND_ACCENT = ACCENT_OPTIONS[0].value;

export const DEFAULT_SETTINGS: AppSettings = {
  alerts: true,
  weekly: true,
  saveOnDevice: true,
  currency: 'MXN',
  accent: ACCENT_OPTIONS[0].value,
  dark: false,
  tourDone: false,
};

/** Estado inicial de un proyecto nuevo: sin tareas hechas y sin platillos. */
export function emptyProjectState(overrides: Partial<ProjectState> = {}): ProjectState {
  return {
    profile: { name: '', email: '', phone: '', city: '' },
    project: { name: 'Mi negocio', giro: 'Otro', budgetCap: 250000, openDate: '', people: '' },
    answers: {},
    done: {},
    skipped: {},
    extraTasks: [],
    dishes: [],
    subrecipes: [],
    budget: BUDGET_CONCEPTS.map((c) => ({ ...c, amount: 0 })),
    budgetSub: {},
    fixed: FIXED_CONCEPTS.map((c) => ({ ...c, amount: 0 })),
    notes: [],
    suppliers: [],
    ticket: BREAKEVEN_DEFAULTS.ticket,
    margin: BREAKEVEN_DEFAULTS.grossMargin,
    ownerGoal: BREAKEVEN_DEFAULTS.ownerGoal,
    hours: BREAKEVEN_DEFAULTS.hours,
    closedOneDay: false,
    weeklyHours: SURVIVAL_DEFAULTS.weeklyHours,
    prepMinutes: SURVIVAL_DEFAULTS.prepMinutes,
    dailyMix: SURVIVAL_DEFAULTS.dailyMix,
    stress: { ...NO_STRESS },
    delivery: { ...DELIVERY_DEFAULTS },
    ads: { ...EMPTY_ADS },
    ignoredActions: {},
    fcTarget: DEFAULT_FOOD_COST_TARGET,
    layout: DEFAULT_LAYOUT_ID,
    settings: { ...DEFAULT_SETTINGS },
    ...overrides,
  };
}

/* ─────────────────────────────  Respaldo .json  ───────────────────────────── */

/** Versión del respaldo que genera esta app. */
export const BACKUP_VERSION = 3;

export interface Backup {
  version: number;
  exportedAt: string;
  state: ProjectState;
}

export function exportBackup(state: ProjectState, now: Date = new Date()): Backup {
  return { version: BACKUP_VERSION, exportedAt: now.toISOString(), state };
}

type Raw = Record<string, unknown>;

const asRecord = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const asString = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);
const asBoolean = (value: unknown, fallback = false): boolean => (typeof value === 'boolean' ? value : fallback);
const asUnit = (value: unknown, fallback: UnitCode): UnitCode => (isUnitCode(value) ? value : fallback);

function importIngredient(raw: unknown, id: string): Ingredient {
  const r = asRecord(raw);
  return {
    id: asString(r.id, id),
    name: asString(r.name, 'Ingrediente'),
    qty: asNumber(r.qty, 0),
    unit: asUnit(r.unit ?? r.u, 'g'),
    // El prototipo usaba `bu`, `uc` y `merma`.
    buyUnit: isUnitCode(r.buyUnit ?? r.bu) ? asUnit(r.buyUnit ?? r.bu, 'g') : undefined,
    buyPrice: typeof r.buyPrice === 'number' ? r.buyPrice : undefined,
    buyQty: typeof r.buyQty === 'number' ? r.buyQty : undefined,
    unitPrice: typeof (r.unitPrice ?? r.uc) === 'number' ? (r.unitPrice as number) ?? (r.uc as number) : undefined,
    waste: asNumber(r.waste ?? r.merma, 0),
    subrecipeId: typeof (r.subrecipeId ?? r.srId) === 'string' ? ((r.subrecipeId ?? r.srId) as string) : undefined,
  };
}

function importDish(raw: unknown, index: number): Dish {
  const r = asRecord(raw);
  const id = asString(r.id, `d${index}`);
  return {
    id,
    name: asString(r.name, 'Platillo'),
    price: asNumber(r.price, 0),
    // El prototipo llamaba `ing`, `varios`, `empaque`, `iva`, `commission`, `cat`, `pop`.
    ingredients: asArray(r.ingredients ?? r.ing).map((i, n) => importIngredient(i, `${id}i${n}`)),
    portions: asNumber(r.portions, 1),
    extrasPct: asNumber(r.extrasPct ?? r.varios, 3),
    packaging: asNumber(r.packaging ?? r.empaque, 0),
    labor: asNumber(r.labor, 0),
    priceIncludesTax: asBoolean(r.priceIncludesTax ?? r.iva, true),
    deliveryCommission: asNumber(r.deliveryCommission ?? r.commission, 28),
    section: (asString(r.section ?? r.cat, 'Fuertes') as Dish['section']) ?? 'Fuertes',
    popularity: (asString(r.popularity ?? r.pop, 'media') as Dish['popularity']) ?? 'media',
    star: asBoolean(r.star, false),
  };
}

function importSubrecipe(raw: unknown, index: number): Subrecipe {
  const r = asRecord(raw);
  const id = asString(r.id, `sr${index}`);
  return {
    id,
    name: asString(r.name, 'Sub-receta'),
    yieldQty: asNumber(r.yieldQty, 1),
    unit: asUnit(r.unit ?? r.u, 'ml'),
    ingredients: asArray(r.ingredients ?? r.ing).map((i, n) => importIngredient(i, `${id}i${n}`)),
  };
}

/**
 * Normaliza los conceptos, vengan como lista (respaldo propio) o como mapa
 * clave → monto más una lista de conceptos propios (respaldo del prototipo).
 * Lo que no traiga monto queda en cero: el respaldo manda, no los montos de
 * referencia del catálogo.
 */
function importConcepts(base: readonly Concept[], value: unknown, extra: unknown): Concept[] {
  if (Array.isArray(value)) {
    const concepts: Concept[] = [];
    for (const raw of value) {
      const r = asRecord(raw);
      const key = asString(r.key);
      if (!key) continue;
      const known = base.find((c) => c.key === key);
      const concept: Concept = {
        key,
        label: asString(r.label, known?.label ?? key),
        amount: asNumber(r.amount, 0),
      };
      if (asBoolean(r.custom) || !known) concept.custom = true;
      concepts.push(concept);
    }

    // Un concepto base que el respaldo no traiga se recupera en cero.
    for (const c of base) {
      if (!concepts.some((x) => x.key === c.key)) concepts.push({ ...c, amount: 0 });
    }
    return concepts;
  }

  const map = asRecord(value);
  const concepts = base.map((c) => ({ ...c, amount: asNumber(map[c.key], 0) }));
  for (const raw of asArray(extra)) {
    const r = asRecord(raw);
    const key = asString(r.k ?? r.key);
    if (!key) continue;
    concepts.push({ key, label: asString(r.label, key), amount: asNumber(map[key], 0), custom: true });
  }
  return concepts;
}

function importSubconcepts(raw: unknown): Record<string, Subconcept[]> {
  const out: Record<string, Subconcept[]> = {};
  for (const [key, value] of Object.entries(asRecord(raw))) {
    const list = asArray(value).map((item, i) => {
      const r = asRecord(item);
      return {
        id: asString(r.id, `${key}s${i}`),
        label: asString(r.label ?? r.l, 'Parte'),
        amount: asNumber(r.amount ?? r.v, 0),
      };
    });
    if (list.length) out[key] = list;
  }
  return out;
}

/**
 * Importa un respaldo, sea de esta app o del prototipo (`mrl.state.v2`).
 * Todo lo que falte o venga corrupto cae a su valor por defecto: un respaldo a
 * medias es mejor que un error en la cara del usuario.
 */
export function importBackup(input: unknown): ProjectState {
  const root = asRecord(input);
  const raw = asRecord(root.state ?? root);
  const base = emptyProjectState();

  const profile = asRecord(raw.profile);
  const project = asRecord(raw.project);
  const settings = asRecord(raw.settings);
  const stress = asRecord(raw.stress);
  const delivery = asRecord(raw.delivery);
  const ads = asRecord(raw.ad ?? raw.ads);

  const state: ProjectState = {
    profile: {
      name: asString(profile.name, base.profile.name),
      email: asString(profile.email, base.profile.email),
      phone: asString(profile.phone, base.profile.phone),
      city: asString(profile.city, base.profile.city),
    },
    project: {
      name: asString(project.name, base.project.name),
      giro: asString(project.giro, base.project.giro),
      budgetCap: asNumber(project.budgetCap ?? project.budget, base.project.budgetCap),
      openDate: asString(project.openDate, base.project.openDate),
      people: asString(project.people, base.project.people),
    },
    answers: Object.fromEntries(
      Object.entries(asRecord(raw.answers)).filter(([, v]) => typeof v === 'string'),
    ) as Record<string, string>,
    done: Object.fromEntries(
      Object.entries(asRecord(raw.done)).map(([k, v]) => [k, !!v]),
    ),
    skipped: Object.fromEntries(
      Object.entries(asRecord(raw.skipped))
        .filter(([, v]) => typeof v === 'string' && v.length > 0)
        .map(([k, v]) => [k, v as string]),
    ),
    extraTasks: asArray(raw.extraTasks).map((item, i) => {
      const r = asRecord(item);
      return {
        id: asString(r.id, `x${i}`),
        moduleId: asString(r.moduleId ?? r.cat, ROUTE_MODULES[0].id),
        title: asString(r.title ?? r.t, 'Tarea'),
        hint: asString(r.hint ?? r.h, ''),
      };
    }),
    dishes: asArray(raw.dishes).map(importDish),
    subrecipes: asArray(raw.subrecipes).map(importSubrecipe),
    budget: importConcepts(BUDGET_CONCEPTS, raw.budget, raw.budgetExtra),
    budgetSub: importSubconcepts(raw.budgetSub),
    fixed: importConcepts(FIXED_CONCEPTS, raw.fixed, raw.fixedExtra),
    notes: asArray(raw.notes).map((item, i) => {
      const r = asRecord(item);
      return {
        id: asString(r.id, `n${i}`),
        title: asString(r.title, 'Nota'),
        body: asString(r.body, ''),
        date: asString(r.date, ''),
      };
    }),
    suppliers: asArray(raw.suppliers).map((item, i) => {
      const r = asRecord(item);
      return {
        id: asString(r.id, `s${i}`),
        name: asString(r.name, 'Proveedor'),
        item: asString(r.item, ''),
        contact: asString(r.contact, ''),
        terms: asString(r.terms, ''),
        delivery: asString(r.delivery, ''),
      };
    }),
    ticket: asNumber(raw.ticket, base.ticket),
    margin: asNumber(raw.margin, base.margin),
    ownerGoal: asNumber(raw.ownerGoal ?? raw.meta, base.ownerGoal),
    hours: asNumber(raw.hours, base.hours),
    closedOneDay: asBoolean(raw.closedOneDay ?? raw.closedDay, false),
    weeklyHours: asNumber(raw.weeklyHours ?? raw.hrsWeek, base.weeklyHours),
    prepMinutes: asNumber(raw.prepMinutes ?? raw.prepMin, base.prepMinutes),
    dailyMix: asNumber(raw.dailyMix ?? raw.mixDaily, base.dailyMix),
    stress: {
      supplies: asNumber(stress.supplies ?? raw.stressIns, 0),
      rent: asNumber(stress.rent ?? raw.stressRent, 0),
      sales: asNumber(stress.sales ?? raw.stressSales, 0),
    },
    delivery: {
      appPrice: asNumber(delivery.appPrice, DELIVERY_DEFAULTS.appPrice),
      counterPrice: asNumber(delivery.counterPrice, DELIVERY_DEFAULTS.counterPrice),
      cost: asNumber(delivery.cost, DELIVERY_DEFAULTS.cost),
      packaging: asNumber(delivery.packaging, DELIVERY_DEFAULTS.packaging),
      commissionPct: asNumber(delivery.commissionPct, DELIVERY_DEFAULTS.commissionPct),
      ordersPerDay: asNumber(delivery.ordersPerDay, DELIVERY_DEFAULTS.ordersPerDay),
    },
    ads: {
      spend: asNumber(ads.spend, 0),
      days: asNumber(ads.days, 0),
      reach: asNumber(ads.reach, 0),
      results: asNumber(ads.results, 0),
      visits: asNumber(ads.visits, 0),
    },
    // El prototipo lo guardaba como `ignoredActions`.
    ignoredActions: Object.fromEntries(
      Object.entries(asRecord(raw.ignoredActions)).filter(([, v]) => v === true).map(([k]) => [k, true]),
    ),
    fcTarget: asNumber(raw.fcTarget, base.fcTarget),
    layout: asString(raw.layout, base.layout),
    settings: {
      alerts: asBoolean(settings.alerts, DEFAULT_SETTINGS.alerts),
      weekly: asBoolean(settings.weekly, DEFAULT_SETTINGS.weekly),
      // El prototipo llamaba `offline` a "guardar en el teléfono".
      saveOnDevice: asBoolean(settings.saveOnDevice ?? settings.offline, DEFAULT_SETTINGS.saveOnDevice),
      currency: settings.currency === 'USD' ? 'USD' : 'MXN',
      accent: asString(settings.accent, DEFAULT_SETTINGS.accent),
      dark: asBoolean(settings.dark, DEFAULT_SETTINGS.dark),
      tourDone: asBoolean(settings.tourDone, DEFAULT_SETTINGS.tourDone),
    },
  };

  // Las tareas completadas que ya no existen en la ruta se descartan.
  const validKeys = new Set(
    ROUTE_MODULES.flatMap((m) => m.tasks.map((_, i) => taskKey(m.id, i))).concat(
      state.extraTasks.map((x) => `x${x.id}`),
    ),
  );
  state.done = Object.fromEntries(Object.entries(state.done).filter(([k]) => validKeys.has(k)));

  return state;
}
