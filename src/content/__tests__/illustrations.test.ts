import { describe, expect, it } from 'vitest';
import { CATS } from '@/content/route';
import { MRL_ART, lessonArt, lessonSlug } from '@/content/illustrations';

/*
  Cada lección de la ruta se dibuja con su ilustración, que se busca por el
  título convertido a slug. Nada avisa cuando falta: `lessonArt()` devuelve
  null y la lección se pinta sin nada. No es un número raro en pantalla, es un
  hueco, y por eso se nota tarde.

  Basta con renombrar una lección en `route.ts`, o agregar una nueva, para que
  el slug deje de empatar con la llave. Estas pruebas atan las dos listas.
*/
describe('las lecciones y sus ilustraciones', () => {
  const lecciones = CATS.flatMap((c) => c.tasks.map((t) => ({ modulo: c.id, titulo: t.t })));

  it('todas las lecciones de la ruta tienen ilustración', () => {
    const sinArte = lecciones.filter((l) => lessonArt(l.titulo) === null);
    expect(sinArte.map((l) => `${l.modulo}: ${l.titulo}`)).toEqual([]);
  });

  it('no sobran ilustraciones que ninguna lección use', () => {
    const usadas = new Set(lecciones.map((l) => lessonSlug(l.titulo)));
    expect(Object.keys(MRL_ART).filter((k) => !usadas.has(k))).toEqual([]);
  });

  it('dos lecciones no comparten slug: el slug se recorta a 44 caracteres', () => {
    // Con títulos largos que empiecen igual, el recorte los vuelve el mismo
    // slug y una lección acaba enseñando el dibujo de la otra, sin fallar.
    const porSlug = new Map<string, string[]>();
    for (const l of lecciones) {
      const s = lessonSlug(l.titulo);
      porSlug.set(s, [...(porSlug.get(s) ?? []), l.titulo]);
    }
    expect([...porSlug].filter(([, titulos]) => titulos.length > 1)).toEqual([]);
  });

  it('cada ilustración es un SVG, no una cadena vacía', () => {
    const rotas = Object.entries(MRL_ART).filter(([, svg]) => !svg.trimStart().startsWith('<svg'));
    expect(rotas.map(([k]) => k)).toEqual([]);
  });
});
