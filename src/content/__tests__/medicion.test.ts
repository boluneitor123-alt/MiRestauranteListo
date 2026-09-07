import { describe, expect, it } from 'vitest';
import { EVENTOS, esEstandar, marcarIntencion, vieneDeIntencion } from '@/content/medicion';

/*
  Un estándar mandado con `trackCustom` queda como personalizado aunque se
  llame igual, y no sirve para optimizar campañas. Es el error que se hace solo
  al renombrar un evento sin moverlo de lista, y no falla nada: los números en
  Meta simplemente no significan lo que uno cree.
*/
describe('el catálogo de eventos', () => {
  it('los seis estándar de Meta van con track', () => {
    for (const nombre of [
      EVENTOS.pageView,
      EVENTOS.lead,
      EVENTOS.startTrial,
      EVENTOS.completeRegistration,
      EVENTOS.initiateCheckout,
      EVENTOS.purchase,
    ]) {
      expect(esEstandar(nombre), `«${nombre}» debería ser estándar`).toBe(true);
    }
  });

  it('los propios van con trackCustom', () => {
    for (const nombre of [
      EVENTOS.leadIntent,
      EVENTOS.registroIniciado,
      EVENTOS.calculadoraUsada,
      EVENTOS.diagnosticoCompletado,
    ]) {
      expect(esEstandar(nombre), `«${nombre}» no es un estándar de Meta`).toBe(false);
    }
  });

  it('los nombres estándar respetan las mayúsculas exactas de Meta', () => {
    // Meta distingue mayúsculas: «startTrial» o «starttrial» no son el evento.
    expect(EVENTOS.startTrial).toBe('StartTrial');
    expect(EVENTOS.completeRegistration).toBe('CompleteRegistration');
    expect(EVENTOS.initiateCheckout).toBe('InitiateCheckout');
    expect(EVENTOS.purchase).toBe('Purchase');
    expect(EVENTOS.lead).toBe('Lead');
  });

  it('ya no existe InicioPrueba: se llama StartTrial', () => {
    expect(Object.values(EVENTOS)).not.toContain('InicioPrueba');
    expect(Object.values(EVENTOS)).toContain('StartTrial');
  });

  it('un nombre inventado no se cuela como estándar', () => {
    expect(esEstandar('CompraFinalizada')).toBe(false);
    expect(esEstandar('purchase')).toBe(false);
  });
});

describe('una sola señal de «empezó a registrarse»', () => {
  /*
    `StartTrial` sale del clic en la landing y `RegistroIniciado` de que se vea
    el formulario, medio segundo después: el mismo momento contado dos veces.
    Un embudo con un paso que siempre pasa al 100% no dice nada. La marca hace
    que `/cuenta` se calle cuando ya hubo clic, sin perder a quien llega directo.
  */
  const conVentana = (almacen: Map<string, string> | null, fn: () => void) => {
    const global = globalThis as { window?: unknown };
    const previo = global.window;
    const ventana = {};
    Object.defineProperty(ventana, 'sessionStorage', {
      get() {
        // Ventana privada o almacenamiento bloqueado: lanza al tocarlo, que es
        // como se comporta el navegador de verdad.
        if (!almacen) throw new Error('bloqueado');
        return {
          getItem: (k: string) => almacen.get(k) ?? null,
          setItem: (k: string, v: string) => void almacen.set(k, v),
        };
      },
    });
    global.window = ventana;
    try {
      fn();
    } finally {
      if (previo === undefined) delete global.window;
      else global.window = previo;
    }
  };

  it('tras marcar, la pantalla de cuenta se calla', () => {
    const almacen = new Map<string, string>();
    conVentana(almacen, () => {
      expect(vieneDeIntencion()).toBe(false);
      marcarIntencion();
      expect(vieneDeIntencion()).toBe(true);
    });
  });

  it('la marca caduca: una visita de mañana vuelve a contar', () => {
    const almacen = new Map<string, string>([['mrl.intencion', String(Date.now() - 10 * 60_000)]]);
    conVentana(almacen, () => expect(vieneDeIntencion()).toBe(false));
  });

  it('una marca corrupta no se cree', () => {
    conVentana(new Map([['mrl.intencion', 'mañana']]), () => expect(vieneDeIntencion()).toBe(false));
    conVentana(new Map([['mrl.intencion', '']]), () => expect(vieneDeIntencion()).toBe(false));
  });

  it('sin sessionStorage se cuenta de más, no de menos', () => {
    // Ventana privada: perder el evento sería peor que repetirlo.
    conVentana(null, () => {
      expect(() => marcarIntencion()).not.toThrow();
      expect(vieneDeIntencion()).toBe(false);
    });
  });
});
