import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LESSONS } from '../lessons';
import { MINUTOS_DE_LECCION, minutosDeLeccion } from '../leccionesMeta';

describe('los minutos no se separan del original', () => {
  it('hay uno por lección y coinciden', () => {
    expect(Object.keys(MINUTOS_DE_LECCION)).toHaveLength(Object.keys(LESSONS).length);
    for (const [titulo, leccion] of Object.entries(LESSONS)) {
      expect(MINUTOS_DE_LECCION[titulo]).toBe(leccion.m);
    }
  });

  it('un título desconocido no truena', () => {
    expect(minutosDeLeccion('Cotizar el letrero')).toBeGreaterThan(0);
  });

  it('y nada más se coló: el archivo sólo trae números', () => {
    // Si alguien mete los pasos aquí, se descargan sin pagar.
    for (const valor of Object.values(MINUTOS_DE_LECCION)) {
      expect(typeof valor).toBe('number');
    }
  });
});

/*
  ─── El contenido no vuelve al paquete ──────────────────────────────────────

  Las 90 lecciones y sus ilustraciones son 418 KB y son el producto. Se sirven
  desde `/api/lecciones`, que revisa el nivel antes de contestar. Basta con que
  alguien escriba `import { getLesson } from '@/content/lessons'` en un
  componente para que vuelvan a viajar al navegador de cualquiera, y eso no se
  nota mirando la pantalla. Por eso se revisa aquí.
*/
const PROHIBIDOS = ['@/content/lessons', '@/content/illustrations'];

function archivosDeCliente(raiz: string): string[] {
  const salida: string[] = [];
  const recorrer = (dir: string) => {
    for (const entrada of readdirSync(dir)) {
      const ruta = join(dir, entrada);
      if (statSync(ruta).isDirectory()) {
        // Las rutas de API y las pruebas corren en el servidor.
        if (entrada === '__tests__' || entrada === 'api') continue;
        recorrer(ruta);
      } else if (/\.tsx?$/.test(entrada)) {
        salida.push(ruta);
      }
    }
  };
  recorrer(raiz);
  return salida;
}

describe('las lecciones no viajan al navegador', () => {
  it('ningún componente importa su contenido', () => {
    const culpables: string[] = [];

    for (const ruta of [...archivosDeCliente('src/components'), ...archivosDeCliente('src/app')]) {
      const fuente = readFileSync(ruta, 'utf8');
      for (const modulo of PROHIBIDOS) {
        // `import type` se borra al compilar: no mete nada al paquete.
        const valor = new RegExp(`import\\s+(?!type\\b)[^;]*from\\s+['"]${modulo}['"]`);
        if (valor.test(fuente)) culpables.push(`${ruta} → ${modulo}`);
      }
    }

    expect(culpables).toEqual([]);
  });
});
