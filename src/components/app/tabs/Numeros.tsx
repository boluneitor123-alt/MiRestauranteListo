'use client';

import { useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { breakeven, conceptTotal, fixedExpensesTotal, investment, type Subconcept } from '@/domain/finance';
import { money } from '@/domain/format';
import { menuAggregates } from '@/domain/aggregates';
import type { Capabilities } from '@/domain/access';
import type { ProjectState } from '@/domain/projectState';
import { Button, Card, Field, H, Muted, ProgressBar, RADIUS, Row, ScreenHeader, Switch, text } from '@/components/ui';
import { NumberField } from '../costeador/DishEditor';

export type NumbersView = 'home' | 'presupuesto' | 'fijos' | 'equilibrio';

/** Números: inversión, gastos fijos y punto de equilibrio (README § 1.8). */
export function Numeros({
  state,
  view,
  can,
  formOpen,
  onChangeView,
  onPatch,
  onOpenPaywall,
  onPrint,
  onFlash,
}: {
  state: ProjectState;
  view: NumbersView;
  can: Capabilities;
  formOpen: boolean;
  onChangeView: (view: NumbersView) => void;
  onPatch: (patch: Partial<ProjectState>) => void;
  onOpenPaywall: () => void;
  onPrint: () => void;
  onFlash: (message: string) => void;
}) {
  if (view === 'presupuesto') {
    return can.budget ? (
      <Budget state={state} formOpen={formOpen} onBack={() => onChangeView('home')} onPatch={onPatch} onFlash={onFlash} />
    ) : (
      <LockedModule
        title="Presupuesto de apertura"
        body="13 conceptos con subconceptos para saber exactamente cuánto necesitas para abrir y si cabe en tu presupuesto."
        onBack={() => onChangeView('home')}
        onOpenPaywall={onOpenPaywall}
      />
    );
  }

  if (view === 'fijos') {
    return <FixedExpenses state={state} onBack={() => onChangeView('home')} onPatch={onPatch} />;
  }

  if (view === 'equilibrio') {
    return <Breakeven state={state} onBack={() => onChangeView('home')} onPatch={onPatch} />;
  }

  const fixed = fixedExpensesTotal(state.fixed);
  const be = breakeven({
    fixedExpenses: fixed,
    grossMargin: state.margin,
    ticket: state.ticket,
    ownerGoal: state.ownerGoal,
    hours: state.hours,
    closedOneDay: state.closedOneDay,
  });
  const invest = investment({
    concepts: state.budget,
    subconcepts: state.budgetSub,
    budgetCap: state.project.budgetCap,
  });

  return (
    <div className="mrl-measure" style={{ padding: '18px 20px', display: 'grid', gap: 14 }}>
      <H size={25}>Números</H>

      <ModuleCard
        title="Presupuesto de apertura"
        value={can.showsInvestmentFigures ? money(invest.total) : 'Con el pago único'}
        hint={
          can.showsInvestmentFigures
            ? '13 conceptos, con subconceptos y fondo de emergencia'
            : '13 conceptos y subconceptos · se abre con el pago único'
        }
        locked={!can.budget}
        onClick={() => (can.budget ? onChangeView('presupuesto') : onOpenPaywall())}
      />
      <ModuleCard
        title="Gastos fijos mensuales"
        value={money(fixed)}
        hint={`≈ ${money(be.fixedPerDay)} por día de operación`}
        onClick={() => onChangeView('fijos')}
      />
      <ModuleCard
        title="Punto de equilibrio"
        value={money(be.dailySales)}
        hint={`${be.ticketsPerDay} tickets al día para no perder`}
        onClick={() => onChangeView('equilibrio')}
      />

      <button
        type="button"
        onClick={onPrint}
        style={{
          border: 'none',
          background: 'transparent',
          color: 'var(--color-accent-700)',
          fontWeight: 800,
          fontSize: 13.5,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          textAlign: 'left',
        }}
      >
        Resumen financiero para imprimir o PDF →
      </button>
    </div>
  );
}

function ModuleCard({
  title,
  value,
  hint,
  locked,
  onClick,
}: {
  title: string;
  value: string;
  hint: string;
  locked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        border: 'none',
        background: 'var(--color-surface)',
        borderRadius: RADIUS.card,
        boxShadow: 'var(--shadow-sm)',
        padding: 18,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text)',
      }}
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <H size={17}>{title}</H>
        {locked ? <Lock size={16} color={text(45)} strokeWidth={2.6} /> : null}
      </Row>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 25, marginTop: 6 }}>{value}</div>
      <Muted size={12.5} style={{ marginTop: 4 }}>
        {hint}
      </Muted>
    </button>
  );
}

function LockedModule({
  title,
  body,
  onBack,
  onOpenPaywall,
}: {
  title: string;
  body: string;
  onBack: () => void;
  onOpenPaywall: () => void;
}) {
  return (
    <div>
      <ScreenHeader title={title} onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px' }}>
        <Card style={{ background: 'var(--color-accent-100)' }}>
          <Row gap={10} align="flex-start">
            <Lock size={18} color="var(--color-accent-700)" strokeWidth={2.6} style={{ marginTop: 2 }} />
            <Muted size={13.5} style={{ color: 'var(--color-accent-900)' }}>
              {body}
            </Muted>
          </Row>
          <div style={{ marginTop: 14 }}>
            <Button height={46} onClick={onOpenPaywall}>
              Desbloquear con un solo pago
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Budget({
  state,
  formOpen,
  onBack,
  onPatch,
  onFlash,
}: {
  state: ProjectState;
  formOpen: boolean;
  onBack: () => void;
  onPatch: (patch: Partial<ProjectState>) => void;
  onFlash: (message: string) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(formOpen);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  const result = investment({
    concepts: state.budget,
    subconcepts: state.budgetSub,
    budgetCap: state.project.budgetCap,
  });

  const setAmountFor = (key: string, value: number) =>
    onPatch({ budget: state.budget.map((c) => (c.key === key ? { ...c, amount: value } : c)) });

  const setSubconcepts = (key: string, subs: Subconcept[]) =>
    onPatch({ budgetSub: { ...state.budgetSub, [key]: subs } });

  return (
    <div>
      <ScreenHeader title="Presupuesto de apertura" subtitle="Cuánto necesitas para abrir" onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gap: 14 }}>
        <div
          style={{
            borderRadius: RADIUS.card,
            padding: 20,
            color: 'var(--color-bg)',
            boxShadow: 'var(--shadow-md)',
            background: result.exceeded ? 'var(--color-accent-700)' : 'var(--color-accent-2-600)',
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.9 }}>Total estimado</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 30, marginTop: 4 }}>{money(result.total)}</div>
          <div style={{ fontSize: 12.5, marginTop: 4, opacity: 0.9 }}>
            Presupuesto: {money(result.budgetCap)}
          </div>
          <div style={{ height: 6, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,.3)', marginTop: 12 }}>
            <div
              style={{
                width: `${result.usedPct}%`,
                height: '100%',
                borderRadius: RADIUS.pill,
                background: 'var(--color-bg)',
                transition: 'width .3s ease',
              }}
            />
          </div>
          <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700 }}>
            {result.exceeded
              ? `Estás ${money(Math.abs(result.difference))} arriba de tu presupuesto. Recorta o consigue más capital.`
              : `Te quedan ${money(result.difference)} de margen.`}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {state.budget.map((concept) => {
            const subs = state.budgetSub[concept.key] ?? [];
            const total = conceptTotal(concept.amount, subs);
            const isOpen = open === concept.key;

            return (
              <Card key={concept.key} radius={RADIUS.block} style={{ padding: 14 }}>
                <Row gap={10}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : concept.key)}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-text)',
                      fontSize: 14.5,
                      fontWeight: 700,
                    }}
                  >
                    {concept.label}
                  </button>
                  {subs.length ? (
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{money(total)}</span>
                  ) : (
                    <Row gap={4}>
                      <span style={{ fontSize: 14, color: text(50) }}>$</span>
                      <input
                        inputMode="decimal"
                        value={concept.amount || ''}
                        onChange={(e) => setAmountFor(concept.key, Number(e.target.value.replace(/[^0-9.]/g, '')) || 0)}
                        aria-label={concept.label}
                        placeholder="0"
                        style={{
                          width: 92,
                          height: 40,
                          textAlign: 'right',
                          padding: '0 10px',
                          borderRadius: RADIUS.pill,
                          border: '1.5px solid var(--color-divider)',
                          background: 'var(--color-surface)',
                          fontSize: 16,
                        }}
                      />
                    </Row>
                  )}
                  <ChevronDown
                    size={17}
                    strokeWidth={2.6}
                    color={text(45)}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
                  />
                </Row>

                {isOpen ? (
                  <div style={{ marginTop: 12, display: 'grid', gap: 8, animation: 'mrlUp .2s ease both' }}>
                    {subs.map((sub) => (
                      <Row key={sub.id} gap={8}>
                        <input
                          value={sub.label}
                          onChange={(e) =>
                            setSubconcepts(
                              concept.key,
                              subs.map((s) => (s.id === sub.id ? { ...s, label: e.target.value } : s)),
                            )
                          }
                          aria-label="Nombre del subconcepto"
                          style={{
                            flex: 1,
                            height: 42,
                            padding: '0 12px',
                            borderRadius: RADIUS.small,
                            border: 'none',
                            background: 'var(--color-neutral-200)',
                            fontSize: 16,
                          }}
                        />
                        <input
                          inputMode="decimal"
                          value={sub.amount || ''}
                          onChange={(e) =>
                            setSubconcepts(
                              concept.key,
                              subs.map((s) =>
                                s.id === sub.id ? { ...s, amount: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 } : s,
                              ),
                            )
                          }
                          aria-label="Monto del subconcepto"
                          style={{
                            width: 92,
                            height: 42,
                            textAlign: 'right',
                            padding: '0 10px',
                            borderRadius: RADIUS.small,
                            border: 'none',
                            background: 'var(--color-neutral-200)',
                            fontSize: 16,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setSubconcepts(concept.key, subs.filter((s) => s.id !== sub.id))}
                          aria-label="Eliminar subconcepto"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: text(45),
                            cursor: 'pointer',
                            fontSize: 18,
                          }}
                        >
                          ×
                        </button>
                      </Row>
                    ))}
                    <Button
                      variant="secondary"
                      height={42}
                      onClick={() =>
                        setSubconcepts(concept.key, [
                          ...subs,
                          { id: `s${Date.now()}`, label: 'Nueva parte', amount: 0 },
                        ])
                      }
                    >
                      Agregar subconcepto
                    </Button>
                    {subs.length ? (
                      <Muted size={12}>
                        Con subconceptos, el monto del concepto se calcula sumándolos.
                      </Muted>
                    ) : null}
                    {concept.custom ? (
                      <button
                        type="button"
                        onClick={() => onPatch({ budget: state.budget.filter((c) => c.key !== concept.key) })}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--color-accent-700)',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          textAlign: 'left',
                        }}
                      >
                        Eliminar este concepto
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>

        {showForm ? (
          <Card style={{ display: 'grid', gap: 12 }}>
            <H size={16}>Agregar otro concepto</H>
            <Field label="Nombre del concepto" value={label} onChange={setLabel} placeholder="Ej. Letrero luminoso" />
            <Field label="Monto" prefix="$" value={amount} onChange={setAmount} inputMode="decimal" placeholder="0" />
            <Row gap={10}>
              <Button variant="secondary" height={44} onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button
                height={44}
                disabled={!label.trim()}
                onClick={() => {
                  onPatch({
                    budget: [
                      ...state.budget,
                      {
                        key: `x${Date.now()}`,
                        label: label.trim(),
                        amount: Number(amount.replace(/[^0-9.]/g, '')) || 0,
                        custom: true,
                      },
                    ],
                  });
                  setLabel('');
                  setAmount('');
                  setShowForm(false);
                  onFlash('Concepto agregado');
                }}
              >
                Agregar
              </Button>
            </Row>
          </Card>
        ) : (
          <Button variant="secondary" height={46} onClick={() => setShowForm(true)}>
            Agregar otro concepto
          </Button>
        )}

        <Muted size={12.5}>
          Consejo: deja al menos 10% del total ({money(result.suggestedEmergencyFund)}) como fondo de emergencia. Los
          primeros tres meses casi nunca venden lo proyectado.
        </Muted>
      </div>
    </div>
  );
}

function FixedExpenses({
  state,
  onBack,
  onPatch,
}: {
  state: ProjectState;
  onBack: () => void;
  onPatch: (patch: Partial<ProjectState>) => void;
}) {
  const total = fixedExpensesTotal(state.fixed);
  const perDay = total / 30;

  return (
    <div>
      <ScreenHeader title="Gastos fijos mensuales" subtitle="Se pagan vendas o no" onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gap: 14 }}>
        <div
          style={{
            borderRadius: RADIUS.card,
            padding: 20,
            background: 'var(--color-accent-2-600)',
            color: 'var(--color-bg)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.9 }}>Total mensual</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 30, marginTop: 4 }}>{money(total)}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>≈ {money(perDay)} por día de operación</div>
        </div>

        <Card style={{ display: 'grid', gap: 10 }}>
          {state.fixed.map((concept) => (
            <Row key={concept.key} gap={10}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{concept.label}</span>
              <span style={{ fontSize: 14, color: text(50) }}>$</span>
              <input
                inputMode="decimal"
                value={concept.amount || ''}
                onChange={(e) =>
                  onPatch({
                    fixed: state.fixed.map((c) =>
                      c.key === concept.key ? { ...c, amount: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 } : c,
                    ),
                  })
                }
                aria-label={concept.label}
                placeholder="0"
                style={{
                  width: 92,
                  height: 42,
                  textAlign: 'right',
                  padding: '0 10px',
                  borderRadius: RADIUS.pill,
                  border: '1.5px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                  fontSize: 16,
                }}
              />
            </Row>
          ))}
        </Card>
      </div>
    </div>
  );
}

function Breakeven({
  state,
  onBack,
  onPatch,
}: {
  state: ProjectState;
  onBack: () => void;
  onPatch: (patch: Partial<ProjectState>) => void;
}) {
  const fixed = fixedExpensesTotal(state.fixed);
  const be = breakeven({
    fixedExpenses: fixed,
    grossMargin: state.margin,
    ticket: state.ticket,
    ownerGoal: state.ownerGoal,
    hours: state.hours,
    closedOneDay: state.closedOneDay,
  });
  const suggested = menuAggregates(state.dishes, { subrecipes: state.subrecipes }).suggestedMargin;

  return (
    <div>
      <ScreenHeader title="Punto de equilibrio" subtitle="Cuánto tienes que vender" onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gap: 14 }}>
        <div
          style={{
            borderRadius: RADIUS.card,
            padding: 20,
            background: 'var(--color-accent)',
            color: '#fff',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.92 }}>
            Gastos fijos: {money(fixed)} al mes. Se pagan abras o no, vendas o no.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.85 }}>Para no perder</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, lineHeight: 1.05, marginTop: 2 }}>
                {money(be.dailySales)}
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.9 }}>al día · {be.ticketsPerDay} tickets al día</div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.85 }}>
                Para ganar {money(state.ownerGoal)}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, lineHeight: 1.05, marginTop: 2 }}>
                {money(be.goalDailySales)}
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.9 }}>al día · {be.goalTicketsPerDay} tickets al día</div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12.5, opacity: 0.9 }}>
            {be.goalTicketsPerDay} tickets al día ≈ un cliente cada {be.minutesBetweenCustomers} minutos, en un turno de{' '}
            {state.hours} horas.
          </div>
          <div style={{ marginTop: 8, fontSize: 12.5, opacity: 0.85 }}>
            Al mes: {money(be.monthlySales)} para no perder · {money(be.goalMonthlySales)} para tu meta.
          </div>
        </div>

        <Card style={{ display: 'grid', gap: 14 }}>
          <NumberField
            label="¿Cuánto quieres ganar tú al mes?"
            value={state.ownerGoal}
            onChange={(v) => onPatch({ ownerGoal: v })}
          />
          <NumberField
            label="Horas de operación al día"
            value={state.hours}
            onChange={(v) => onPatch({ hours: Math.max(1, Math.min(24, v || 8)) })}
          />
          <Switch
            label="Cierro un día a la semana"
            checked={state.closedOneDay}
            onChange={(v) => onPatch({ closedOneDay: v })}
          />
          <Muted size={12}>
            {state.closedOneDay
              ? `Cerrar un día sube tu venta diaria de ${money(be.dailyAt30Days)} a ${money(be.dailyAt26Days)}.`
              : `${be.days} días de venta al mes.`}
          </Muted>

          <div>
            <Row style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: text(62) }}>Ticket promedio</span>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{money(state.ticket)}</span>
            </Row>
            <input
              type="range"
              min={80}
              max={400}
              step={5}
              value={state.ticket}
              onChange={(e) => onPatch({ ticket: Number(e.target.value) })}
              style={{ width: '100%', marginTop: 8, accentColor: 'var(--color-accent)' }}
            />
          </div>

          <div>
            <Row style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: text(62) }}>Margen bruto</span>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{state.margin}%</span>
            </Row>
            <input
              type="range"
              min={40}
              max={85}
              value={state.margin}
              onChange={(e) => onPatch({ margin: Number(e.target.value) })}
              style={{ width: '100%', marginTop: 8, accentColor: 'var(--color-accent)' }}
            />
            {suggested !== null ? <Muted size={12}>Tu costeador sugiere {suggested}%.</Muted> : null}
          </div>

          <div>
            <ProgressBar pct={Math.min(100, (be.dailySales / Math.max(1, be.goalDailySales)) * 100)} />
            <Muted size={11.5} style={{ marginTop: 6 }}>
              De tu venta diaria objetivo, esta parte se va sólo en cubrir gastos fijos.
            </Muted>
          </div>
        </Card>
      </div>
    </div>
  );
}
