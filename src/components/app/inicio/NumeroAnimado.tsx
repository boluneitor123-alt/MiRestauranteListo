'use client';

import { useEffect, useRef, useState } from 'react';

/** ¿El sistema pidió menos movimiento? Entonces el número sólo cambia. */
function prefiereQuieto(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

const DURACION = 520;

/**
 * El último valor que se alcanzó a enseñar, fuera del componente.
 *
 * Cambiar un gasto obliga a ir a Números y volver, y en ese viaje Inicio se
 * desmonta: al remontarse, el número aparecía ya en su valor nuevo y la
 * animación no ocurría nunca — justo en el único caso en que sirve. Recordarlo
 * aquí hace que al volver arranque donde lo dejó y suba a la vista.
 */
const ultimoVisto = new Map<string, number>();
// Desacelera al final: el número llega y se asienta, no frena de golpe.
const suavizar = (t: number): number => 1 - (1 - t) ** 3;

/**
 * Un número que viaja de su valor anterior al nuevo.
 *
 * Ver la cifra moverse es el punto: cuando alguien sube la renta y el «47
 * clientes al día» trepa a «58» delante de sus ojos, entiende la relación sin
 * que nadie se la explique. En la primera pintada no anima —no hay de dónde
 * venir— y con `prefers-reduced-motion` tampoco.
 */
export function NumeroAnimado({ valor, id = 'titular' }: { valor: number; id?: string }) {
  const desdeElViaje = ultimoVisto.get(id);
  const [mostrado, setMostrado] = useState(desdeElViaje ?? valor);
  const anterior = useRef(desdeElViaje ?? valor);
  const cuadro = useRef<number | null>(null);

  useEffect(() => {
    const desde = anterior.current;
    anterior.current = valor;
    ultimoVisto.set(id, valor);
    if (desde === valor) return;

    if (prefiereQuieto()) {
      setMostrado(valor);
      return;
    }

    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / DURACION);
      setMostrado(Math.round(desde + (valor - desde) * suavizar(t)));
      if (t < 1) cuadro.current = requestAnimationFrame(paso);
    };
    cuadro.current = requestAnimationFrame(paso);

    return () => {
      if (cuadro.current !== null) cancelAnimationFrame(cuadro.current);
    };
  }, [valor, id]);

  /*
    El valor real va en `aria-label` y lo pintado se esconde del lector: si no,
    un lector de pantalla cantaría todos los números intermedios de la
    animación.
  */
  return (
    <span aria-label={String(valor)}>
      <span aria-hidden>{mostrado}</span>
    </span>
  );
}
