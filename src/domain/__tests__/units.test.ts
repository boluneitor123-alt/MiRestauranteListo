import { describe, expect, it } from 'vitest';
import { UNIT_CODES, convert, sameFamily, unitFactor, unitFamily, isUnitCode } from '../units';

describe('unidades y conversión (README § 4)', () => {
  it('usa los factores documentados', () => {
    expect(unitFactor('g')).toBe(1);
    expect(unitFactor('kg')).toBe(1000);
    expect(unitFactor('oz')).toBe(28.35);
    expect(unitFactor('lb')).toBe(453.6);
    expect(unitFactor('ml')).toBe(1);
    expect(unitFactor('l')).toBe(1000);
    expect(unitFactor('taza')).toBe(240);
    expect(unitFactor('cda')).toBe(15);
    expect(unitFactor('pz')).toBe(1);
    expect(unitFactor('manojo')).toBe(1);
  });

  it('agrupa las unidades en tres familias', () => {
    expect(['g', 'kg', 'oz', 'lb'].map(unitFamily)).toEqual(['masa', 'masa', 'masa', 'masa']);
    expect(['ml', 'l', 'taza', 'cda'].map(unitFamily)).toEqual(['volumen', 'volumen', 'volumen', 'volumen']);
    expect(['pz', 'manojo'].map(unitFamily)).toEqual(['pieza', 'pieza']);
  });

  it('convierte dentro de la misma familia', () => {
    expect(convert(1, 'kg', 'g')).toBe(1000);
    expect(convert(500, 'g', 'kg')).toBe(0.5);
    expect(convert(2, 'l', 'ml')).toBe(2000);
    expect(convert(1, 'taza', 'cda')).toBe(16);
  });

  it('no inventa conversiones entre familias distintas', () => {
    expect(sameFamily('g', 'ml')).toBe(false);
    expect(convert(250, 'g', 'ml')).toBe(250);
  });

  it('cae a gramos ante una unidad desconocida en lugar de romperse', () => {
    expect(unitFactor('cucharadita')).toBe(1);
    expect(unitFamily(undefined)).toBe('masa');
    expect(isUnitCode('kg')).toBe(true);
    expect(isUnitCode('cucharadita')).toBe(false);
  });

  it('expone las 10 unidades del selector', () => {
    expect(UNIT_CODES).toHaveLength(10);
  });
});
