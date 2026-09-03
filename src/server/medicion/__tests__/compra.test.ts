import { describe, expect, it } from 'vitest';
import { esLlaveRepetida } from '../compra';

/*
  Reservar el evento en `meta_events` puede fallar por dos razones muy
  distintas, y confundirlas cuesta caro:

  - `P2002`, llave repetida: el mismo webhook llegó dos veces. Correcto no
    mandar nada.
  - Cualquier otra: la tabla no existe porque falta correr la migración, o la
    base no responde. Ahí Meta no recibe una sola compra, y llamarlo "ya
    enviado" manda a buscar del lado equivocado. Pasó: la primera versión
    devolvía "ya-enviado" para todo.
*/
describe('el duplicado se distingue del problema', () => {
  it('P2002 es el mismo webhook otra vez', () => {
    expect(esLlaveRepetida({ code: 'P2002' })).toBe(true);
  });

  it('la tabla inexistente NO es un duplicado', () => {
    expect(esLlaveRepetida({ code: 'P2021' })).toBe(false);
  });

  it('ni la base caída, ni un error suelto, ni nada', () => {
    expect(esLlaveRepetida({ code: 'P1001' })).toBe(false);
    expect(esLlaveRepetida(new Error('boom'))).toBe(false);
    expect(esLlaveRepetida(undefined)).toBe(false);
    expect(esLlaveRepetida(null)).toBe(false);
    expect(esLlaveRepetida('P2002')).toBe(false);
  });
});
