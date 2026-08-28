import { describe, expect, it } from 'vitest';
import { MOCK_ROUTE, MOCK_STAGES } from '@/content/landing';

/*
  Las maquetas de la landing —la laptop y el teléfono— dibujan la misma ruta
  con distinta granularidad: una enseña las tres etapas y la otra los pasos.
  Si cada una cuenta por su lado, la página acaba diciendo dos porcentajes
  distintos bajo el mismo título, "Tu ruta de apertura", y se lee como un
  error aunque por dentro tenga explicación.
*/
describe('las etapas y los pasos de la maqueta cuentan lo mismo', () => {
  const suma = MOCK_STAGES.reduce(
    ([h, t], [, frac]) => {
      const [hecho, de] = frac.split('/').map(Number);
      return [h + hecho, t + de];
    },
    [0, 0],
  );

  it('las tres etapas suman exactamente los pasos de la ruta', () => {
    expect(suma[1]).toBe(MOCK_ROUTE.length);
  });

  it('y los palomeados de las etapas son los palomeados de la ruta', () => {
    expect(suma[0]).toBe(MOCK_ROUTE.filter(([, estado]) => estado === 1).length);
  });

  it('cada paso pertenece a una etapa que existe', () => {
    const etapas = new Set(['define', 'construye', 'abre']);
    for (const [nombre, , etapa] of MOCK_ROUTE) {
      expect(etapas.has(etapa), `«${nombre}» está en una etapa desconocida`).toBe(true);
    }
  });

  it('ninguna etapa se queda sin pasos: las tres tarjetas tienen qué mostrar', () => {
    for (const [nombre, frac] of MOCK_STAGES) {
      expect(Number(frac.split('/')[1]), `«${nombre}» no tiene pasos`).toBeGreaterThan(0);
    }
  });
});
