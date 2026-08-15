/**
 * Semáforo de rentabilidad (README § 4).
 *
 * La frontera es la misma en todas las pantallas y se evalúa sobre el food cost
 * **redondeado**, que es el que ve el usuario: así la etiqueta nunca contradice
 * el número mostrado.
 *
 *   ≤ 30 %  saludable (verde)
 *   31–38 % revisar   (ámbar)
 *   > 38 %  peligroso (rojo)
 */

export type SemaphoreLevel = 'saludable' | 'revisar' | 'peligroso' | 'sin-precio';

export const HEALTHY_MAX = 30;
export const REVIEW_MAX = 38;

export const SEMAPHORE_LEGEND = [
  'Saludable hasta 30%',
  'Revisar 30–38%',
  'Peligroso más de 38%',
] as const;

/** Nivel del semáforo a partir del food cost redondeado (`null` = sin precio). */
export function semaphoreLevel(foodCostRounded: number | null): SemaphoreLevel {
  if (foodCostRounded === null) return 'sin-precio';
  if (foodCostRounded <= HEALTHY_MAX) return 'saludable';
  if (foodCostRounded <= REVIEW_MAX) return 'revisar';
  return 'peligroso';
}

/** Veredicto en prosa que acompaña a la barra tripartita. */
export function semaphoreVerdict(foodCostRounded: number | null): string {
  switch (semaphoreLevel(foodCostRounded)) {
    case 'sin-precio':
      return 'Define tu precio de venta para ver tu food cost y tu margen.';
    case 'saludable':
      return 'Saludable: este platillo deja buen margen. Manténlo en la carta y empújalo.';
    case 'revisar':
      return 'Revisa: el margen es justo. Ajusta porción, negocia el insumo más caro o sube un poco el precio.';
    case 'peligroso':
      return 'Peligroso: este platillo se come tu utilidad. Sube el precio, reduce porción o cámbialo de la carta.';
  }
}

/**
 * Posición de la aguja sobre la barra, en porcentaje.
 * La escala llega a 50% de food cost; sin precio, la aguja se queda al centro.
 */
export function semaphoreNeedlePct(foodCostRounded: number | null): number {
  if (foodCostRounded === null) return 50;
  return Math.min(97, Math.max(1, (foodCostRounded / 50) * 100));
}

/** Filtros de la lista de platillos: Todos · Saludables · En riesgo · Peligrosos. */
export type SemaphoreFilter = 'todos' | 'saludable' | 'revisar' | 'peligroso';

export function matchesSemaphoreFilter(foodCostRounded: number | null, filter: SemaphoreFilter): boolean {
  if (filter === 'todos') return true;
  return semaphoreLevel(foodCostRounded) === filter;
}
