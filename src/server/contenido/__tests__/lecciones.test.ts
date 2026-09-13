import { describe, expect, it } from 'vitest';
import { ETAPAS, ROUTE_MODULES } from '@/content/route';
import { LESSONS } from '@/content/lessons';
import { esMiniCurso } from '@/domain/access';
import { leerLeccion, NO_ENCONTRADA, type ResultadoDeLeccion } from '../lecciones';

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
      expect(leerLeccion('prueba', id, primeraTareaDe(id)).ok).toBe(false);
    }
  });

  it('los mini cursos tampoco', () => {
    expect(leerLeccion('prueba', CURSO, primeraTareaDe(CURSO)).ok).toBe(false);
  });

  it('no se saca una lección cerrada declarando otro módulo', () => {
    // El título es de la etapa 2; el módulo que se declara es de la 1.
    expect(leerLeccion('prueba', DEFINE, primeraTareaDe(CONSTRUYE)).ok).toBe(false);
  });

  it('un módulo inventado no contesta nada', () => {
    expect(leerLeccion('prueba', 'no-existe', primeraTareaDe(DEFINE)).ok).toBe(false);
  });
});

describe('vencida: lo que ya se abrió se sigue leyendo', () => {
  it('la etapa 1 se conserva legible', () => {
    const r = leerLeccion('bloqueado', DEFINE, primeraTareaDe(DEFINE));
    expect(r.ok).toBe(true);
  });

  it('el resto sigue cerrado', () => {
    expect(leerLeccion('bloqueado', CONSTRUYE, primeraTareaDe(CONSTRUYE))).toEqual(NO_ENCONTRADA);
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
  it('tampoco se contesta: no es de las 90 y el navegador ni pregunta', () => {
    // Antes devolvía 200 con la lección de reserva. Eso convertía al endpoint
    // en un detector de títulos: inventado contestaba 200, real contestaba 404.
    expect(leerLeccion('prueba', DEFINE, 'Cotizar el letrero')).toEqual(NO_ENCONTRADA);
  });
});

/*
  ─── Negarse siempre igual ──────────────────────────────────────────────────

  La razón por la que falla no puede salir en la respuesta. Si «cerrada» y «no
  existe» se distinguen, cualquiera con una cuenta de prueba puede recorrer
  títulos y quedarse con los que contesten distinto: el endpoint sería el
  índice de lo que hay detrás del pago.
*/
describe('lo que no se da, se niega siempre igual', () => {
  const casos: Array<[string, () => ResultadoDeLeccion]> = [
    ['cerrada: existe pero el nivel no la abre', () => leerLeccion('prueba', CONSTRUYE, primeraTareaDe(CONSTRUYE))],
    ['inexistente: el título no es de nadie', () => leerLeccion('prueba', DEFINE, 'Título que no existe en ningún lado')],
    ['de otro módulo: el título es real pero no de ahí', () => leerLeccion('prueba', DEFINE, primeraTareaDe(CONSTRUYE))],
    ['módulo inventado', () => leerLeccion('prueba', 'modulo-que-no-existe', primeraTareaDe(DEFINE))],
    ['curso cerrado', () => leerLeccion('prueba', CURSO, primeraTareaDe(CURSO))],
  ];

  it('las cinco respuestas son idénticas entre sí', () => {
    const respuestas = casos.map(([, hacer]) => hacer());
    for (const r of respuestas) expect(r).toEqual(NO_ENCONTRADA);

    // Y no sólo equivalentes: serializadas quedan byte por byte iguales, que
    // es lo que de verdad viaja por la red.
    const serializadas = respuestas.map((r) => JSON.stringify(r));
    expect(new Set(serializadas).size).toBe(1);
  });

  it.each(casos)('%s no dice por qué falló', (_caso, hacer) => {
    const r = hacer();
    expect(r.ok).toBe(false);
    // Ni una llave de más: nada de `motivo: 'cerrada'`, ni un campo suelto que
    // sólo aparezca en uno de los casos.
    expect(Object.keys(r).sort()).toEqual(['motivo', 'ok']);
    expect(JSON.stringify(r)).not.toMatch(/cerrad|bloquead|pago|existe/i);
  });

  it('también con la prueba vencida', () => {
    const cerrada = leerLeccion('bloqueado', CONSTRUYE, primeraTareaDe(CONSTRUYE));
    const inexistente = leerLeccion('bloqueado', DEFINE, 'Nada que ver');
    expect(cerrada).toEqual(inexistente);
    expect(cerrada).toEqual(NO_ENCONTRADA);
  });

  it('y con licencia, donde lo único que falla es lo que no existe', () => {
    const inexistente = leerLeccion('licencia', DEFINE, 'Nada que ver');
    const otroModulo = leerLeccion('licencia', DEFINE, primeraTareaDe(CONSTRUYE));
    expect(inexistente).toEqual(otroModulo);
    expect(inexistente).toEqual(NO_ENCONTRADA);
  });
});
