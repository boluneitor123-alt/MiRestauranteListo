/**
 * Genera `src/content/leccionesMeta.ts` a partir de `src/content/lessons.ts`.
 *
 * El contenido de las lecciones dejó de viajar al navegador: se pide al
 * servidor y sólo si el nivel lo permite. Pero la duración sí se enseña antes
 * de comprar —«toma 15 min y trae sus pasos»— así que ese dato, y nada más,
 * vive en un archivo aparte que sí se empaqueta.
 *
 * Se genera en vez de teclearse para que no se separe del original. La prueba
 * `leccionesMeta.test.ts` vuelve a compararlos y truena si alguien editó uno
 * sin correr esto.
 *
 *   node scripts/generar-meta-lecciones.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const fuente = readFileSync(new URL('../src/content/lessons.ts', import.meta.url), 'utf8');

// El archivo lo genera otro script y es JSON dentro de TypeScript: se saca el
// objeto literal y se lee con JSON.parse, sin evaluar nada.
const inicio = fuente.indexOf('export const LESSONS: Record<string, Lesson> = ');
const abre = fuente.indexOf('{', inicio);
const cierra = fuente.indexOf('\n};', abre);
if (inicio < 0 || cierra < 0) throw new Error('No encontré el literal LESSONS en lessons.ts');
const lecciones = JSON.parse(fuente.slice(abre, cierra + 2));

const minutos = Object.fromEntries(Object.entries(lecciones).map(([titulo, l]) => [titulo, l.m]));

const salida = `// Generado por scripts/generar-meta-lecciones.mjs desde lessons.ts.
// No edites a mano: vuelve a correr el script.

/**
 * Lo único de cada lección que sí viaja al navegador: cuánto toma.
 *
 * El resto —los pasos, el error típico, el checklist, el ejemplo y la
 * ilustración— se pide a \`/api/lecciones\`, que valida el nivel antes de
 * contestar. Aquí no debe aparecer nada más: lo que se agregue a este archivo
 * se descarga sin pagar.
 */
export const MINUTOS_DE_LECCION: Record<string, number> = ${JSON.stringify(minutos, null, 2)};

/** Minutos de una lección. El de reserva es el mismo de \`FALLBACK_LESSON\`. */
export const minutosDeLeccion = (titulo: string): number => MINUTOS_DE_LECCION[titulo] ?? ${lecciones['__fallback__']?.m ?? 20};
`;

writeFileSync(new URL('../src/content/leccionesMeta.ts', import.meta.url), salida);
console.log(`leccionesMeta.ts: ${Object.keys(minutos).length} lecciones`);
