/**
 * Cuando la persona corrige un valor, deja de ser una estimación.
 *
 * La promesa es de una sola dirección y no admite excepciones: lo que ella
 * tocó es suyo para siempre y la app no vuelve a escribirlo. Se resuelve
 * comparando lo que llega contra lo guardado, en el mismo punto por el que
 * pasa todo guardado, en vez de pedirle a cada pantalla que se acuerde de
 * avisar — una pantalla que se olvide sería una promesa rota sin ruido.
 */

import type { ProjectState } from './projectState';

/** Las rutas que dejaron de ser estimación porque su valor cambió. */
export function rutasTocadas(previo: ProjectState, entrante: ProjectState): string[] {
  const tocadas: string[] = [];

  if (previo.ticket !== entrante.ticket) tocadas.push('ticket');
  if (previo.margin !== entrante.margin) tocadas.push('margin');
  if (previo.project.budgetCap !== entrante.project.budgetCap) tocadas.push('budgetCap');

  const porLlave = (grupo: 'presupuesto' | 'fijos', antes: ProjectState['budget'], ahora: ProjectState['budget']) => {
    const mapa = new Map(antes.map((c) => [c.key, c.amount]));
    for (const c of ahora) {
      if (mapa.has(c.key) && mapa.get(c.key) !== c.amount) tocadas.push(`${grupo}:${c.key}`);
    }
  };
  porLlave('presupuesto', previo.budget, entrante.budget);
  porLlave('fijos', previo.fixed, entrante.fixed);

  /*
    Un platillo estimado cuenta como tocado si cambió **o si desapareció**.
    Borrarlo también es una decisión suya: si no se quitara la marca, volver a
    crear uno con el mismo id lo haría estimado otra vez.
  */
  const antes = new Map(previo.dishes.map((d) => [d.id, JSON.stringify(d)]));
  for (const [id, serializado] of antes) {
    const ahora = entrante.dishes.find((d) => d.id === id);
    if (!ahora || JSON.stringify(ahora) !== serializado) tocadas.push(`platillo:${id}`);
  }

  return tocadas;
}

/**
 * El estado a guardar, con las marcas al día.
 *
 * Sólo se quitan marcas; nunca se agregan. Estimar es cosa del arranque, no de
 * cada guardado: si esto pudiera volver a marcar algo como estimación, un
 * guardado cualquiera podría reclamar como suyo un dato de la persona.
 */
export function alDia(previo: ProjectState | null, entrante: ProjectState): ProjectState {
  const marcas = previo ? previo.estimados : entrante.estimados;
  if (!marcas.length) return { ...entrante, estimados: [] };

  const tocadas = previo ? new Set(rutasTocadas(previo, entrante)) : new Set<string>();
  return { ...entrante, estimados: marcas.filter((ruta) => !tocadas.has(ruta)) };
}
