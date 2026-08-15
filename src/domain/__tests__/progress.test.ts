import { describe, expect, it } from 'vitest';
import { moduleTasks, progressLevel, progressWithoutModule, projectProgress, taskKey, type RouteModule } from '../progress';
import { ROUTE_MODULES, TOTAL_ROUTE_TASKS, SKIP_REASONS } from '@/content/route';

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
  it('trae 10 módulos y 43 tareas de seed', () => {
    expect(ROUTE_MODULES).toHaveLength(10);
    expect(TOTAL_ROUTE_TASKS).toBe(43);
  });

  it('reparte las tareas como documenta el README', () => {
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
    expect(p.total).toBe(43);
    expect(p.done).toBe(12);
    expect(p.pct).toBe(28);
    expect(p.level).toBe('En planeación');
  });
});
