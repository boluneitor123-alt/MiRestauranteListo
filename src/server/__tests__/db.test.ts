import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasDatabase, permiteAlmacenEnMemoria, SinBaseDeDatos } from '../db';

const urlOriginal = process.env.DATABASE_URL;

function con(url: string | undefined, nodeEnv: string) {
  if (url === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = url;
  vi.stubEnv('NODE_ENV', nodeEnv);
}

afterEach(() => {
  vi.unstubAllEnvs();
  if (urlOriginal === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = urlOriginal;
});

describe('sin base de datos en producción no se arranca', () => {
  it.each([
    ['sin variable', undefined],
    ['con la de ejemplo', 'postgresql://user:password@localhost:5432/mrl'],
  ])('%s revienta con el motivo escrito', (_caso, url) => {
    con(url, 'production');
    expect(() => permiteAlmacenEnMemoria('licencias')).toThrow(SinBaseDeDatos);
    expect(() => permiteAlmacenEnMemoria('licencias')).toThrow(/DATABASE_URL/);
    expect(() => permiteAlmacenEnMemoria('licencias')).toThrow(/Vercel/);
  });

  it('el área aparece en el mensaje, para saber qué reventó', () => {
    con(undefined, 'production');
    expect(() => permiteAlmacenEnMemoria('cuentas')).toThrow(/\[cuentas\]/);
  });

  it('con base real no revienta y no usa memoria', () => {
    con('postgresql://real:real@neon.tech:5432/neondb', 'production');
    expect(permiteAlmacenEnMemoria('licencias')).toBe(false);
    expect(hasDatabase()).toBe(true);
  });
});

describe('en desarrollo se sigue pudiendo trabajar sin Postgres', () => {
  it('deja usar el almacén en memoria y lo avisa', () => {
    con(undefined, 'development');
    const avisos: string[] = [];
    const previo = console.warn;
    console.warn = (m: unknown) => void avisos.push(String(m));
    try {
      expect(permiteAlmacenEnMemoria('licencias')).toBe(true);
    } finally {
      console.warn = previo;
    }
    expect(avisos[0]).toContain('desarrollo local');
  });
});
