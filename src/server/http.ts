/**
 * Utilidades comunes de las rutas de API.
 */

import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string): NextResponse {
  return json({ ok: false, error: 'peticion-invalida', message }, 400);
}

export function unauthorized(): NextResponse {
  return json({ ok: false, error: 'no-autorizado', message: 'Necesitas iniciar sesión en el panel.' }, 401);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function num(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

/**
 * El panel se protege con `ADMIN_TOKEN`. Sin token configurado no se sirve
 * ninguna operación de administración: es preferible un panel inaccesible a uno
 * abierto a internet.
 */
export function isAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;

  const header = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('mrl_admin='))
    ?.slice('mrl_admin='.length);

  const provided = header || (cookie ? decodeURIComponent(cookie) : '');
  if (!provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

/**
 * Verificación de firma del webhook de cobro: HMAC-SHA256 del cuerpo crudo con
 * `STRIPE_WEBHOOK_SECRET`. Cada proveedor arma su cabecera distinto; el
 * adaptador de arriba normaliza y esto compara.
 */
export function verifySignature(rawBody: string, signature: string | null, secret: string | undefined): boolean {
  if (!secret) return false;
  if (!signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signature.replace(/^sha256=/, '').trim();
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}
