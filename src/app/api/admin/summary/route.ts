import { getLicenseService, getLicenseStore } from '@/server/licensing';
import { buildSummary } from '@/server/admin/metrics';
import { resolvePeriod, type PeriodId, PERIODS } from '@/domain/period';
import { isAdmin, json, unauthorized } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** `GET /api/admin/summary?period=mes&from=&to=` — KPIs del panel. */
export async function GET(request: Request) {
  if (!isAdmin(request)) return unauthorized();

  const url = new URL(request.url);
  const requested = url.searchParams.get('period') as PeriodId | null;
  const periodId: PeriodId = requested && PERIODS.includes(requested) ? requested : 'mes';

  const store = await getLicenseStore();
  const service = await getLicenseService();
  const now = Date.now();

  const summary = buildSummary({
    licenses: await store.listLicenses(),
    trials: await store.listTrials(),
    period: resolvePeriod(periodId, now, {
      from: url.searchParams.get('from') ?? undefined,
      to: url.searchParams.get('to') ?? undefined,
    }),
    settings: await service.settings(),
    now,
  });

  return json({ ok: true, summary });
}
