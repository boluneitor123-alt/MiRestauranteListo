'use client';

import { ArrowRight } from 'lucide-react';
import {
  applyMenuAction,
  menuActionFlash,
  menuMoney,
  DAILY_MIX_OPTIONS,
  type MenuAction,
} from '@/domain/menu';
import { money } from '@/domain/format';
import type { ProjectState } from '@/domain/projectState';
import { Button, Card, H, Kicker, Muted, RADIUS, Row, text } from '@/components/ui';

/**
 * "Tu plan de acción" de Mi Menú (`menuMoney()` del prototipo).
 *
 * Es el momento en que la app deja de informar y empieza a recomendar: toma la
 * carta capturada, la proyecta sobre los platillos que el dueño espera vender
 * al día y lista los cambios ordenados por cuánto dinero mueve cada uno. Cada
 * botón aplica el cambio de verdad sobre el platillo.
 */
export function PlanDeAccion({
  state,
  onUpdate,
  onFlash,
}: {
  state: ProjectState;
  onUpdate: (fn: (s: ProjectState) => ProjectState) => void;
  onFlash: (message: string) => void;
}) {
  const plan = menuMoney(
    state.dishes,
    { subrecipes: state.subrecipes },
    { daily: state.dailyMix, ignored: state.ignoredActions },
  );

  if (!plan.ready) return null;

  const healthy = plan.weightedFoodCost <= 32;

  const aplicar = (action: MenuAction) => {
    onUpdate((s) => ({ ...s, dishes: applyMenuAction(s.dishes, action) }));
    onFlash(menuActionFlash(action));
  };

  const archivar = (action: MenuAction) => {
    onUpdate((s) => ({ ...s, ignoredActions: { ...s.ignoredActions, [action.key]: true } }));
    onFlash('Sugerencia archivada');
  };

  const reactivar = (action: MenuAction) => {
    onUpdate((s) => {
      const rest = { ...s.ignoredActions };
      delete rest[action.key];
      return { ...s, ignoredActions: rest };
    });
    onFlash('Sugerencia de vuelta en tu plan');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
      {/* Lo que deja la carta hoy, y lo que dejaría con los cambios. */}
      <div
        style={{
          padding: 20,
          borderRadius: RADIUS.card,
          background: 'var(--color-accent-2-600)',
          color: '#fff',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.8 }}>
          Tu carta hoy deja
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 34, lineHeight: 1.05 }}>
          {money(plan.monthly)}
        </div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>de utilidad bruta al mes</div>

        {plan.upside > 0 ? (
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid color-mix(in srgb, #fff 30%, transparent)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.8 }}>
                Con los cambios de abajo
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, lineHeight: 1.1 }}>
                {money(plan.monthlyAfter)}
              </div>
            </div>
            <span
              style={{
                padding: '7px 13px',
                borderRadius: RADIUS.pill,
                background: '#fff',
                color: 'var(--color-accent-2-900)',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              +{money(plan.upside)}
            </span>
          </div>
        ) : null}
      </div>

      {/* Food cost de toda la carta, ponderado por lo que se vende. */}
      <Card radius={RADIUS.block} style={{ padding: '15px 17px' }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <Kicker>Food cost de toda tu carta</Kicker>
            <div style={{ marginTop: 4 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: RADIUS.pill,
                  fontSize: 11,
                  fontWeight: 700,
                  background: healthy ? 'var(--color-accent-2-100)' : 'var(--color-accent-100)',
                  color: healthy ? 'var(--color-accent-2-800)' : 'var(--color-accent-800)',
                }}
              >
                {plan.weightedFoodCost}%
              </span>
            </div>
          </div>
          <p className="mrl-fc-read" style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: text(65) }}>
            {healthy ? 'Tu carta está en rango sano' : 'Tu carta está arriba del rango sano de 28 a 32%'}
          </p>
        </Row>
        <p className="mrl-prose" style={{ margin: '10px 0 0', fontSize: 11.8, lineHeight: 1.45, color: text(55) }}>
          Ponderado por lo que se vende, no promedio simple: un platillo caro de producir importa poco si nadie lo
          pide, y muchísimo si es el más pedido.
        </p>
      </Card>

      {/* Sobre cuántos platillos al día se proyecta todo lo de arriba. */}
      <Card radius={RADIUS.block} style={{ padding: '15px 17px' }}>
        <Kicker>Proyectado sobre</Kicker>
        <div style={{ fontWeight: 700, fontSize: 14, margin: '3px 0 9px' }}>{plan.daily} platillos al día</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {DAILY_MIX_OPTIONS.map((value) => {
            const on = plan.daily === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onUpdate((s) => ({ ...s, dailyMix: value }))}
                style={{
                  height: 44,
                  minWidth: 62,
                  padding: '0 16px',
                  borderRadius: RADIUS.pill,
                  border: on ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-divider)',
                  background: on ? 'var(--color-accent)' : 'transparent',
                  color: on ? 'var(--on-accent)' : 'var(--color-text)',
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                }}
                aria-pressed={on}
              >
                {value}
              </button>
            );
          })}
        </div>
        <p className="mrl-prose" style={{ margin: '9px 0 0', fontSize: 11.8, lineHeight: 1.45, color: text(55) }}>
          Ajústalo a lo que esperas vender. Los montos de arriba y el plan de abajo se recalculan solos.
        </p>
      </Card>

      {plan.actions.length ? (
        <div style={{ marginTop: 10 }}>
          <H size={19}>Tu plan de acción</H>
          <p className="mrl-prose" style={{ margin: '4px 0 10px', fontSize: 12.5, lineHeight: 1.45, color: text(60) }}>
            Ordenado por cuánto dinero mueve cada cambio. Empieza por el primero.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
            {plan.actions.map((action, i) => (
              <Card key={action.key} radius={RADIUS.card} style={{ padding: '16px 17px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      flex: 'none',
                      borderRadius: '50%',
                      background: 'var(--color-accent)',
                      color: 'var(--on-accent)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: RADIUS.pill,
                      background: 'var(--color-neutral-200)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '.02em',
                    }}
                  >
                    {action.kind}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--color-accent-2-800)',
                    }}
                  >
                    +{money(action.impact)} al mes
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, lineHeight: 1.15 }}>{action.title}</div>
                <p className="mrl-prose" style={{ margin: '6px 0 12px', fontSize: 12.8, lineHeight: 1.5, color: text(70) }}>
                  {action.body}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button height={44} style={{ flex: 1, minWidth: 160, fontSize: 14 }} onClick={() => aplicar(action)}>
                    {action.cta}
                  </Button>
                  <Button
                    variant="secondary"
                    height={44}
                    style={{ paddingInline: 15, fontSize: 13 }}
                    onClick={() => archivar(action)}
                  >
                    No, gracias
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {plan.archived.length ? (
        <div style={{ marginTop: 4, padding: '16px 17px', borderRadius: RADIUS.block, background: 'var(--color-neutral-200)' }}>
          <Row style={{ alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 13, flex: 1, minWidth: 0 }}>
              {plan.archived.length} {plan.archived.length === 1 ? 'sugerencia archivada' : 'sugerencias archivadas'}
            </span>
            <Button
              variant="ghost"
              height={44}
              style={{ paddingInline: 13, fontSize: 12.5 }}
              onClick={() => {
                onUpdate((s) => ({ ...s, ignoredActions: {} }));
                onFlash('Restauramos todas las sugerencias');
              }}
            >
              Restaurar todas
            </Button>
          </Row>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            {plan.archived.map((action) => (
              <div
                key={action.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 13px',
                  borderRadius: RADIUS.small,
                  background: 'var(--color-neutral-100)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.8, fontWeight: 700 }}>{action.title}</div>
                  <Muted size={11.5} style={{ marginTop: 1 }}>
                    {action.kind} · +{money(action.impact)} al mes
                  </Muted>
                </div>
                <Button
                  variant="ghost"
                  height={44}
                  style={{ paddingInline: 13, fontSize: 12.5 }}
                  onClick={() => reactivar(action)}
                >
                  Reactivar
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {plan.actions.length === 0 ? (
        <div style={{ padding: '18px 20px', borderRadius: RADIUS.card, background: 'var(--color-accent-2-100)' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-accent-2-900)' }}>
            Tu carta no tiene fugas grandes
          </div>
          <p
            className="mrl-prose"
            style={{ margin: '6px 0 0', fontSize: 12.8, lineHeight: 1.5, color: 'var(--color-accent-2-900)' }}
          >
            Todos tus platillos están en rango y los rentables ya son los que más se venden. Vuelve a revisar cuando
            cambien tus precios de compra.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** El renglón que anuncia el potencial arriba de la lista de platillos. */
export function PlanTeaser({ state, onOpen }: { state: ProjectState; onOpen: () => void }) {
  const plan = menuMoney(
    state.dishes,
    { subrecipes: state.subrecipes },
    { daily: state.dailyMix, ignored: state.ignoredActions },
  );
  if (!plan.ready || plan.upside <= 0) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        minHeight: 44,
        padding: '13px 15px',
        borderRadius: RADIUS.block,
        border: 'none',
        background: 'var(--color-accent-2-100)',
        color: 'var(--color-accent-2-900)',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 800, fontSize: 13.5 }}>
          Tu carta puede dejar +{money(plan.upside)} al mes
        </span>
        <span style={{ display: 'block', fontSize: 12, marginTop: 1 }}>
          {plan.actions.length === 1 ? 'Hay 1 cambio' : `Hay ${plan.actions.length} cambios`} en tu plan de acción.
        </span>
      </span>
      <ArrowRight size={18} strokeWidth={2.6} style={{ flex: 'none' }} />
    </button>
  );
}
