/**
 * La frase grande de Inicio: lo primero que la app le dice a alguien.
 *
 * «Necesitas 47 clientes al día para no perder dinero» es la cosa más útil que
 * este producto sabe decir, y estaba enterrada abajo de la pantalla como un
 * renglón de tablero. Se arma aquí, en el dominio, y no en la pantalla: es una
 * conclusión sobre los números del proyecto, no un adorno.
 *
 * Las tres partes van separadas para que el número se pueda pintar grande y
 * animar sin partir la frase a mano en el componente.
 */

import { breakeven, type BreakevenInput } from './finance';

export type Titular =
  | {
      listo: true;
      antes: string;
      numero: number;
      unidad: string;
      despues: string;
      /** Lo que hay que vender al mes para llegar ahí. */
      ventaMensual: number;
    }
  | {
      /**
       * Todavía no hay con qué. No se inventa un número ni se dice «0 clientes
       * al día», que sería falso y además sonaría a que no necesita vender.
       */
      listo: false;
      mensaje: string;
      /** Qué le falta capturar, para poder mandarla ahí. */
      falta: 'gastos-fijos';
    };

export function titularDeEquilibrio(input: BreakevenInput): Titular {
  const gastos = Math.max(0, input.fixedExpenses || 0);
  if (gastos <= 0) {
    return {
      listo: false,
      falta: 'gastos-fijos',
      mensaje: 'Captura tus gastos fijos y te digo cuántos clientes necesitas al día.',
    };
  }

  const be = breakeven(input);
  return {
    listo: true,
    antes: 'Necesitas',
    numero: be.ticketsPerDay,
    unidad: be.ticketsPerDay === 1 ? 'cliente al día' : 'clientes al día',
    despues: 'para no perder dinero.',
    ventaMensual: be.monthlySales,
  };
}
