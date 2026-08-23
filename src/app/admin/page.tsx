'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { money } from '@/domain/format';
import { LICENSE_STATUS_LABELS, type License, type LicenseStatus } from '@/domain/license';
import { PERIODS, PERIOD_LABELS, type PeriodId } from '@/domain/period';
import type { AdminSummary } from '@/server/admin/metrics';
import type { AdminEvent, AdminSettings } from '@/server/licensing/store';

type Page = 'resumen' | 'licencias' | 'clientes' | 'ajustes' | 'registro';

const NAV: Array<{ id: Page; label: string }> = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'licencias', label: 'Licencias' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'ajustes', label: 'Ajustes' },
  { id: 'registro', label: 'Registro' },
];

const STATUS_COLOR: Record<LicenseStatus, string> = {
  activada: '#1f8a5a',
  nueva: '#e8a317',
  revocada: '#d63a26',
  reembolsada: '#7b756e',
};

const TOKEN_KEY = 'mrl.admin.token';

/** Panel del dueño (README § 2). Desktop 1440×900. */
export default function AdminPage() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState<Page>('resumen');
  const [period, setPeriod] = useState<PeriodId>('mes');
  const [range, setRange] = useState({ from: '', to: '' });
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LicenseStatus | 'todas'>('todas');
  const [issuing, setIssuing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', source: 'manual', amount: '' });
  const [message, setMessage] = useState<string | null>(null);

  /**
   * El acceso al panel lo decide el servidor con el `role` de la cuenta.
   * El token sólo queda como respaldo de operación, para automatizar sin
   * abrir sesión.
   */
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const r = await fetch('/api/auth/me');
        const data = (await r.json()) as { user?: { role?: string } | null };
        if (vivo && data.user?.role === 'admin') {
          setAuthed(true);
          return;
        }
      } catch {
        // Sin red se cae al respaldo del token.
      }
      const stored = window.localStorage.getItem(TOKEN_KEY);
      if (vivo && stored) {
        setToken(stored);
        setAuthed(true);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const call = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const response = await fetch(path, {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          'Content-Type': 'application/json',
          // Va vacío cuando la sesión ya es de admin: el servidor la lee de la cookie.
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.status === 401) {
        setAuthed(false);
        window.localStorage.removeItem(TOKEN_KEY);
        throw new Error('no-autorizado');
      }
      return response.json();
    },
    [token],
  );

  const load = useCallback(async () => {
    if (!authed) return;
    try {
      const params = new URLSearchParams({ period, ...(period === 'personalizado' ? range : {}) });
      const [summaryData, licenseData, eventData] = await Promise.all([
        call(`/api/admin/summary?${params}`),
        call(`/api/licenses?q=${encodeURIComponent(query)}&status=${statusFilter}`),
        call('/api/admin/events?limit=60'),
      ]);
      setSummary(summaryData.summary);
      setLicenses(licenseData.licenses ?? []);
      setSettings(licenseData.settings ?? null);
      setEvents(eventData.events ?? []);
    } catch {
      // El 401 ya devolvió al formulario de acceso.
    }
  }, [authed, call, period, range, query, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const customers = useMemo(() => {
    const map = new Map<string, { email: string; name?: string; licenses: License[]; paid: number }>();
    for (const license of licenses) {
      const key = license.email ?? 'sin correo';
      const entry = map.get(key) ?? { email: key, name: license.name, licenses: [], paid: 0 };
      entry.licenses.push(license);
      entry.paid += license.status === 'reembolsada' ? 0 : (license.amount ?? 0);
      map.set(key, entry);
    }
    return [...map.values()].sort((a, b) => b.paid - a.paid);
  }, [licenses]);

  const act = async (code: string, action: string) => {
    await call(`/api/licenses/${code}/${action}`, { method: 'POST' });
    setMessage(`Licencia ${code}: ${action}`);
    await load();
  };

  if (!authed) {
    return (
      <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 24 }}>
        <div style={{ width: 360 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, letterSpacing: '-.02em' }}>
            Panel de MiRestauranteListo
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--color-neutral-600)' }}>
            Entra con tu cuenta desde la app: si tiene permiso de administrador, el servidor te trae aquí solo. El
            token de <code>ADMIN_TOKEN</code> es el respaldo para operar sin sesión.
          </p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token"
            style={{
              width: '100%',
              height: 46,
              marginTop: 12,
              padding: '0 14px',
              borderRadius: 999,
              border: '1.5px solid var(--color-divider)',
            }}
          />
          <button
            type="button"
            onClick={() => {
              window.localStorage.setItem(TOKEN_KEY, token);
              setAuthed(true);
            }}
            style={{
              width: '100%',
              height: 46,
              marginTop: 10,
              borderRadius: 999,
              border: 'none',
              background: 'var(--color-accent)',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Entrar
          </button>
        </div>
      </main>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <aside
        style={{
          width: 248,
          flexShrink: 0,
          background: '#211f1d',
          color: '#f6f2ef',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, padding: '0 10px 18px' }}>
          MiRestauranteListo
        </div>
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPage(item.id)}
            style={{
              textAlign: 'left',
              border: 'none',
              borderRadius: 12,
              padding: '11px 14px',
              cursor: 'pointer',
              background: page === item.id ? 'var(--color-accent)' : 'transparent',
              color: page === item.id ? '#fff' : 'rgba(246,242,239,.75)',
              fontWeight: page === item.id ? 800 : 600,
              fontSize: 14,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {item.label}
            {item.id === 'licencias' ? <span>{licenses.length}</span> : null}
            {item.id === 'registro' ? <span>{events.length}</span> : null}
          </button>
        ))}

        <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,.07)', borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Pago único</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>{money(settings?.price ?? 2450)}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            {settings?.trialDays ?? 7} días de prueba · {settings?.maxDevices ?? 3} equipos por licencia
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '28px 34px', background: 'var(--color-bg)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, letterSpacing: '-.02em', margin: 0 }}>
              {NAV.find((n) => n.id === page)?.label}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: '4px 0 0' }}>
              {page === 'resumen'
                ? (summary?.period.description ?? 'Cargando…')
                : page === 'licencias'
                  ? 'Códigos emitidos, equipos y estado'
                  : page === 'clientes'
                    ? 'Quién compró y cuánto pagó'
                    : page === 'ajustes'
                      ? 'Precio, prueba, equipos y garantía'
                      : 'Todo lo que pasó, en orden'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={async () => {
                await call('/api/licenses', {
                  method: 'POST',
                  body: JSON.stringify({
                    email: `simulado${Date.now()}@correo.com`,
                    name: 'Pago simulado',
                    source: 'checkout',
                  }),
                });
                setMessage('Pago simulado recibido');
                await load();
              }}
              style={secondaryButton}
            >
              Simular pago recibido
            </button>
            <button type="button" onClick={() => setIssuing((v) => !v)} style={primaryButton}>
              Emitir licencia
            </button>
          </div>
        </header>

        {message ? (
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12, background: 'var(--color-accent-100)', fontSize: 13 }}>
            {message}
          </div>
        ) : null}

        {issuing ? (
          <section style={{ ...card, marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 12, alignItems: 'end' }}>
            {(
              [
                ['name', 'Nombre'],
                ['email', 'Correo'],
                ['source', 'Origen'],
                ['amount', 'Monto'],
              ] as Array<[keyof typeof form, string]>
            ).map(([key, label]) => (
              <label key={key} style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-600)' }}>
                {label}
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', height: 42, marginTop: 6, padding: '0 12px', borderRadius: 999, border: '1.5px solid var(--color-divider)' }}
                />
              </label>
            ))}
            <button
              type="button"
              onClick={async () => {
                const result = await call('/api/licenses', {
                  method: 'POST',
                  body: JSON.stringify({ ...form, amount: Number(form.amount) || undefined }),
                });
                setMessage(result.code ? `Licencia ${result.code} emitida` : 'No se pudo emitir');
                setForm({ name: '', email: '', source: 'manual', amount: '' });
                setIssuing(false);
                await load();
              }}
              style={primaryButton}
            >
              Generar
            </button>
          </section>
        ) : null}

        {page === 'resumen' && summary ? (
          <Resumen
            summary={summary}
            period={period}
            range={range}
            onPeriod={setPeriod}
            onRange={setRange}
          />
        ) : null}

        {page === 'licencias' ? (
          <section style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por código, nombre o correo"
                style={{ height: 42, padding: '0 14px', borderRadius: 999, border: '1.5px solid var(--color-divider)', minWidth: 280 }}
              />
              {(['todas', 'activada', 'nueva', 'revocada', 'reembolsada'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  style={{
                    ...chip,
                    background: statusFilter === status ? 'var(--color-accent-100)' : 'transparent',
                    borderColor: statusFilter === status ? 'var(--color-accent)' : 'var(--color-divider)',
                  }}
                >
                  {status === 'todas' ? 'Todas' : LICENSE_STATUS_LABELS[status]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const rows = [
                    ['codigo', 'estado', 'correo', 'nombre', 'origen', 'monto', 'equipos', 'creada'],
                    ...licenses.map((l) => [
                      l.code,
                      l.status,
                      l.email ?? '',
                      l.name ?? '',
                      l.source ?? '',
                      String(l.amount ?? 0),
                      String(l.devices.length),
                      new Date(l.createdAt).toISOString(),
                    ]),
                  ];
                  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
                  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'licencias.csv';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                style={secondaryButton}
              >
                Exportar CSV
              </button>
            </div>

            <div style={{ ...card, marginTop: 14, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--color-neutral-200)', textAlign: 'left' }}>
                    {['Código', 'Estado', 'Cliente', 'Origen', 'Monto', 'Equipos', 'Acciones'].map((h) => (
                      <th key={h} style={{ padding: '12px 14px', fontSize: 11.5, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((license) => (
                    <tr key={license.code} style={{ borderTop: '1px solid var(--color-divider)' }}>
                      <td style={cell}>{license.code}</td>
                      <td style={cell}>
                        <span style={{ ...tag, background: `${STATUS_COLOR[license.status]}22`, color: STATUS_COLOR[license.status] }}>
                          {LICENSE_STATUS_LABELS[license.status]}
                        </span>
                      </td>
                      <td style={cell}>
                        <div>{license.name ?? '—'}</div>
                        <div style={{ color: 'var(--color-neutral-600)', fontSize: 12 }}>{license.email}</div>
                      </td>
                      <td style={cell}>{license.source}</td>
                      <td style={cell}>{money(license.amount ?? 0)}</td>
                      <td style={cell}>
                        {license.devices.length} de {settings?.maxDevices ?? 3}
                      </td>
                      <td style={cell}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button type="button" style={miniButton} onClick={() => navigator.clipboard?.writeText(license.code)}>
                            Copiar
                          </button>
                          <button type="button" style={miniButton} onClick={() => act(license.code, 'resend')}>
                            Reenviar
                          </button>
                          <button type="button" style={miniButton} onClick={() => act(license.code, 'free-devices')}>
                            Liberar
                          </button>
                          <button
                            type="button"
                            style={miniButton}
                            onClick={() => act(license.code, license.status === 'revocada' ? 'reactivate' : 'revoke')}
                          >
                            {license.status === 'revocada' ? 'Reactivar' : 'Revocar'}
                          </button>
                          <button type="button" style={miniButton} onClick={() => act(license.code, 'refund')}>
                            Reembolso
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {page === 'clientes' ? (
          <section style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {customers.map((customer) => (
              <div key={customer.email} style={card}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{customer.name ?? customer.email}</div>
                <div style={{ fontSize: 12.5, color: 'var(--color-neutral-600)' }}>{customer.email}</div>
                <div style={{ marginTop: 10, fontSize: 13 }}>
                  {customer.licenses.length} licencia(s) · {money(customer.paid)} pagados
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {customer.licenses.map((l) => (
                    <span key={l.code} style={{ ...tag, background: `${STATUS_COLOR[l.status]}22`, color: STATUS_COLOR[l.status] }}>
                      {l.code}
                    </span>
                  ))}
                </div>
                <a href={`mailto:${customer.email}`} style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--color-accent-800)' }}>
                  Escribirle por correo →
                </a>
              </div>
            ))}
          </section>
        ) : null}

        {page === 'ajustes' && settings ? (
          <Ajustes
            settings={settings}
            onSave={async (patch) => {
              const result = await call('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(patch) });
              setSettings(result.settings);
              setMessage('Ajustes actualizados');
              await load();
            }}
            onWipeEvents={async () => {
              await call('/api/admin/events', { method: 'DELETE' });
              setMessage('Bitácora borrada');
              await load();
            }}
          />
        ) : null}

        {page === 'registro' ? (
          <section style={{ ...card, marginTop: 20 }}>
            {events.map((event) => (
              <div key={event.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-divider)' }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    marginTop: 6,
                    background: event.kind.includes('revocada') || event.kind.includes('reembolsada') ? '#d63a26' : event.kind.includes('pago') ? '#1f8a5a' : '#e8a317',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>{event.message}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-neutral-600)' }}>
                    {new Date(event.createdAt).toLocaleString('es-MX')}
                  </div>
                </div>
              </div>
            ))}
            {!events.length ? <div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Sin eventos todavía.</div> : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}

function Resumen({
  summary,
  period,
  range,
  onPeriod,
  onRange,
}: {
  summary: AdminSummary;
  period: PeriodId;
  range: { from: string; to: string };
  onPeriod: (id: PeriodId) => void;
  onRange: (range: { from: string; to: string }) => void;
}) {
  return (
    <>
      <section style={{ marginTop: 18, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {PERIODS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onPeriod(id)}
            style={{
              ...chip,
              background: period === id ? 'var(--color-accent-100)' : 'transparent',
              borderColor: period === id ? 'var(--color-accent)' : 'var(--color-divider)',
            }}
          >
            {PERIOD_LABELS[id]}
          </button>
        ))}
        {period === 'personalizado' ? (
          <>
            <input type="date" value={range.from} onChange={(e) => onRange({ ...range, from: e.target.value })} style={dateInput} />
            <input type="date" value={range.to} onChange={(e) => onRange({ ...range, to: e.target.value })} style={dateInput} />
          </>
        ) : null}
      </section>

      <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
        <Kpi title="Ingresos netos" value={money(summary.net)} hint={`Bruto ${money(summary.gross)} · reembolsado ${money(summary.refunded)}`} />
        <Kpi title="Licencias del periodo" value={String(summary.issued)} hint={`${summary.activated} activadas · ${summary.notActivated} sin activar`} />
        <Kpi
          title="Reembolsos"
          value={`${summary.refundRatePct}%`}
          hint={`${summary.refundedOrdersPct}% de las órdenes`}
          alert={summary.refundAlert}
        />
        <Kpi
          title="Demos terminadas sin pagar"
          value={String(summary.demos.finishedWithoutPaying)}
          hint={`${summary.finishedWithoutPayingPct}% de las demos concluidas`}
        />
      </section>

      <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 14 }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={h2}>Ingresos por origen</h2>
            <span style={{ fontWeight: 800 }}>Neto {money(summary.net)}</span>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
            {summary.revenueBySource.map((row) => (
              <div key={row.source}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{row.source}</span>
                  <span style={{ fontWeight: 700 }}>{money(row.net)}</span>
                </div>
                <div style={{ height: 8, background: 'var(--color-neutral-200)', borderRadius: 999, marginTop: 4 }}>
                  <div
                    style={{
                      width: `${summary.net > 0 ? Math.max(0, (row.net / summary.net) * 100) : 0}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: 'var(--color-accent)',
                    }}
                  />
                </div>
              </div>
            ))}
            {!summary.revenueBySource.length ? <div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Sin ventas en el periodo.</div> : null}
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 20, fontSize: 13 }}>
            <div>
              <div style={{ color: 'var(--color-neutral-600)' }}>Códigos emitidos</div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{summary.issued}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-neutral-600)' }}>Activados</div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{summary.activated}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-neutral-600)' }}>Sin activar</div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{summary.notActivated}</div>
            </div>
          </div>
        </div>

        <div style={card}>
          <h2 style={h2}>Requiere tu atención</h2>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
            {summary.attention.map((item) => (
              <div key={item.kind} style={{ background: 'var(--color-neutral-200)', borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{item.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--color-neutral-600)', marginTop: 3 }}>{item.detail}</div>
              </div>
            ))}
            {!summary.attention.length ? <div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Nada pendiente.</div> : null}
          </div>
        </div>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h2 style={h2}>Cómo va la demo de prueba</h2>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
          <Metric label="Demos iniciadas" value={summary.demos.started} />
          <Metric label="Demos concluidas" value={summary.demos.finished} />
          <Metric label="Concluidas sin pago" value={summary.demos.finishedWithoutPaying} />
          <Metric label="Conversión" value={`${summary.demos.conversionPct}%`} />
        </div>
        <div style={{ height: 8, background: 'var(--color-neutral-200)', borderRadius: 999, marginTop: 14 }}>
          <div style={{ width: `${summary.demos.conversionPct}%`, height: '100%', borderRadius: 999, background: 'var(--color-accent-2-500)' }} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', marginTop: 10 }}>{summary.conversionReading}</p>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h2 style={h2}>Últimas licencias</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 10 }}>
          <tbody>
            {summary.latest.map((license) => (
              <tr key={license.code} style={{ borderTop: '1px solid var(--color-divider)' }}>
                <td style={cell}>{license.code}</td>
                <td style={cell}>{license.email}</td>
                <td style={cell}>
                  <span style={{ ...tag, background: `${STATUS_COLOR[license.status]}22`, color: STATUS_COLOR[license.status] }}>
                    {LICENSE_STATUS_LABELS[license.status]}
                  </span>
                </td>
                <td style={cell}>{money(license.amount ?? 0)}</td>
                <td style={cell}>{new Date(license.createdAt).toLocaleDateString('es-MX')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function Ajustes({
  settings,
  onSave,
  onWipeEvents,
}: {
  settings: AdminSettings;
  onSave: (patch: Partial<AdminSettings>) => Promise<void>;
  onWipeEvents: () => Promise<void>;
}) {
  const [draft, setDraft] = useState(settings);
  useEffect(() => setDraft(settings), [settings]);

  const fields: Array<[keyof AdminSettings, string]> = [
    ['price', 'Precio del pago único'],
    ['trialDays', 'Días de prueba'],
    ['maxDevices', 'Equipos permitidos por licencia'],
    ['referralDiscountPct', 'Descuento por referido (%)'],
    ['warrantyDays', 'Días de garantía'],
  ];

  return (
    <section style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
      <div style={card}>
        <h2 style={h2}>Cobro y acceso</h2>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
          {fields.map(([key, label]) => (
            <label key={key} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-neutral-600)' }}>
              {label}
              <input
                inputMode="decimal"
                value={String(draft[key])}
                onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                style={{ width: '100%', height: 42, marginTop: 6, padding: '0 12px', borderRadius: 999, border: '1.5px solid var(--color-divider)' }}
              />
            </label>
          ))}
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5, fontWeight: 700 }}>
            Activación automática
            <input
              type="checkbox"
              checked={draft.autoActivation}
              onChange={(e) => setDraft({ ...draft, autoActivation: e.target.checked })}
              style={{ width: 20, height: 20 }}
            />
          </label>
          <button type="button" onClick={() => onSave(draft)} style={primaryButton}>
            Guardar ajustes
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
        <div style={card}>
          <h2 style={h2}>Cómo conectar el cobro real</h2>
          <ol style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-neutral-700)', paddingLeft: 18 }}>
            <li>Crea el producto de pago único en Stripe o Mercado Pago con el precio de arriba.</li>
            <li>Apunta el webhook del proveedor a <code>/api/webhooks/payment</code>.</li>
            <li>Guarda su secreto de firma en <code>STRIPE_WEBHOOK_SECRET</code>.</li>
            <li>Configura <code>RESEND_API_KEY</code> para que salga el correo con el código.</li>
            <li>Haz una compra de prueba: la app debe desbloquearse sola, sin teclear nada.</li>
          </ol>
        </div>

        <div style={{ ...card, border: '1.5px solid #d63a26' }}>
          <h2 style={{ ...h2, color: '#d63a26' }}>Zona de riesgo</h2>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>
            Borrar la bitácora no afecta licencias ni clientes, pero se pierde el historial de eventos.
          </p>
          <button type="button" onClick={onWipeEvents} style={{ ...secondaryButton, borderColor: '#d63a26', color: '#d63a26' }}>
            Borrar eventos
          </button>
        </div>
      </div>
    </section>
  );
}

function Kpi({ title, value, hint, alert }: { title: string; value: string; hint: string; alert?: boolean }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12.5, color: 'var(--color-neutral-600)', fontWeight: 700 }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, marginTop: 4, color: alert ? '#d63a26' : 'inherit' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 4 }}>{hint}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, color: 'var(--color-neutral-600)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>{value}</div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 20,
  padding: 18,
  boxShadow: 'var(--shadow-sm)',
};

const h2: React.CSSProperties = { fontFamily: 'var(--font-heading)', fontSize: 17, margin: 0, letterSpacing: '-.01em' };

const cell: React.CSSProperties = { padding: '12px 14px', verticalAlign: 'top' };

const tag: React.CSSProperties = { display: 'inline-block', padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 800 };

const chip: React.CSSProperties = {
  height: 36,
  padding: '0 14px',
  borderRadius: 999,
  border: '1.5px solid var(--color-divider)',
  background: 'transparent',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const primaryButton: React.CSSProperties = {
  height: 42,
  padding: '0 18px',
  borderRadius: 999,
  border: 'none',
  background: 'var(--color-accent)',
  color: '#fff',
  fontWeight: 800,
  fontSize: 13.5,
  cursor: 'pointer',
};

const secondaryButton: React.CSSProperties = {
  height: 42,
  padding: '0 18px',
  borderRadius: 999,
  border: '1.5px solid var(--color-divider)',
  background: 'transparent',
  color: 'var(--color-text)',
  fontWeight: 700,
  fontSize: 13.5,
  cursor: 'pointer',
};

const miniButton: React.CSSProperties = {
  height: 30,
  padding: '0 10px',
  borderRadius: 999,
  border: '1.5px solid var(--color-divider)',
  background: 'transparent',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

const dateInput: React.CSSProperties = {
  height: 36,
  padding: '0 12px',
  borderRadius: 999,
  border: '1.5px solid var(--color-divider)',
};
