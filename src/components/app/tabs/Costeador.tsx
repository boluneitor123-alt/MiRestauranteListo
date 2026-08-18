'use client';

import { useState } from 'react';
import { Lock, Search } from 'lucide-react';
import { dishMetrics } from '@/domain/costing';
import { menuAggregates } from '@/domain/aggregates';
import { subrecipeUnitCost, subrecipeBatchCost } from '@/domain/costing';
import { matchesSemaphoreFilter, semaphoreLevel, type SemaphoreFilter } from '@/domain/semaphore';
import { money, money2, pct } from '@/domain/format';
import { dishLimitNotice, type AccessLevel } from '@/domain/access';
import type { Capabilities } from '@/domain/access';
import type { ProjectState } from '@/domain/projectState';
import { Button, Card, EmptyState, H, Muted, Pill, RADIUS, Row, text } from '@/components/ui';

export type CostView = 'platillos' | 'menu' | 'subrecetas';

const SEMAPHORE_COLOR = {
  saludable: 'var(--color-accent-2-700)',
  revisar: 'var(--color-warn)',
  peligroso: 'var(--color-accent-800)',
  'sin-precio': 'var(--color-neutral-600)',
} as const;

/** Costeador de Platillos: vistas Platillos · Mi Menú · Sub-recetas (README § 1.7). */
export function Costeador({
  state,
  view,
  level,
  can,
  onChangeView,
  onOpenDish,
  onNewDish,
  onOpenSubrecipe,
  onNewSubrecipe,
  onOpenPaywall,
}: {
  state: ProjectState;
  view: CostView;
  level: AccessLevel;
  can: Capabilities;
  onChangeView: (view: CostView) => void;
  onOpenDish: (id: string) => void;
  onNewDish: () => void;
  onOpenSubrecipe: (id: string) => void;
  onNewSubrecipe: () => void;
  onOpenPaywall: () => void;
}) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'todo' | 'platillos' | 'subrecetas'>('todo');
  const [colorFilter, setColorFilter] = useState<SemaphoreFilter>('todos');

  const ctx = { subrecipes: state.subrecipes };
  const aggregates = menuAggregates(state.dishes, ctx);

  const rows = state.dishes
    .map((dish) => ({ dish, metrics: dishMetrics(dish, ctx, { targetFoodCost: state.fcTarget }) }))
    .filter((row) => (query ? row.dish.name.toLowerCase().includes(query.toLowerCase()) : true))
    .filter((row) => matchesSemaphoreFilter(row.metrics.foodCostRounded, colorFilter));

  const limitNotice = dishLimitNotice(level, state.dishes.length);

  return (
    <div className="mrl-measure" style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
      <H size={25}>Costeador de Platillos</H>

      <Row gap={6} style={{ background: 'var(--color-neutral-200)', borderRadius: RADIUS.pill, padding: 4 }}>
        {(
          [
            ['platillos', 'Platillos'],
            ['menu', 'Mi Menú'],
            ['subrecetas', 'Sub-recetas'],
          ] as Array<[CostView, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChangeView(id)}
            style={{
              flex: 1, minWidth: 0,
              height: 38,
              borderRadius: RADIUS.pill,
              border: 'none',
              background: view === id ? 'var(--color-surface)' : 'transparent',
              boxShadow: view === id ? 'var(--shadow-sm)' : 'none',
              color: view === id ? 'var(--color-text)' : text(55),
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {label}
          </button>
        ))}
      </Row>

      {view === 'platillos' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
            <Kpi label="Platillos" value={String(state.dishes.length)} />
            <Kpi label="Food cost promedio" value={pct(aggregates.averageFoodCost)} />
            <Kpi label="Precio promedio" value={aggregates.averagePrice === null ? '—' : money(aggregates.averagePrice)} />
          </div>

          {limitNotice ? (
            <Card style={{ background: 'var(--color-accent-100)', padding: 14 }}>
              <Muted size={13} style={{ color: 'var(--color-accent-900)' }}>
                {limitNotice}
              </Muted>
            </Card>
          ) : null}

          <Button
            onClick={() => (can.dishLimit === null || state.dishes.length < can.dishLimit ? onNewDish() : onOpenPaywall())}
          >
            Nuevo platillo
          </Button>

          <Row style={{ justifyContent: 'space-between' }}>
            <H size={18}>Platillos guardados</H>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
            >
              <Search size={19} strokeWidth={2.6} color="var(--color-text)" />
            </button>
          </Row>

          {searchOpen ? (
            <Row gap={8}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre"
                style={{
                  flex: 1, minWidth: 0,
                  height: 44,
                  padding: '0 16px',
                  borderRadius: RADIUS.pill,
                  border: '1.5px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                  fontSize: 16,
                }}
              />
              <Pill onClick={() => setQuery('')}>Limpiar</Pill>
            </Row>
          ) : null}

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {(
              [
                ['todo', 'Todo'],
                ['platillos', 'Platillos principales'],
                ['subrecetas', 'Sub-recetas'],
              ] as Array<['todo' | 'platillos' | 'subrecetas', string]>
            ).map(([id, label]) => (
              <Pill key={id} selected={typeFilter === id} onClick={() => setTypeFilter(id)}>
                {label}
              </Pill>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {(
              [
                ['todos', 'Todos'],
                ['saludable', 'Saludables'],
                ['revisar', 'En riesgo'],
                ['peligroso', 'Peligrosos'],
              ] as Array<[SemaphoreFilter, string]>
            ).map(([id, label]) => (
              <Pill key={id} selected={colorFilter === id} onClick={() => setColorFilter(id)}>
                {label}
              </Pill>
            ))}
          </div>

          {typeFilter === 'subrecetas' ? (
            <SubrecipeList state={state} onOpen={onOpenSubrecipe} onNew={onNewSubrecipe} />
          ) : rows.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
              {rows.map(({ dish, metrics }) => (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => onOpenDish(dish.id)}
                  style={{
                    textAlign: 'left',
                    border: 'none',
                    background: 'var(--color-surface)',
                    borderRadius: RADIUS.block,
                    boxShadow: 'var(--shadow-sm)',
                    padding: 14,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text)',
                  }}
                >
                  <Row gap={12}>
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: RADIUS.pill,
                        background: 'var(--color-neutral-200)',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {dish.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700 }}>{dish.name}</div>
                      <Muted size={12}>
                        Costo {money2(metrics.costPerPortion)} · Precio {money(metrics.price)} · Utilidad{' '}
                        {metrics.grossProfit === null ? '—' : money(metrics.grossProfit)}
                      </Muted>
                    </div>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: SEMAPHORE_COLOR[semaphoreLevel(metrics.foodCostRounded)],
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {metrics.hasPrice ? pct(metrics.foodCost) : 'sin precio'}
                    </span>
                  </Row>
                </button>
              ))}
            </div>
          ) : query ? (
            <EmptyState
              title={`Nada se llama "${query}"`}
              body="Revisa cómo lo escribiste o limpia la búsqueda."
              action={<Button variant="secondary" height={44} onClick={() => setQuery('')}>Limpiar</Button>}
            />
          ) : state.dishes.length ? (
            <EmptyState
              title="Ningún platillo cae en ese filtro"
              body="Cambia el filtro de semáforo para ver el resto de tu carta."
            />
          ) : (
            <EmptyState
              title="Todavía no costeas nada"
              body="Empieza por tus platillos estrella: son los que van a mover tu venta."
              action={<Button height={44} onClick={onNewDish}>Costear mi primer platillo</Button>}
            />
          )}
        </>
      ) : null}

      {view === 'menu' ? (
        can.menu ? (
          <MenuKpis state={state} />
        ) : (
          <LockedView
            title="Mi Menú se abre con el pago único"
            body="Tu carta completa con food cost ponderado, utilidad promedio y la sugerencia de cómo acomodarla."
            onOpenPaywall={onOpenPaywall}
          />
        )
      ) : null}

      {view === 'subrecetas' ? <SubrecipeList state={state} onOpen={onOpenSubrecipe} onNew={onNewSubrecipe} /> : null}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card radius={RADIUS.inner} style={{ padding: 14 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19 }}>{value}</div>
      <Muted size={11} style={{ marginTop: 2 }}>
        {label}
      </Muted>
    </Card>
  );
}

function MenuKpis({ state }: { state: ProjectState }) {
  const aggregates = menuAggregates(state.dishes, { subrecipes: state.subrecipes });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
      <Kpi label="Platillos en la carta" value={String(aggregates.priced)} />
      <Kpi label="Ticket promedio" value={aggregates.averageTicket === null ? '—' : money(aggregates.averageTicket)} />
      <Kpi label="Food cost ponderado" value={pct(aggregates.weightedFoodCost)} />
      <Kpi
        label="Utilidad bruta promedio"
        value={aggregates.averageGrossProfit === null ? '—' : money(aggregates.averageGrossProfit)}
      />
    </div>
  );
}

function SubrecipeList({
  state,
  onOpen,
  onNew,
}: {
  state: ProjectState;
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  const ctx = { subrecipes: state.subrecipes };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
      {state.subrecipes.map((sub) => (
        <button
          key={sub.id}
          type="button"
          onClick={() => onOpen(sub.id)}
          style={{
            textAlign: 'left',
            border: 'none',
            background: 'var(--color-surface)',
            borderRadius: RADIUS.block,
            boxShadow: 'var(--shadow-sm)',
            padding: 14,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text)',
          }}
        >
          <Row gap={12}>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.pill,
                background: 'var(--color-accent-2-100)',
                color: 'var(--color-accent-2-700)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {sub.name.slice(0, 1).toUpperCase()}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{sub.name}</div>
              <Muted size={12}>
                Lote de {sub.yieldQty} {sub.unit} · {sub.ingredients.length} ingredientes
              </Muted>
              <Muted size={12}>
                Lote {money2(subrecipeBatchCost(sub, ctx))} · {money2(subrecipeUnitCost(sub, ctx))} por {sub.unit}
              </Muted>
            </div>
          </Row>
        </button>
      ))}
      <Button variant="success" onClick={onNew}>
        Nueva sub-receta
      </Button>
    </div>
  );
}

function LockedView({
  title,
  body,
  onOpenPaywall,
}: {
  title: string;
  body: string;
  onOpenPaywall: () => void;
}) {
  return (
    <Card style={{ background: 'var(--color-accent-100)' }}>
      <Row gap={10} align="flex-start">
        <Lock size={18} color="var(--color-accent-700)" strokeWidth={2.6} style={{ marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-accent-900)' }}>{title}</div>
          <Muted size={13} style={{ marginTop: 4 }}>
            {body}
          </Muted>
        </div>
      </Row>
      <div style={{ marginTop: 14 }}>
        <Button height={46} onClick={onOpenPaywall}>
          Desbloquear con un solo pago
        </Button>
      </div>
    </Card>
  );
}
