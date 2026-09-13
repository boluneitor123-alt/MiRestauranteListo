'use client';

import { useEffect, useState } from 'react';
import type { Lesson } from '@/content/lessons';
import { getDeviceId } from '@/lib/device';

/*
  Este archivo importa el **tipo** `Lesson`, no su contenido: los tipos se
  borran al compilar, así que `lessons.ts` no entra al paquete por aquí. Si
  algún día alguien importa `LESSONS` o `getLesson` desde un componente de
  cliente, las 90 lecciones vuelven a viajar al navegador — la prueba
  `bundle.test.ts` lo caza.
*/

export interface LeccionCargada {
  leccion: Lesson;
  arte: string | null;
}

export type EstadoDeLeccion =
  | { estado: 'cargando' }
  | { estado: 'lista'; contenido: LeccionCargada }
  /** El servidor no la dio: cerrada, inexistente o sin conexión. */
  | { estado: 'sin-contenido' };

/**
 * Caché por título, viva mientras dure la pestaña.
 *
 * Abrir y cerrar la misma lección no vuelve a pedirla, y la precarga al tocar
 * deja el contenido listo antes de que la pantalla lo necesite. No se guarda
 * en `localStorage` a propósito: es contenido de pago y ahí quedaría después
 * de que la prueba venza.
 */
const memoria = new Map<string, LeccionCargada>();
const enVuelo = new Map<string, Promise<LeccionCargada | null>>();

const llave = (moduleId: string, titulo: string) => `${moduleId}|${titulo}`;

async function pedir(moduleId: string, titulo: string): Promise<LeccionCargada | null> {
  const params = new URLSearchParams({ modulo: moduleId, titulo, equipo: getDeviceId() });
  const respuesta = await fetch(`/api/lecciones?${params}`);
  if (!respuesta.ok) return null;
  const datos = (await respuesta.json()) as { ok?: boolean; leccion?: Lesson; arte?: string | null };
  if (!datos.ok || !datos.leccion) return null;
  return { leccion: datos.leccion, arte: datos.arte ?? null };
}

/** Pide la lección una sola vez, aunque la llamen varias a la vez. */
export function cargarLeccion(moduleId: string, titulo: string): Promise<LeccionCargada | null> {
  const k = llave(moduleId, titulo);
  const guardada = memoria.get(k);
  if (guardada) return Promise.resolve(guardada);

  const yaVa = enVuelo.get(k);
  if (yaVa) return yaVa;

  const promesa = pedir(moduleId, titulo)
    .then((contenido) => {
      if (contenido) memoria.set(k, contenido);
      return contenido;
    })
    .catch(() => null)
    .finally(() => enVuelo.delete(k));

  enVuelo.set(k, promesa);
  return promesa;
}

/**
 * Precarga: se llama al tocar la fila, antes de que la lección se despliegue.
 *
 * Para cuando el acordeón termina de abrirse la respuesta suele estar, así que
 * el esqueleto casi nunca alcanza a verse. Si falla, no pasa nada: el hook lo
 * vuelve a pedir.
 */
export const precargarLeccion = (moduleId: string, titulo: string): void => {
  void cargarLeccion(moduleId, titulo);
};

/** El contenido de una lección. `activo` en `false` no pide nada. */
export function useLeccion(moduleId: string, titulo: string, activo: boolean): EstadoDeLeccion {
  const [estado, setEstado] = useState<EstadoDeLeccion>(() => {
    const guardada = memoria.get(llave(moduleId, titulo));
    return guardada ? { estado: 'lista', contenido: guardada } : { estado: 'cargando' };
  });

  useEffect(() => {
    if (!activo) return;

    const guardada = memoria.get(llave(moduleId, titulo));
    if (guardada) {
      setEstado({ estado: 'lista', contenido: guardada });
      return;
    }

    let vivo = true;
    setEstado({ estado: 'cargando' });
    void cargarLeccion(moduleId, titulo).then((contenido) => {
      if (!vivo) return;
      setEstado(contenido ? { estado: 'lista', contenido } : { estado: 'sin-contenido' });
    });
    return () => {
      vivo = false;
    };
  }, [activo, moduleId, titulo]);

  return estado;
}
