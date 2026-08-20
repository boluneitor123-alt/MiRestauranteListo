import { describe, expect, it } from 'vitest';
import {
  calculateDelivery,
  deliveryActions,
  DELIVERY_DEFAULTS,
  MAX_COMMISSION_PCT,
  type DeliveryInput,
} from '../delivery';
import { money, money2 } from '../format';

const con = (over: Partial<DeliveryInput> = {}): DeliveryInput => ({ ...DELIVERY_DEFAULTS, ...over });

describe('calculadora de delivery', () => {
  it('reparte el precio de app como lo hace el prototipo', () => {
    // Taco de pastor a $45 con 27% de comisión, tal como arranca la herramienta.
    const r = calculateDelivery(con());
    expect(r.commissionAmount).toBeCloseTo(12.15, 2);
    expect(r.keptOnApp).toBeCloseTo(20.23, 2);
    expect(r.keptOnCounter).toBeCloseTo(22.88, 2);
    expect(Math.round(r.appMarginPct)).toBe(45);
    expect(r.level).toBe('sano');
  });

  it('calcula el precio de app al revés desde la utilidad de mostrador', () => {
    const r = calculateDelivery(con());
    // (9.12 + 3.50 + 22.88) ÷ (1 − 0.27) = 48.63…
    expect(r.suggestedPrice).toBeCloseTo(48.63, 2);
    expect(r.suggestedRounded).toBe(50);
  });

  it('sube el precio sugerido cuando sube la comisión', () => {
    const r = calculateDelivery(con({ commissionPct: 35 }));
    expect(r.commissionAmount).toBeCloseTo(15.75, 2);
    expect(r.keptOnApp).toBeCloseTo(16.63, 2);
    expect(Math.round(r.appMarginPct)).toBe(37);
    expect(r.suggestedPrice).toBeCloseTo(54.62, 2);
    expect(r.suggestedRounded).toBe(55);
  });

  it('mide la diferencia contra el mostrador por pedido y al mes', () => {
    const r = calculateDelivery(con({ commissionPct: 35 }));
    expect(r.perOrderGap).toBeCloseTo(-6.25, 2);
    // 6.25 × 10 pedidos × 30 días
    expect(Math.round(Math.abs(r.monthlyGap))).toBe(1875);
  });

  it('avisa cuando cada pedido cuesta dinero', () => {
    const r = calculateDelivery(con({ appPrice: 17 }));
    expect(r.keptOnApp).toBeLessThan(0);
    expect(r.level).toBe('perdida');
  });

  it('clasifica el margen en cuatro bandas', () => {
    // El margen sale de (precio − comisión − costo − empaque) ÷ precio.
    expect(calculateDelivery(con({ appPrice: 20 })).level).toBe('flaco'); // 9.9%
    expect(calculateDelivery(con({ appPrice: 24 })).level).toBe('justo'); // 20.4%
    expect(calculateDelivery(con({ appPrice: 30 })).level).toBe('sano'); // 30.9%
  });

  it('topa la comisión a 60%', () => {
    const alta = calculateDelivery(con({ commissionPct: 200 }));
    const tope = calculateDelivery(con({ commissionPct: MAX_COMMISSION_PCT }));
    expect(alta.keptOnApp).toBeCloseTo(tope.keptOnApp, 6);
  });
});

describe('qué hacer con el resultado', () => {
  it('recomienda subir el precio cuando el sugerido va arriba', () => {
    const input = con({ commissionPct: 35 });
    const actions = deliveryActions(input, calculateDelivery(input), money, money2);
    expect(actions[0]).toContain('Sube el precio de app de este platillo a $55');
  });

  it('pide capturar el empaque cuando quedó en cero', () => {
    const input = con({ packaging: 0 });
    const actions = deliveryActions(input, calculateDelivery(input), money, money2);
    expect(actions.some((a) => a.startsWith('No capturaste empaque'))).toBe(true);
  });

  it('señala la comisión cuando pasa de 27%', () => {
    const input = con({ commissionPct: 30 });
    const actions = deliveryActions(input, calculateDelivery(input), money, money2);
    expect(actions.some((a) => a.includes('está en el tope del mercado'))).toBe(true);
  });

  it('nunca da más de cuatro consejos', () => {
    const input = con({ commissionPct: 45, packaging: 0, appPrice: 30 });
    const actions = deliveryActions(input, calculateDelivery(input), money, money2);
    expect(actions.length).toBeLessThanOrEqual(4);
  });
});
