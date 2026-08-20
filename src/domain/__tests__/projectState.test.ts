import { describe, expect, it } from 'vitest';
import { BACKUP_VERSION, emptyProjectState, exportBackup, importBackup } from '../projectState';
import { dishMetrics, subrecipeBatchCost } from '../costing';
import { investment } from '../finance';
import { projectProgress } from '../progress';
import { ROUTE_MODULES } from '@/content/route';

/** Respaldo con la forma que exportaba el prototipo (`mrl.state.v2`). */
const backupDelPrototipo = {
  profile: { name: 'Ana Rodríguez', email: 'ana@correo.com', phone: '55 1122 3344', city: 'Guadalajara, Jal.' },
  project: { name: 'Taquería La Nueva', giro: 'Taquería', budget: 250000, openDate: 'Noviembre 2026', people: '1 a 2' },
  answers: { giro: 'Taquería', etapa: 'Ya estoy planeando' },
  done: { concepto0: true, concepto1: true, borrada9: true },
  skipped: { permisos: 'No aplica a mi tipo de negocio' },
  extraTasks: [{ id: '77', cat: 'local', t: 'Pedir cotización de obra', h: 'Con dos contratistas' }],
  dishes: [
    {
      id: 'd1',
      name: 'Taco de pastor',
      price: 28,
      varios: 3,
      iva: true,
      cat: 'Fuertes',
      pop: 'alta',
      ing: [
        { name: 'Carne al pastor', qty: 70, u: 'g', uc: 0.09 },
        { name: 'Jitomate', qty: 1, u: 'kg', bu: 'kg', buyPrice: 28, buyQty: 1, merma: 10 },
      ],
    },
  ],
  subrecipes: [
    {
      id: 'sr1',
      name: 'Salsa roja de la casa',
      yieldQty: 3000,
      u: 'ml',
      ing: [{ name: 'Jitomate', qty: 3, u: 'kg', bu: 'kg', buyPrice: 28, buyQty: 1, merma: 10 }],
    },
  ],
  budget: { renta: 45000, cocina: 45000, obra: 40000 },
  budgetExtra: [{ k: 'letrero', label: 'Letrero luminoso' }],
  budgetSub: { uten: [{ l: 'Platos', v: 5000 }, { l: 'Cucharas', v: 5000 }, { l: 'Sartenes', v: 500 }] },
  fixed: { renta: 22000, nomina: 38000 },
  fixedExtra: [],
  notes: [{ id: 'n1', title: 'Local de Av. Juárez', body: 'Renta $18,000', date: 'Hoy' }],
  suppliers: [{ id: 's1', name: 'Carnes El Rancho', item: 'Carne', contact: '55', terms: 'Crédito 8 días', delivery: 'Martes' }],
  ticket: 185,
  margin: 68,
  meta: 30000,
  hours: 10,
  closedDay: true,
  fcTarget: 25,
  layout: 'tri',
  settings: { alerts: false, weekly: true, offline: true, currency: 'MXN', accent: '#1f8a5a', dark: true },
};

describe('estado del proyecto (README § 5)', () => {
  it('un proyecto nuevo arranca sin tareas hechas ni platillos', () => {
    const s = emptyProjectState();
    expect(s.dishes).toHaveLength(0);
    expect(Object.keys(s.done)).toHaveLength(0);
    expect(projectProgress({ modules: ROUTE_MODULES, done: s.done }).pct).toBe(0);
    // Los conceptos base están, pero en cero: los montos los pone el usuario.
    expect(s.budget).toHaveLength(13);
    expect(investment({ concepts: s.budget }).total).toBe(0);
  });
});

describe('importador del respaldo del prototipo (README § 13, paso 2)', () => {
  const state = importBackup(backupDelPrototipo);

  it('traduce perfil y datos del proyecto', () => {
    expect(state.profile.name).toBe('Ana Rodríguez');
    expect(state.project.name).toBe('Taquería La Nueva');
    expect(state.project.budgetCap).toBe(250000);
  });

  it('descarta tareas completadas que ya no existen en la ruta', () => {
    expect(state.done.concepto0).toBe(true);
    expect(state.done.borrada9).toBeUndefined();
  });

  it('conserva los módulos omitidos con su motivo', () => {
    expect(state.skipped.permisos).toBe('No aplica a mi tipo de negocio');
    const p = projectProgress({ modules: ROUTE_MODULES, done: state.done, skipped: state.skipped, extraTasks: state.extraTasks });
    expect(p.total).toBe(90 - 4 + 1); // sin Permisos, más la tarea propia
  });

  it('traduce las tareas propias del usuario', () => {
    expect(state.extraTasks).toEqual([
      { id: '77', moduleId: 'local', title: 'Pedir cotización de obra', hint: 'Con dos contratistas' },
    ]);
  });

  it('traduce los platillos con sus nombres viejos de campo', () => {
    const dish = state.dishes[0];
    expect(dish.extrasPct).toBe(3);
    expect(dish.priceIncludesTax).toBe(true);
    expect(dish.section).toBe('Fuertes');
    expect(dish.popularity).toBe('alta');
    expect(dish.ingredients[0].unitPrice).toBe(0.09);
    expect(dish.ingredients[1].waste).toBe(10);
    expect(dish.ingredients[1].buyUnit).toBe('kg');
    // Y el costeo sobre los datos importados sigue dando lo mismo.
    expect(dishMetrics(dish).ingredientsCost).toBeCloseTo(6.3 + 28 / 0.9, 4);
  });

  it('traduce las sub-recetas y las sigue costeando igual', () => {
    const sub = state.subrecipes[0];
    expect(sub.unit).toBe('ml');
    expect(sub.yieldQty).toBe(3000);
    expect(subrecipeBatchCost(sub, { subrecipes: state.subrecipes })).toBeCloseTo(93.3333, 3);
  });

  it('convierte los conceptos y sus subconceptos', () => {
    const uten = state.budgetSub.uten;
    expect(uten).toHaveLength(3);
    expect(uten[0]).toEqual({ id: 'utens0', label: 'Platos', amount: 5000 });

    const result = investment({ concepts: state.budget, subconcepts: state.budgetSub, budgetCap: state.project.budgetCap });
    // Renta 45k + obra 40k + cocina 45k + utensilios por subconceptos 10.5k.
    expect(result.total).toBe(140500);
    expect(result.byConcept.find((c) => c.key === 'uten')?.total).toBe(10500);
  });

  it('conserva los conceptos propios del usuario', () => {
    expect(state.budget.find((c) => c.key === 'letrero')).toEqual({
      key: 'letrero',
      label: 'Letrero luminoso',
      amount: 0,
      custom: true,
    });
  });

  it('traduce los parámetros del punto de equilibrio', () => {
    expect(state.ticket).toBe(185);
    expect(state.ownerGoal).toBe(30000);
    expect(state.hours).toBe(10);
    expect(state.closedOneDay).toBe(true);
    expect(state.fcTarget).toBe(25);
    expect(state.layout).toBe('tri');
  });

  it('traduce los ajustes, incluido el viejo nombre de "guardar en el teléfono"', () => {
    expect(state.settings.accent).toBe('#1f8a5a');
    expect(state.settings.dark).toBe(true);
    expect(state.settings.alerts).toBe(false);
    expect(state.settings.saveOnDevice).toBe(true);
    expect(state.settings.currency).toBe('MXN');
  });

  it('no se rompe con un archivo vacío, corrupto o de otro programa', () => {
    for (const basura of [null, undefined, {}, [], 'texto', 42, { state: null }, { dishes: 'no es lista' }]) {
      const s = importBackup(basura);
      expect(s.dishes).toEqual([]);
      expect(s.budget).toHaveLength(13);
      expect(s.settings.currency).toBe('MXN');
    }
  });

  it('va y vuelve sin perder nada por el respaldo propio', () => {
    const backup = exportBackup(state);
    expect(backup.version).toBe(BACKUP_VERSION);
    expect(importBackup(backup)).toEqual(state);
    expect(importBackup(JSON.parse(JSON.stringify(backup)))).toEqual(state);
  });
});
