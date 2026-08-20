import { describe, expect, it } from 'vitest';
import { openingCalendar, PLAN_WEEKS, TASKS_PER_WEEK, shortDate } from '../openingPlan';
import { projectProgress } from '../progress';
import { ROUTE_MODULES } from '@/content/route';

const progreso = (done: Record<string, boolean> = {}, skipped: Record<string, string> = {}) =>
  projectProgress({ modules: ROUTE_MODULES, done, skipped, extraTasks: [] });

describe('calendario de 30 días del plan de apertura', () => {
  it('arma cuatro semanas con las tareas pendientes, en orden de la ruta', () => {
    const semanas = openingCalendar(progreso(), new Date('2026-09-07T12:00:00'), {});
    expect(semanas.length).toBe(PLAN_WEEKS);
    expect(semanas[0].week).toBe('Semana 1');
    expect(semanas[0].range).toBe('7 sep a 13 sep');
    expect(semanas[1].range).toBe('14 sep a 20 sep');
    expect(semanas[0].count).toBe(TASKS_PER_WEEK);
    expect(semanas[0].focus).toBe(ROUTE_MODULES[0].name);
    expect(semanas[0].tasks).toContain(progreso().modules[0].tasks[0].title);
  });

  it('salta las tareas ya hechas', () => {
    const primera = progreso().modules[0].tasks[0];
    const hechas = { [primera.key]: true };
    const semanas = openingCalendar(progreso(hechas), new Date('2026-09-07T12:00:00'), hechas);
    expect(semanas[0].tasks).not.toContain(primera.title);
  });

  it('no cuenta los mini cursos ni los módulos omitidos', () => {
    const curso = ROUTE_MODULES.find((m) => m.course)!;
    const semanas = openingCalendar(progreso(), new Date('2026-09-07T12:00:00'), {});
    const todas = semanas.map((s) => s.tasks).join(' · ');
    const tareasCurso = progreso().modules.find((m) => m.id === curso.id)!.tasks[0].title;
    expect(todas).not.toContain(tareasCurso);

    const sinConcepto = openingCalendar(progreso({}, { concepto: 'no aplica' }), new Date('2026-09-07T12:00:00'), {});
    expect(sinConcepto[0].focus).not.toBe(ROUTE_MODULES[0].name);
  });

  it('devuelve menos semanas si quedan pocas tareas', () => {
    const todo: Record<string, boolean> = {};
    for (const m of progreso().modules) for (const t of m.tasks) todo[t.key] = true;
    expect(openingCalendar(progreso(todo), new Date('2026-09-07T12:00:00'), todo)).toEqual([]);
  });

  it('escribe la fecha corta como el documento', () => {
    expect(shortDate(new Date('2026-01-05T12:00:00'))).toBe('5 ene');
    expect(shortDate(new Date('2026-12-31T12:00:00'))).toBe('31 dic');
  });
});
