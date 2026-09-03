import { getLicenseService } from '@/server/licensing';
import { readAccounts } from '@/server/admin/accountsReader';
import { filterAccounts, type EstadoCuenta } from '@/server/admin/accounts';
import { isAdmin, json, unauthorized } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ESTADOS: readonly EstadoCuenta[] = ['pago', 'en-prueba', 'prueba-vencida', 'sin-actividad'];

/** `GET /api/admin/accounts?q=&estado=&abandonadas=1` — una fila por persona registrada. */
export async function GET(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();

  const url = new URL(request.url);
  const pedido = url.searchParams.get('estado') as EstadoCuenta | null;
  const service = await getLicenseService();
  const settings = await service.settings();

  const todas = await readAccounts({ now: Date.now(), trialDays: settings.trialDays });
  const accounts = filterAccounts(todas, {
    query: url.searchParams.get('q') ?? undefined,
    estado: pedido && ESTADOS.includes(pedido) ? pedido : undefined,
    soloAbandonadas: url.searchParams.get('abandonadas') === '1',
  });

  return json({ ok: true, accounts, total: todas.length });
}
