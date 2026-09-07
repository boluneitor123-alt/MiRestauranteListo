import { describe, expect, it } from 'vitest';
import { EVENTOS, esEstandar } from '@/content/medicion';

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
