import { describe, expect, it } from 'vitest';
import {
  avisoDePrueba,
  CANDADO_EDICION,
  CANDADO_TEXTO,
  CANDADO_VENCIDO,
  etiquetaDeAcceso,
  ETIQUETA_DE_POR_VIDA,
  resumenDeAlcance,
  textoDeCandado,
  type AccessLevel,
} from '../access';
import { ACCESS_LEVELS } from '../entitlement';
import { trialState } from '../license';

/*
  El defecto que esto fija: cuentas que pagaron leyendo «Tu prueba terminó».

  La prueba de 7 días vive en el equipo y sigue venciendo aunque la persona
  compre el día dos — eso está bien y las fechas no se tocan. Lo que no puede
  pasar es que un letrero mire la fecha antes que el nivel. Quien pagó no puede
  leer que perdió lo que compró.

  Regla, en una línea: con nivel 'licencia' no hay aviso de prueba en ninguna
  pantalla, sin importar el calendario.
*/

/** Una prueba de 7 días que venció hace rato, que es el caso que se colaba. */
const VENCIDA = trialState(Date.now() - 10 * 24 * 60 * 60 * 1000, Date.now(), 7);
const EN_CURSO = trialState(Date.now() - 2 * 24 * 60 * 60 * 1000, Date.now(), 7);
const ULTIMO_DIA = trialState(Date.now() - 6 * 24 * 60 * 60 * 1000, Date.now(), 7);

const sinLetreroDePrueba = /prueba termin|versión de prueba|te quedan? \d+ días?|te queda 1 día|último día|desbloquea con el pago|para editar, desbloquea/i;

describe('con licencia no hay aviso de prueba, venza cuando venza', () => {
  it('la prueba vencida no produce aviso', () => {
    expect(VENCIDA.expired).toBe(true);
    expect(avisoDePrueba('licencia', VENCIDA)).toBeNull();
  });

  it('tampoco lo produce una prueba en curso ni el último día', () => {
    expect(avisoDePrueba('licencia', EN_CURSO)).toBeNull();
    expect(avisoDePrueba('licencia', ULTIMO_DIA)).toBeNull();
  });

  it('ni una prueba imposible: el nivel se decide antes de mirar la fecha', () => {
    /*
      Si un día el servidor manda algo raro en `trial` —una fecha corrida, un
      contador negativo— la respuesta con licencia sigue siendo «nada».
    */
    expect(avisoDePrueba('licencia', { daysLeft: -99, expired: true })).toBeNull();
    expect(avisoDePrueba('licencia', { daysLeft: 0, expired: true })).toBeNull();
    expect(avisoDePrueba('licencia', null)).toBeNull();
  });

  it('ningún texto del candado se le ofrece a quien ya pagó', () => {
    expect(textoDeCandado('licencia', 'contenido')).toBeNull();
    expect(textoDeCandado('licencia', 'edicion')).toBeNull();
  });

  it('su etiqueta de estado dice lo que compró, no cómo va una prueba', () => {
    expect(etiquetaDeAcceso('licencia', VENCIDA.label)).toBe(ETIQUETA_DE_POR_VIDA);
    expect(etiquetaDeAcceso('licencia', EN_CURSO.label)).toBe(ETIQUETA_DE_POR_VIDA);
    expect(etiquetaDeAcceso('licencia', undefined)).toBe(ETIQUETA_DE_POR_VIDA);
  });

  it('ni una palabra de prueba en nada de lo que se le pinta', () => {
    // El barrido: todo lo que una pantalla podría poner en la cara de alguien
    // con licencia, junto, contra el patrón de los letreros de venta.
    const todo = [
      avisoDePrueba('licencia', VENCIDA)?.titulo,
      avisoDePrueba('licencia', VENCIDA)?.detalle,
      textoDeCandado('licencia', 'contenido'),
      textoDeCandado('licencia', 'edicion'),
      etiquetaDeAcceso('licencia', VENCIDA.label),
      resumenDeAlcance('licencia'),
    ]
      .filter(Boolean)
      .join(' · ');

    expect(todo).not.toMatch(sinLetreroDePrueba);
    expect(todo).toContain(ETIQUETA_DE_POR_VIDA);
  });
});

describe('sin licencia el aviso sí sale, y dice la verdad', () => {
  it('en prueba cuenta los días que faltan', () => {
    const aviso = avisoDePrueba('prueba', EN_CURSO)!;
    expect(aviso.titulo).toBe('Versión de prueba');
    expect(aviso.detalle).toContain(`Te quedan ${EN_CURSO.daysLeft} días`);
    expect(aviso.vencida).toBe(false);
  });

  it('el último día habla en singular', () => {
    expect(ULTIMO_DIA.daysLeft).toBe(1);
    expect(avisoDePrueba('prueba', ULTIMO_DIA)!.detalle).toContain('Te queda 1 día');
  });

  it('al vencer dice que terminó, y que nada se borró', () => {
    const aviso = avisoDePrueba('bloqueado', VENCIDA)!;
    expect(aviso.titulo).toBe('Tu prueba terminó');
    expect(aviso.vencida).toBe(true);
    expect(aviso.detalle).toContain('sigue aquí');
  });

  it('y el candado conserva sus dos textos', () => {
    expect(textoDeCandado('prueba', 'contenido')).toBe(CANDADO_TEXTO);
    expect(textoDeCandado('prueba', 'edicion')).toBe(CANDADO_EDICION);
    expect(textoDeCandado('bloqueado', 'contenido')).toBe(CANDADO_VENCIDO);
    expect(etiquetaDeAcceso('prueba', EN_CURSO.label)).toBe(EN_CURSO.label);
  });
});

describe('la regla vale para los tres niveles, no sólo para los dos que probé', () => {
  it('sólo el nivel decide, y sólo licencia calla', () => {
    const callan = ACCESS_LEVELS.filter((nivel: AccessLevel) => avisoDePrueba(nivel, VENCIDA) === null);
    expect(callan).toEqual(['licencia']);
  });

  it('la etiqueta de por vida es exclusiva de quien pagó', () => {
    const dePorVida = ACCESS_LEVELS.filter(
      (nivel: AccessLevel) => etiquetaDeAcceso(nivel, VENCIDA.label) === ETIQUETA_DE_POR_VIDA,
    );
    expect(dePorVida).toEqual(['licencia']);
  });
});
