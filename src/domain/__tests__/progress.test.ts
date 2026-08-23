import { describe, expect, it } from 'vitest';
import {
  PACE_MIN_TASKS,
  MIN_PACE,
  moduleTasks,
  paceProjection,
  progressLevel,
  progressWithoutModule,
  projectProgress,
  stageLabel,
  stageProgress,
  taskWindow,
  HOME_TASKS,
  taskKey,
  type RouteModule,
} from '../progress';
import { ETAPAS, ROUTE_MODULES, TOTAL_ROUTE_TASKS, SKIP_REASONS } from '@/content/route';

const modules: RouteModule[] = [
  {
    id: 'concepto',
    name: 'Concepto',
    desc: '',
    tasks: [
      { title: 'A', hint: '', why: '', next: '' },
      { title: 'B', hint: '', why: '', next: '' },
    ],
  },
  {
    id: 'permisos',
    name: 'Permisos',
    desc: '',
    tasks: [
      { title: 'C', hint: '', why: '', next: '' },
      { title: 'D', hint: '', why: '', next: '' },
    ],
  },
];

describe('contenido de Mi Ruta (README § 1.6)', () => {
  it('trae 14 módulos y 90 tareas de seed', () => {
    expect(ROUTE_MODULES).toHaveLength(14);
    expect(TOTAL_ROUTE_TASKS).toBe(90);
  });

  it('separa los 10 módulos de ruta de los 4 mini cursos', () => {
    expect(ROUTE_MODULES.filter((m) => !m.course)).toHaveLength(10);
    expect(ROUTE_MODULES.filter((m) => m.course).map((m) => m.id)).toEqual([
      'ventas',
      'maps',
      'delivery',
      'contratar',
    ]);
  });

  it('le da a cada módulo un color propio', () => {
    for (const m of ROUTE_MODULES) expect(m.col).toBeTruthy();
  });

  it('reparte las tareas como el prototipo', () => {
    const porModulo = Object.fromEntries(ROUTE_MODULES.map((m) => [m.id, m.tasks.length]));
    expect(porModulo).toEqual({
      concepto: 6,
      local: 5,
      equipamiento: 4,
      proveedores: 4,
      personal: 4,
      menu: 4,
      costeo: 4,
      permisos: 4,
      marketing: 4,
      apertura: 4,
      ventas: 9,
      maps: 12,
      delivery: 14,
      contratar: 12,
    });
  });

  it('cada tarea trae título, pista, por qué importa y qué sigue', () => {
    for (const m of ROUTE_MODULES) {
      for (const t of m.tasks) {
        expect(t.title.length).toBeGreaterThan(0);
        expect(t.hint.length).toBeGreaterThan(0);
        expect(t.why.length).toBeGreaterThan(0);
        expect(t.next.length).toBeGreaterThan(0);
      }
    }
  });

  it('ofrece los 6 motivos de omisión', () => {
    expect(SKIP_REASONS).toHaveLength(6);
    expect(SKIP_REASONS[0]).toBe('Informalidad temporal de mi negocio');
  });
});

describe('avance del proyecto (README § 4 · "Avance del proyecto")', () => {
  it('cuenta base más tareas propias del usuario', () => {
    const tasks = moduleTasks(modules[0], [{ id: '9', moduleId: 'concepto', title: 'Mi tarea' }]);
    expect(tasks).toHaveLength(3);
    expect(tasks[2].custom).toBe(true);
    expect(tasks[0].key).toBe(taskKey('concepto', 0));
    expect(tasks[2].key).toBe('x9');
  });

  it('redondea el porcentaje de completadas', () => {
    const p = projectProgress({ modules, done: { concepto0: true } });
    expect(p.total).toBe(4);
    expect(p.done).toBe(1);
    expect(p.pct).toBe(25);
  });

  it('saca del cálculo las tareas de un módulo omitido', () => {
    const p = projectProgress({
      modules,
      done: { concepto0: true },
      skipped: { permisos: 'No aplica a mi tipo de negocio' },
    });
    expect(p.total).toBe(2);
    expect(p.pct).toBe(50);
    expect(p.modules.find((m) => m.id === 'permisos')?.skipped).toBe(true);
    expect(p.modules.find((m) => m.id === 'permisos')?.reason).toBe('No aplica a mi tipo de negocio');
  });

  it('no cuenta como completadas las tareas hechas dentro de un módulo omitido', () => {
    const p = projectProgress({
      modules,
      done: { concepto0: true, permisos0: true, permisos1: true },
      skipped: { permisos: 'Ya lo resolví fuera de la app' },
    });
    expect(p.done).toBe(1);
    expect(p.total).toBe(2);
  });

  it('anticipa el avance del paso 3 del flujo de omisión', () => {
    const input = { modules, done: { concepto0: true, concepto1: true } };
    expect(projectProgress(input).pct).toBe(50);
    const simulado = progressWithoutModule(input, 'permisos');
    expect(simulado.removedTasks).toBe(2);
    expect(simulado.pct).toBe(100);
  });

  it('devuelve la primera tarea pendiente para "Tu siguiente paso"', () => {
    const p = projectProgress({ modules, done: { concepto0: true } });
    expect(p.nextTask?.key).toBe('concepto1');

    const conModuloOmitido = projectProgress({
      modules,
      done: { concepto0: true, concepto1: true },
      skipped: { permisos: 'Lo haré después de abrir' },
    });
    expect(conModuloOmitido.nextTask).toBeUndefined();
  });

  it('no divide entre cero si todos los módulos están omitidos', () => {
    const p = projectProgress({
      modules,
      done: {},
      skipped: { concepto: 'Otro motivo', permisos: 'Otro motivo' },
    });
    expect(p.total).toBe(0);
    expect(p.pct).toBe(0);
  });

  it('etiqueta el nivel del diagnóstico por tramos', () => {
    expect(progressLevel(0)).toBe('Etapa de idea');
    expect(progressLevel(24)).toBe('Etapa de idea');
    expect(progressLevel(25)).toBe('En planeación');
    expect(progressLevel(49)).toBe('En planeación');
    expect(progressLevel(50)).toBe('Casi listo');
    expect(progressLevel(79)).toBe('Casi listo');
    expect(progressLevel(80)).toBe('Listo para abrir');
    expect(progressLevel(100)).toBe('Listo para abrir');
  });

  it('calcula el avance real de la ruta completa de seed', () => {
    const done: Record<string, boolean> = {};
    for (const m of ROUTE_MODULES) {
      m.tasks.forEach((t, i) => {
        if (t.demoDone) done[taskKey(m.id, i)] = true;
      });
    }
    const p = projectProgress({ modules: ROUTE_MODULES, done });
    expect(p.total).toBe(90);
    expect(p.done).toBe(50);
    expect(p.pct).toBe(56);
    expect(p.level).toBe('Casi listo');
  });
});

describe('proyección de fecha de apertura', () => {
  const HOY = Date.UTC(2026, 8, 1, 12); // 1 de septiembre
  const DIA = 86_400_000;

  it('proyecta con el ritmo real: tareas hechas entre días de uso', () => {
    // 10 hechas en 5 días son 2 al día; faltan 20 → 10 días → 11 de septiembre.
    const texto = paceProjection({ pending: 20, done: 10, startedAt: HOY - 5 * DIA, now: HOY });
    expect(texto).toBe('Te faltan 20 tareas. A tu ritmo actual, abres alrededor del 11 de septiembre.');
  });

  it('con poco avance anima en lugar de estimar una fecha', () => {
    const arranque = paceProjection({ pending: 90, done: 0, startedAt: HOY, now: HOY });
    expect(arranque).toBe('Vas muy bien. Con 10 tareas hechas te digo, a tu ritmo, para cuándo abres.');
    expect(arranque).not.toContain('abres alrededor');

    // El umbral son 10 tareas: con 9 anima, con 10 ya proyecta.
    const nueve = paceProjection({ pending: 81, done: PACE_MIN_TASKS - 1, startedAt: HOY - 3 * DIA, now: HOY });
    expect(nueve).not.toContain('abres alrededor');
    const diez = paceProjection({ pending: 80, done: PACE_MIN_TASKS, startedAt: HOY - 3 * DIA, now: HOY });
    expect(diez).toContain('abres alrededor');
  });

  it('nunca proyecta con un ritmo menor al mínimo', () => {
    // 10 tareas en 1000 días es un ritmo de 0.01: se usa el piso de 0.15.
    const lento = paceProjection({ pending: 10, done: 10, startedAt: HOY - 1000 * DIA, now: HOY });
    const piso = new Date(HOY + Math.ceil(10 / MIN_PACE) * DIA);
    expect(lento).toContain(`del ${piso.getDate()} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][piso.getMonth()]}`);
  });

  it('cambia el plural cuando falta una sola tarea', () => {
    expect(paceProjection({ pending: 1, done: 89, startedAt: HOY - 10 * DIA, now: HOY })).toContain('Te faltan 1 tarea.');
  });

  it('con la ruta terminada lo dice y no proyecta nada', () => {
    expect(paceProjection({ pending: 0, done: 90, startedAt: HOY - 10 * DIA, now: HOY })).toBe(
      'Terminaste tu ruta completa.',
    );
  });
});

describe('las tres etapas de Mi Ruta', () => {
  const progreso = () =>
    projectProgress({ modules: ROUTE_MODULES, done: {}, skipped: {} });

  it('agrupa los 10 módulos de ruta sin dejar ninguno fuera', () => {
    const etapas = stageProgress(ETAPAS, progreso().modules);
    expect(etapas).toHaveLength(3);
    const agrupados = etapas.flatMap((e) => e.modules.map((m) => m.id));
    const deRuta = ROUTE_MODULES.filter((m) => !m.course).map((m) => m.id);
    expect([...agrupados].sort()).toEqual([...deRuta].sort());
    // Ningún mini curso entra en una etapa: los cursos van aparte.
    expect(agrupados.some((id) => ROUTE_MODULES.find((m) => m.id === id)?.course)).toBe(false);
  });

  it('suma las tareas de sus módulos y arranca todo pendiente', () => {
    const etapas = stageProgress(ETAPAS, progreso().modules);
    for (const e of etapas) {
      expect(e.total).toBe(e.modules.reduce((a, m) => a + m.total, 0));
      expect(e.done).toBe(0);
      expect(e.state).toBe('Pendiente');
    }
  });

  it('pasa a en progreso con una tarea y a completado con todas', () => {
    const define = ETAPAS[0];
    const modulos = ROUTE_MODULES.filter((m) => define.mods.includes(m.id));
    const tareas = modulos.flatMap((m) => moduleTasks(m));

    const una = stageProgress(ETAPAS, projectProgress({
      modules: ROUTE_MODULES, done: { [tareas[0].key]: true },
    }).modules)[0];
    expect(una.done).toBe(1);
    expect(una.state).toBe('En progreso');

    const todas = Object.fromEntries(tareas.map((t) => [t.key, true]));
    const llena = stageProgress(ETAPAS, projectProgress({ modules: ROUTE_MODULES, done: todas }).modules)[0];
    expect(llena.done).toBe(llena.total);
    expect(llena.state).toBe('Completado');
  });

  it('saca de la cuenta los módulos omitidos', () => {
    const define = ETAPAS[0];
    const omitido = define.mods[0];
    const sinOmitir = stageProgress(ETAPAS, progreso().modules)[0];
    const conOmitido = stageProgress(ETAPAS, projectProgress({
      modules: ROUTE_MODULES, done: {}, skipped: { [omitido]: 'No aplica' },
    }).modules)[0];
    const tareasDelOmitido = moduleTasks(ROUTE_MODULES.find((m) => m.id === omitido)!).length;
    expect(conOmitido.total).toBe(sinOmitir.total - tareasDelOmitido);
    // El módulo sigue apareciendo en la etapa, marcado como omitido.
    expect(conOmitido.modules.find((m) => m.id === omitido)?.skipped).toBe(true);
  });

  it('nombra la etapa de la siguiente tarea y avisa cuando ya sólo quedan cursos', () => {
    expect(stageLabel(ETAPAS, projectProgress({ modules: ROUTE_MODULES, done: {} }).nextTask))
      .toBe('Define · etapa 1 de 3');

    const deRuta = ROUTE_MODULES.filter((m) => !m.course).flatMap((m) => moduleTasks(m));
    const todo = Object.fromEntries(deRuta.map((t) => [t.key, true]));
    const soloCursos = projectProgress({ modules: ROUTE_MODULES, done: todo });
    expect(stageLabel(ETAPAS, soloCursos.nextTask)).toBe('Puntos extra');
    expect(stageLabel(ETAPAS, undefined)).toBe('Puntos extra');
  });
});

describe('la ventana de tareas de Inicio', () => {
  const tareas = ROUTE_MODULES.flatMap((m) => moduleTasks(m));

  it('enseña cuatro, con una hecha antes de la que sigue', () => {
    const ventana = taskWindow(tareas, tareas[5]);
    expect(ventana).toHaveLength(HOME_TASKS);
    // La que sigue va en segundo lugar: antes se ve una ya hecha.
    expect(ventana[1].key).toBe(tareas[5].key);
    expect(ventana[0].key).toBe(tareas[4].key);
  });

  it('no se sale por la izquierda con la primera tarea', () => {
    const ventana = taskWindow(tareas, tareas[0]);
    expect(ventana.map((t) => t.key)).toEqual(tareas.slice(0, HOME_TASKS).map((t) => t.key));
  });

  it('se pega al final en lugar de encogerse con la última', () => {
    const ventana = taskWindow(tareas, tareas[tareas.length - 1]);
    expect(ventana).toHaveLength(HOME_TASKS);
    expect(ventana[HOME_TASKS - 1].key).toBe(tareas[tareas.length - 1].key);
  });

  it('sin pendientes enseña las últimas, y con lista vacía no enseña nada', () => {
    const ventana = taskWindow(tareas, undefined);
    expect(ventana).toHaveLength(HOME_TASKS);
    expect(ventana[HOME_TASKS - 1].key).toBe(tareas[tareas.length - 1].key);
    expect(taskWindow([], undefined)).toEqual([]);
  });
});
