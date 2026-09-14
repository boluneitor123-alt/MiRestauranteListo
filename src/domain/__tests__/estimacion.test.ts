import { describe, expect, it } from 'vitest';
import { ESTIMACIONES, GIRO_GENERICO } from '@/content/estimaciones';
import { BUDGET_CONCEPTS, FIXED_CONCEPTS } from '@/content/catalog';
import { QS } from '@/content/onboarding';
import { estimarProyecto, topeDePresupuesto } from '../estimacion';
import { dishMetrics } from '../costing';
import { semaphoreLevel } from '../semaphore';

const catalogos = { presupuesto: BUDGET_CONCEPTS, fijos: FIXED_CONCEPTS };
const estimar = (answers: Record<string, string>) => estimarProyecto(answers, catalogos);
const total = (cs: Array<{ amount: number }>) => cs.reduce((a, c) => a + c.amount, 0);

const taqueria = { giro: 'Taquería', presupuesto: '$100,000 a $250,000', personal: '1 a 2' };

describe('la tabla y el diagnóstico hablan el mismo idioma', () => {
  it('todos los giros de la pregunta 1 tienen bloque', () => {
    const delDiagnostico = QS.find((q) => q.id === 'giro')!.o;
    expect(delDiagnostico.filter((g) => !(g in ESTIMACIONES))).toEqual([]);
  });

  it('cada bloque trae los 13 conceptos de presupuesto y los 10 de gastos', () => {
    const presupuesto = BUDGET_CONCEPTS.map((c) => c.key).sort();
    const fijos = FIXED_CONCEPTS.map((c) => c.key).sort();
    for (const [giro, tabla] of Object.entries(ESTIMACIONES)) {
      expect(Object.keys(tabla.presupuesto).sort(), giro).toEqual(presupuesto);
      expect(Object.keys(tabla.gastosFijos).sort(), giro).toEqual(fijos);
    }
  });

  it('los giros de mariscos llevan margen castigado, no el promedio', () => {
    /*
      El promedio de los demás giros daba 65% y 67%. En mariscos es imposible:
      el insumo es volátil, la merma de limpieza es alta y el producto se echa
      a perder. Si alguien vuelve a derivarlos de los rangos generales, esto
      truena.
    */
    expect(ESTIMACIONES['Marisquería'].margin).toBeLessThanOrEqual(58);
    expect(ESTIMACIONES['Sushi'].margin).toBeLessThanOrEqual(62);
    expect(ESTIMACIONES['Marisquería'].margin).toBeLessThan(ESTIMACIONES['Taquería'].margin);
  });

  it('ningún bloque trae un ticket o un margen absurdo', () => {
    for (const [giro, tabla] of Object.entries(ESTIMACIONES)) {
      expect(tabla.ticket, giro).toBeGreaterThan(0);
      expect(tabla.margin, giro).toBeGreaterThan(0);
      expect(tabla.margin, giro).toBeLessThan(100);
    }
  });

  it('ningún platillo sembrado sale con insumo comprado ya hecho', () => {
    /*
      «Guisado del día» a $110/kg, «Base de postre» a $16/pz y «Verduras y
      caldo» a $20/l no eran insumos: eran el platillo terminado. Con eso, el
      Costeador le enseñaba a la persona a costear comprando en vez de
      producir, y los números no cuadraban con lo que ella paga en el mercado.
    */
    const comprados = ['Guisado del día', 'Base de postre', 'Verduras y caldo', 'Sopa'];
    for (const [giro, tabla] of Object.entries(ESTIMACIONES)) {
      for (const p of tabla.platillos) {
        for (const i of p.ingredientes) {
          expect(comprados, `${giro} · ${p.nombre}`).not.toContain(i.nombre);
        }
      }
    }
  });

  it('ningún platillo sembrado sale en rojo, en ningún giro', () => {
    /*
      No es sólo la taquería: la orden de alitas y la comida corrida también
      salían arriba de 38% con los insumos inflados. Un platillo en rojo de
      fábrica es la app desconfiando de su propia estimación.
    */
    for (const giro of Object.keys(ESTIMACIONES)) {
      const e = estimarProyecto({ giro }, catalogos);
      for (const d of e.dishes) {
        const m = dishMetrics(d, { subrecipes: [] });
        expect(semaphoreLevel(m.foodCostRounded), `${giro} · ${d.name}`).not.toBe('peligroso');
      }
    }
  });

  it('una taquería recién diagnosticada no recibe el aviso de food cost peligroso', () => {
    // Era el síntoma que se quería matar: la app criticando su propia
    // estimación en la primera pantalla que alguien ve.
    const e = estimarProyecto({ giro: 'Taquería' }, catalogos);
    const niveles = e.dishes.map((d) => semaphoreLevel(dishMetrics(d, { subrecipes: [] }).foodCostRounded));
    expect(niveles).not.toContain('peligroso');
  });

  it('todo platillo sembrado dice qué tanto se vende', () => {
    /*
      Sin popularidad, Mi menú no puede aconsejar nada sobre un platillo
      estimado: la regla del ancla y el empujón en la carta la leen. Salió
      vacía la primera vez y las dos reglas quedaron mudas.
    */
    for (const [giro, tabla] of Object.entries(ESTIMACIONES)) {
      for (const p of tabla.platillos) {
        expect(p.popularidad, `${giro} · ${p.nombre}`).toBeTruthy();
      }
    }
  });

  it('la popularidad llega hasta el platillo del Costeador', () => {
    for (const giro of Object.keys(ESTIMACIONES)) {
      const e = estimarProyecto({ giro }, catalogos);
      for (const d of e.dishes) expect(d.popularity, `${giro} · ${d.name}`).toBeTruthy();
    }
  });

  it('cada platillo sembrado sabe en qué parte de la carta va', () => {
    // Se perdió en la misma migración que la popularidad: sin sección, el agua
    // de horchata de una taquería se imprimía entre los platos fuertes.
    for (const [giro, tabla] of Object.entries(ESTIMACIONES)) {
      for (const p of tabla.platillos) expect(p.seccion, `${giro} · ${p.nombre}`).toBeTruthy();
    }
    expect(estimarProyecto({ giro: 'Taquería' }, catalogos).dishes.map((d) => d.section)).toContain('Bebidas');
  });

  it('los platillos traen ingredientes con precio de compra', () => {
    for (const [giro, tabla] of Object.entries(ESTIMACIONES)) {
      for (const p of tabla.platillos) {
        expect(p.ingredientes.length, `${giro} · ${p.nombre}`).toBeGreaterThan(0);
        for (const i of p.ingredientes) expect(i.buyPrice, `${giro} · ${i.nombre}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('el diagnóstico llena la app', () => {
  it('una taquería abre con presupuesto, gastos y platillos, no en ceros', () => {
    const e = estimar(taqueria);
    expect(total(e.budget)).toBeGreaterThan(0);
    expect(total(e.fixed)).toBeGreaterThan(0);
    expect(e.dishes.length).toBe(3);
    expect(e.ticket).toBe(ESTIMACIONES['Taquería'].ticket);
  });

  it('los platillos vienen costeados, no vacíos', () => {
    const [primero] = estimar(taqueria).dishes;
    expect(primero.price).toBeGreaterThan(0);
    expect(primero.ingredients.length).toBeGreaterThan(0);
    expect(primero.ingredients.every((i) => (i.buyPrice ?? 0) > 0)).toBe(true);
  });

  it('el tope de presupuesto sale de su respuesta, no de los $250,000 de fábrica', () => {
    expect(estimar({ ...taqueria, presupuesto: 'Menos de $50,000' }).budgetCap).toBe(40_000);
    expect(estimar({ ...taqueria, presupuesto: 'Más de $500,000' }).budgetCap).toBe(600_000);
    expect(topeDePresupuesto('$50,000 a $100,000')).toBe(75_000);
    expect(topeDePresupuesto('lo que sea')).toBeUndefined();
  });

  it('con menos dinero, el arranque cuesta menos', () => {
    const poco = estimar({ ...taqueria, presupuesto: 'Menos de $50,000' });
    const mucho = estimar({ ...taqueria, presupuesto: 'Más de $500,000' });
    expect(total(poco.budget)).toBeLessThan(total(mucho.budget));
  });

  it('con más gente, la nómina sube y el ticket no se mueve', () => {
    const solo = estimar({ ...taqueria, personal: 'Solo yo' });
    const equipo = estimar({ ...taqueria, personal: '6 o más' });
    const nomina = (e: ReturnType<typeof estimar>) => e.fixed.find((c) => c.key === 'nomina')!.amount;
    expect(nomina(equipo)).toBeGreaterThan(nomina(solo));
    expect(equipo.ticket).toBe(solo.ticket);
    expect(equipo.margin).toBe(solo.margin);
  });

  it('cada giro estima distinto: no es la misma tabla con otro nombre', () => {
    const taco = estimar({ giro: 'Taquería' });
    const sushi = estimar({ giro: 'Sushi' });
    expect(taco.ticket).not.toBe(sushi.ticket);
    expect(total(taco.budget)).not.toBe(total(sushi.budget));
  });
});

describe('la etiqueta dice la verdad de lo que sabe', () => {
  it('nombra el giro y el equipo cuando los tiene', () => {
    expect(estimar(taqueria).sello).toBe('Estimado para taquería con equipo de 1 a 2 personas');
  });

  it('sin equipo, no lo inventa', () => {
    expect(estimar({ giro: 'Fonda' }).sello).toBe('Estimado para fonda');
  });

  it('con el diagnóstico a medias usa el promedio y lo dice, sin nombrar un giro', () => {
    const e = estimar({});
    expect(e.sello).toBe('Estimado general para negocio de comida');
    expect(total(e.budget)).toBeGreaterThan(0);
  });

  it('«Otro» tampoco presume un giro', () => {
    expect(estimar({ giro: GIRO_GENERICO }).sello).toBe('Estimado general para negocio de comida');
  });

  it('un giro que no está en la tabla cae en el genérico sin romperse', () => {
    const e = estimar({ giro: 'Cevichería de la esquina' });
    expect(e.sello).toBe('Estimado general para negocio de comida');
    expect(total(e.fixed)).toBeGreaterThan(0);
  });
});

describe('todo lo estimado queda marcado', () => {
  it('cada cifra sembrada deja su ruta', () => {
    const e = estimar(taqueria);
    expect(e.estimados).toContain('ticket');
    expect(e.estimados).toContain('margin');
    expect(e.estimados).toContain('budgetCap');
    for (const c of e.budget) expect(e.estimados).toContain(`presupuesto:${c.key}`);
    for (const c of e.fixed) expect(e.estimados).toContain(`fijos:${c.key}`);
    for (const d of e.dishes) expect(e.estimados).toContain(`platillo:${d.id}`);
  });

  it('no marca nada que no haya sembrado', () => {
    const e = estimar(taqueria);
    const esperadas = 3 + e.budget.length + e.fixed.length + e.dishes.length;
    expect(e.estimados).toHaveLength(esperadas);
  });
});

describe('es una función pura', () => {
  it('dos llamadas iguales dan lo mismo', () => {
    expect(estimar(taqueria)).toEqual(estimar(taqueria));
  });

  it('no muta las respuestas ni los catálogos', () => {
    const answers = { ...taqueria };
    const antes = JSON.stringify({ answers, catalogos });
    estimar(answers);
    expect(JSON.stringify({ answers, catalogos })).toBe(antes);
  });
});
