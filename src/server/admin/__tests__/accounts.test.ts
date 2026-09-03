import { describe, expect, it } from 'vitest';
import { CATS, TOTAL_TASKS, taskKey } from '@/content/route';
import { buildAccount, buildAccounts, estadoDe, filterAccounts, type AccountInput } from '../accounts';

const DIA = 86_400_000;
const AHORA = Date.UTC(2026, 8, 3);
const OPTS = { now: AHORA, trialDays: 7 };

/** Llaves de las primeras `n` tareas de la ruta, en orden. */
const primeras = (n: number): string[] =>
  CATS.flatMap((c) => c.tasks.map((_, i) => taskKey(c.id, i))).slice(0, n);

const base: AccountInput = {
  userId: 'u1',
  email: 'ana@ejemplo.mx',
  name: 'Ana',
  createdAt: AHORA - 30 * DIA,
  doneKeys: [],
};

describe('el estado de una cuenta', () => {
  it('quien tiene licencia viva aparece como que pagó', () => {
    expect(estadoDe({ license: { status: 'activada' }, trialStartedAt: AHORA - 90 * DIA, ...OPTS })).toBe('pago');
    expect(estadoDe({ license: { status: 'nueva' }, ...OPTS })).toBe('pago');
  });

  it('una licencia revocada o reembolsada ya no cuenta como pago', () => {
    // Si contara, alguien reembolsado se vería como cliente activo.
    expect(estadoDe({ license: { status: 'revocada' }, trialStartedAt: AHORA - 90 * DIA, ...OPTS })).toBe('prueba-vencida');
    expect(estadoDe({ license: { status: 'reembolsada' }, trialStartedAt: AHORA - DIA, ...OPTS })).toBe('en-prueba');
  });

  it('la prueba vence a los días que digan los ajustes, no a un número fijo', () => {
    expect(estadoDe({ trialStartedAt: AHORA - 6 * DIA, ...OPTS })).toBe('en-prueba');
    expect(estadoDe({ trialStartedAt: AHORA - 8 * DIA, ...OPTS })).toBe('prueba-vencida');
    // Con 14 días de prueba, el mismo caso sigue vigente.
    expect(estadoDe({ trialStartedAt: AHORA - 8 * DIA, now: AHORA, trialDays: 14 })).toBe('en-prueba');
  });

  it('quien se registró y nunca abrió la app no se cuenta como "en prueba"', () => {
    // Es el hueco honesto: no hay prueba empezada, así que no se inventa una.
    expect(estadoDe({ trialStartedAt: undefined, ...OPTS })).toBe('sin-actividad');
  });
});

describe('la fila de una cuenta', () => {
  it('el avance se cuenta contra las tareas reales de la ruta', () => {
    const fila = buildAccount({ ...base, doneKeys: primeras(3) }, OPTS);
    expect(fila.hechos).toBe(3);
    expect(fila.total).toBe(TOTAL_TASKS);
  });

  it('las llaves que no son de ninguna tarea no inflan el avance', () => {
    const fila = buildAccount({ ...base, doneKeys: [...primeras(2), 'inventada99'] }, OPTS);
    expect(fila.hechos).toBe(2);
  });

  it('dice en qué paso se quedó: el primero que le falta', () => {
    const fila = buildAccount({ ...base, doneKeys: primeras(2) }, OPTS);
    expect(fila.pasoPendiente).toBe(CATS[0].tasks[2].t);
  });

  it('quien terminó la ruta no tiene paso pendiente ni cuenta como abandono', () => {
    const todas = CATS.flatMap((c) => c.tasks.map((_, i) => taskKey(c.id, i)));
    const fila = buildAccount({ ...base, doneKeys: todas, trialStartedAt: AHORA - 90 * DIA }, OPTS);
    expect(fila.hechos).toBe(TOTAL_TASKS);
    expect(fila.pasoPendiente).toBeUndefined();
    expect(fila.abandonada).toBe(false);
  });

  it('abandonó = se le venció la prueba sin pagar y sin terminar', () => {
    const vencida = buildAccount({ ...base, trialStartedAt: AHORA - 30 * DIA, doneKeys: primeras(4) }, OPTS);
    expect(vencida.abandonada).toBe(true);

    const enPrueba = buildAccount({ ...base, trialStartedAt: AHORA - DIA, doneKeys: primeras(4) }, OPTS);
    expect(enPrueba.abandonada).toBe(false);

    const pago = buildAccount(
      { ...base, trialStartedAt: AHORA - 30 * DIA, license: { code: 'ABC', status: 'activada' } },
      OPTS,
    );
    expect(pago.abandonada).toBe(false);
  });

  it('lo que no existe queda ausente, no en cero ni en una fecha de relleno', () => {
    const fila = buildAccount(base, OPTS);
    expect(fila.giro).toBeUndefined();
    expect(fila.presupuesto).toBeUndefined();
    expect(fila.lastLoginAt).toBeUndefined();
    expect(fila.code).toBeUndefined();
  });

  it('un presupuesto de cero se conserva: cero es un dato, no un hueco', () => {
    const fila = buildAccount({ ...base, presupuesto: 0 }, OPTS);
    expect(fila.presupuesto).toBe(0);
  });

  it('el código sólo sale cuando la licencia da acceso', () => {
    expect(buildAccount({ ...base, license: { code: 'ABC', status: 'activada' } }, OPTS).code).toBe('ABC');
    expect(buildAccount({ ...base, license: { code: 'ABC', status: 'revocada' } }, OPTS).code).toBeUndefined();
  });
});

describe('la lista y sus filtros', () => {
  const filas = buildAccounts(
    [
      { ...base, userId: 'u1', email: 'ana@ejemplo.mx', name: 'Ana', createdAt: AHORA - 10 * DIA },
      {
        ...base,
        userId: 'u2',
        email: 'beto@otro.mx',
        name: 'Beto',
        createdAt: AHORA - DIA,
        trialStartedAt: AHORA - 30 * DIA,
      },
      {
        ...base,
        userId: 'u3',
        email: 'caro@ejemplo.mx',
        name: 'Caro',
        createdAt: AHORA - 40 * DIA,
        license: { code: 'XYZ', status: 'activada' },
      },
    ],
    OPTS,
  );

  it('lista a todo el mundo, haya pagado o no', () => {
    // Es el defecto que originó la sección: sólo salían quienes pagaban.
    expect(filas).toHaveLength(3);
    expect(filas.filter((f) => f.estado === 'pago')).toHaveLength(1);
  });

  it('la más reciente va primero', () => {
    expect(filas.map((f) => f.name)).toEqual(['Beto', 'Ana', 'Caro']);
  });

  it('busca por correo sin importar mayúsculas, y también por nombre', () => {
    expect(filterAccounts(filas, { query: 'EJEMPLO.MX' }).map((f) => f.name)).toEqual(['Ana', 'Caro']);
    expect(filterAccounts(filas, { query: 'beto' }).map((f) => f.name)).toEqual(['Beto']);
  });

  it('filtra por estado y por abandono', () => {
    expect(filterAccounts(filas, { estado: 'pago' }).map((f) => f.name)).toEqual(['Caro']);
    expect(filterAccounts(filas, { soloAbandonadas: true }).map((f) => f.name)).toEqual(['Beto']);
  });

  it('sin criterios devuelve todo', () => {
    expect(filterAccounts(filas, {})).toHaveLength(3);
  });
});

describe('el hueco honesto del diagnóstico', () => {
  /*
    El proyecto nace con `giro: "Otro"` y `budgetCap: 250000` de fábrica en
    cuanto alguien abre la app. El lector sólo pasa esos campos si la persona
    contestó; aquí se comprueba que la fila respeta la ausencia en vez de
    rellenarla.
  */
  it('sin diagnóstico, giro y presupuesto quedan vacíos', () => {
    const fila = buildAccount({ ...base, giro: undefined, presupuesto: undefined }, OPTS);
    expect(fila.giro).toBeUndefined();
    expect(fila.presupuesto).toBeUndefined();
  });

  it('quien no ha hecho ningún paso no "se quedó" en el primero', () => {
    // El paso pendiente existe para el CSV, pero la pantalla lo distingue.
    const fila = buildAccount(base, OPTS);
    expect(fila.hechos).toBe(0);
    expect(fila.pasoPendiente).toBe(CATS[0].tasks[0].t);
  });
});

describe('el presupuesto sólo cuenta si la persona lo fijó', () => {
  /*
    Arranca en el de fábrica y nadie obliga a cambiarlo. Enseñar esa cifra en
    la lista diría que la persona la dio, y no la dio: el presupuesto no es una
    pregunta del diagnóstico, vive en la pantalla de Más. El lector sólo lo
    pasa cuando hay marca de que lo fijó.
  */
  it('sin fijar, la celda va vacía', () => {
    expect(buildAccount({ ...base, presupuesto: undefined }, OPTS).presupuesto).toBeUndefined();
  });

  it('fijado, se conserva tal cual, incluso si coincide con el de fábrica', () => {
    expect(buildAccount({ ...base, presupuesto: 250000 }, OPTS).presupuesto).toBe(250000);
    expect(buildAccount({ ...base, presupuesto: 80000 }, OPTS).presupuesto).toBe(80000);
  });

  it('el giro y el presupuesto son independientes: uno puede estar y el otro no', () => {
    // Contestó el diagnóstico pero nunca tocó su presupuesto.
    const fila = buildAccount({ ...base, giro: 'Taquería', presupuesto: undefined }, OPTS);
    expect(fila.giro).toBe('Taquería');
    expect(fila.presupuesto).toBeUndefined();
  });
});
