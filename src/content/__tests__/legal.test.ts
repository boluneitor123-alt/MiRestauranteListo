import { describe, expect, it } from 'vitest';
import { ACTUALIZADO, CORREO, DOC_PRIVACIDAD, DOC_TERMINOS, TITULAR } from '../legal';
import { LICENSE_DEFAULTS } from '@/domain/license';

const docs = [DOC_TERMINOS, DOC_PRIVACIDAD];

describe('los documentos legales', () => {
  it('tienen secciones con id único, que es lo que ancla el índice', () => {
    for (const doc of docs) {
      const ids = doc.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every((id) => /^[a-z-]+$/.test(id))).toBe(true);
    }
  });

  it('no dejan ninguna sección sin texto', () => {
    for (const doc of docs) {
      for (const s of doc.sections) {
        expect(s.title.length).toBeGreaterThan(3);
        expect(s.body.length).toBeGreaterThan(0);
        expect(s.body.every((p) => p.trim().length > 20)).toBe(true);
      }
    }
  });

  it('no dejan corchetes por llenar', () => {
    for (const doc of docs) {
      const todo = doc.sections.flatMap((s) => [s.title, ...s.body, ...(s.list ?? [])]).join(' ');
      expect(todo).not.toMatch(/\[|\]/);
    }
  });

  it('dicen los días de prueba y de garantía que el producto de verdad da', () => {
    const prueba = DOC_TERMINOS.sections.find((s) => s.id === 'prueba')!;
    const garantia = DOC_TERMINOS.sections.find((s) => s.id === 'garantia')!;
    expect(prueba.title).toBe(`Prueba de ${LICENSE_DEFAULTS.trialDays} días`);
    expect(prueba.body.join(' ')).toContain(`${LICENSE_DEFAULTS.trialDays} días de prueba`);
    expect(garantia.title).toBe(`Garantía de ${LICENSE_DEFAULTS.warrantyDays} días`);
    expect(garantia.body.join(' ')).toContain(`${LICENSE_DEFAULTS.warrantyDays} días naturales`);
  });

  it('cobran el precio que cobra el producto', () => {
    const pago = DOC_TERMINOS.sections.find((s) => s.id === 'pago')!;
    expect(pago.body.join(' ')).toContain('$2,450 MXN');
    expect(LICENSE_DEFAULTS.price).toBe(2450);
  });

  it('nombran al responsable y su correo, que la ley pide', () => {
    const responsable = DOC_PRIVACIDAD.sections.find((s) => s.id === 'p-responsable')!;
    expect(responsable.body.join(' ')).toContain(TITULAR);
    expect(responsable.body.join(' ')).toContain(CORREO);
  });

  it('llevan fecha fija, no la de hoy', () => {
    expect(DOC_TERMINOS.sub).toContain(ACTUALIZADO);
    expect(ACTUALIZADO).toMatch(/^\d{1,2} de [a-zé]+ de \d{4}$/);
  });

  it('se apuntan el uno al otro', () => {
    expect(DOC_TERMINOS.slug).toBe('/terminos');
    expect(DOC_PRIVACIDAD.slug).toBe('/privacidad');
  });
});
