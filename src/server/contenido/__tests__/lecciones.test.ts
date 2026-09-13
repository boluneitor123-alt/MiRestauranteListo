import { describe, expect, it } from 'vitest';
import { ETAPAS, ROUTE_MODULES } from '@/content/route';
import { LESSONS } from '@/content/lessons';
import { esMiniCurso } from '@/domain/access';
import { leerLeccion } from '../lecciones';

const DEFINE = ETAPAS[0].mods[0];
const CONSTRUYE = ETAPAS[1].mods[0];
const CURSO = ROUTE_MODULES.find((m) => esMiniCurso(m.id))!.id;

const primeraTareaDe = (moduleId: string): string =>
  ROUTE_MODULES.find((m) => m.id === moduleId)!.tasks[0].title;

describe('prueba: sólo salen las lecciones de la etapa 1', () => {
  it('la etapa 1 sí, con su contenido y su ilustración', () => {
    const r = leerLeccion('prueba', DEFINE, primeraTareaDe(DEFINE));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.leccion.leccion.s.length).toBeGreaterThan(0);
    expect(r.leccion.leccion.e).not.toBe('');
  });

  it('las etapas 2 y 3 no: el servidor no las manda', () => {
    for (const id of [...ETAPAS[1].mods, ...ETAPAS[2].mods]) {
      const r = leerLeccion('prueba', id, primeraTareaDe(id));
      expect(r).toEqual({ ok: false, motivo: 'cerrada' });
    }
  });

  it('los mini cursos tampoco', () => {
    const r = leerLeccion('prueba', CURSO, primeraTareaDe(CURSO));
    expect(r).toEqual({ ok: false, motivo: 'cerrada' });
  });

  it('no se saca una lección cerrada declarando otro módulo', () => {
    // El título es de la etapa 2; el módulo que se declara es de la 1.
    const r = leerLeccion('prueba', DEFINE, primeraTareaDe(CONSTRUYE));
    expect(r).toEqual({ ok: false, motivo: 'no-existe' });
  });

  it('un módulo inventado no contesta nada', () => {
    expect(leerLeccion('prueba', 'no-existe', primeraTareaDe(DEFINE))).toEqual({
      ok: false,
      motivo: 'no-existe',
    });
  });
});

describe('vencida: lo que ya se abrió se sigue leyendo', () => {
  it('la etapa 1 se conserva legible', () => {
    const r = leerLeccion('bloqueado', DEFINE, primeraTareaDe(DEFINE));
    expect(r.ok).toBe(true);
  });

  it('el resto sigue cerrado', () => {
    expect(leerLeccion('bloqueado', CONSTRUYE, primeraTareaDe(CONSTRUYE))).toEqual({
      ok: false,
      motivo: 'cerrada',
    });
  });
});

describe('licencia: salen las 90', () => {
  it('todas las tareas de los catorce módulos contestan con contenido', () => {
    let servidas = 0;
    for (const m of ROUTE_MODULES) {
      for (const t of m.tasks) {
        const r = leerLeccion('licencia', m.id, t.title);
        expect(r.ok).toBe(true);
        servidas += 1;
      }
    }
    expect(servidas).toBe(Object.keys(LESSONS).length);
  });
});

describe('una tarea que la persona agregó', () => {
  it('no trae contenido que cuidar: se contesta la de reserva', () => {
    const r = leerLeccion('prueba', DEFINE, 'Cotizar el letrero');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.leccion.leccion.s).toEqual([]);
    expect(r.leccion.arte).toBeNull();
  });
});
