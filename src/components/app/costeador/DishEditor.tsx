'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  dishMetrics,
  ingredientCost,
  ingredientUnitPrice,
  nextFoodCostTarget,
  yieldPct,
} from '@/domain/costing';
import { semaphoreLevel, semaphoreNeedlePct, semaphoreVerdict, SEMAPHORE_LEGEND } from '@/domain/semaphore';
import { money, money2, parseNumber, pct } from '@/domain/format';
import { MENU_SECTIONS, POPULARITY_LABELS, type Dish, type Ingredient, type Popularity } from '@/domain/types';
import { UNIT_OPTIONS, type UnitCode } from '@/domain/units';
import type { ProjectState } from '@/domain/projectState';
import { Button, Card, H, InfoButton, Muted, Pill, RADIUS, Row, ScreenHeader, text } from '@/components/ui';

const SEMAPHORE_COLOR = {
  saludable: 'var(--color-accent-2-700)',
  revisar: 'var(--color-warn)',
  peligroso: 'var(--color-accent-800)',
  'sin-precio': 'var(--color-neutral-600)',
} as const;

const INFO: Record<string, [string, string]> = {
  costo: [
    'Costo por porción',
    'Es la suma de lo que te cuestan los ingredientes de UNA porción del platillo, tal como lo sirves, más condimentos, empaque y mano de obra.',
  ],
  foodCost: [
    'Food cost',
    'Tu costo por porción dividido entre el precio de venta sin IVA. Es el porcentaje de cada peso vendido que se va en insumos.',
  ],
  precio: ['Precio de venta', 'Lo que cobras al cliente. Si tu precio ya incluye IVA, el food cost se calcula sobre el precio sin IVA.'],
  utilidad: ['Utilidad bruta', 'Lo que te queda de cada porción después de pagar los insumos, antes de gastos fijos.'],
  sugerido: [
    'Precio sugerido',
    'El precio que necesitarías para alcanzar tu food cost objetivo con el costo actual. Úsalo como piso y luego compáralo con el mercado.',
  ],
  merma: ['Merma', 'Lo que se desperdicia al limpiar o porcionar. Si compras 1 kg y aprovechas 900 g, tu merma es 10%.'],
};

/** Detalle y editor del platillo (README § 1.7). */
export function DishEditor({
  dish,
  state,
  onBack,
  onChange,
  onDuplicate,
  onDelete,
  onPrint,
  onFlash,
}: {
  dish: Dish;
  state: ProjectState;
  onBack: () => void;
  onChange: (update: (dish: Dish) => Dish) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPrint: () => void;
  onFlash: (message: string) => void;
}) {
  const [openIngredient, setOpenIngredient] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [target, setTarget] = useState(state.fcTarget);
  const [showSubrecipePicker, setShowSubrecipePicker] = useState(false);

  const ctx = { subrecipes: state.subrecipes };
  const m = dishMetrics(dish, ctx, { targetFoodCost: target });
  const level = semaphoreLevel(m.foodCostRounded);

  const setField = <K extends keyof Dish>(key: K, value: Dish[K]) => onChange((d) => ({ ...d, [key]: value }));
  const setIngredient = (id: string, patch: Partial<Ingredient>) =>
    onChange((d) => ({
      ...d,
      ingredients: d.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));

  return (
    <div>
      <ScreenHeader
        title="Costeador de Platillos"
        subtitle="Calcula y define precios rentables"
        onBack={onBack}
        tone="accent"
        action={<InfoButton onClick={() => setInfo('foodCost')} />}
      />

      <div className="mrl-measure" style={{ padding: '16px 20px 32px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
        <Row gap={14}>
          <span
            style={{
              width: 54,
              height: 54,
              borderRadius: RADIUS.pill,
              background: 'var(--color-accent-100)',
              color: 'var(--color-accent-700)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {dish.name.slice(0, 1).toUpperCase()}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              value={dish.name}
              onChange={(e) => setField('name', e.target.value)}
              aria-label="Nombre del platillo"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 19,
                padding: 0,
              }}
            />
            <Muted size={12.5}>
              Porción estándar · {dish.ingredients.length} ingredientes
            </Muted>
          </div>
        </Row>

        <div>
          <H size={16}>Ingredientes</H>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            {dish.ingredients.map((ingredient) => {
              const open = openIngredient === ingredient.id;
              const unitPrice = ingredientUnitPrice(ingredient, ctx);
              const sub = ingredient.subrecipeId
                ? state.subrecipes.find((s) => s.id === ingredient.subrecipeId)
                : undefined;

              return (
                <Card key={ingredient.id} radius={RADIUS.block} style={{ padding: 12 }}>
                  <Row gap={10}>
                    <input
                      value={ingredient.name}
                      onChange={(e) => setIngredient(ingredient.id, { name: e.target.value })}
                      aria-label="Nombre del ingrediente"
                      style={{
                        flex: 1, minWidth: 0,
                        height: 44,
                        padding: '0 14px',
                        borderRadius: RADIUS.small,
                        border: 'none',
                        background: 'var(--color-neutral-200)',
                        fontSize: 16,
                      }}
                    />
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{money2(ingredientCost(ingredient, ctx))}</span>
                    <button
                      type="button"
                      onClick={() => setOpenIngredient(open ? null : ingredient.id)}
                      aria-label="Ver detalle"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}
                    >
                      <ChevronDown
                        size={18}
                        strokeWidth={2.6}
                        color={text(45)}
                        style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
                      />
                    </button>
                  </Row>
                  <Muted size={12} style={{ marginTop: 6 }}>
                    Cantidad: {ingredient.qty} {ingredient.unit} · Precio unitario: {money2(unitPrice)} por{' '}
                    {ingredient.unit}
                  </Muted>

                  {open ? (
                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10, animation: 'mrlUp .2s ease both' }}>
                      <NumberField
                        label="Cantidad que usas en la receta"
                        value={ingredient.qty}
                        onChange={(v) => setIngredient(ingredient.id, { qty: v })}
                      />
                      <SelectField
                        label="Unidad de medida"
                        value={ingredient.unit}
                        onChange={(v) => setIngredient(ingredient.id, { unit: v })}
                      />

                      {sub ? (
                        <Muted size={12.5} style={{ background: 'var(--color-accent-2-100)', padding: 12, borderRadius: RADIUS.small }}>
                          Sub-receta · costo tomado de tu receta base ({sub.name}).
                        </Muted>
                      ) : (
                        <>
                          <NumberField
                            label="Precio que pagas por la compra ($)"
                            value={ingredient.buyPrice ?? 0}
                            onChange={(v) => setIngredient(ingredient.id, { buyPrice: v })}
                          />
                          <NumberField
                            label="Cantidad que viene en esa compra"
                            value={ingredient.buyQty ?? 0}
                            onChange={(v) => setIngredient(ingredient.id, { buyQty: v })}
                          />
                          <SelectField
                            label="Unidad de medida de la compra"
                            value={ingredient.buyUnit ?? ingredient.unit}
                            onChange={(v) => setIngredient(ingredient.id, { buyUnit: v })}
                          />
                          <Row gap={8}>
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <NumberField
                                label="Merma: lo que se desperdicia (%)"
                                value={ingredient.waste ?? 0}
                                onChange={(v) => setIngredient(ingredient.id, { waste: v })}
                              />
                            </span>
                            <InfoButton onClick={() => setInfo('merma')} />
                          </Row>
                          <Muted size={12}>
                            Te queda {Math.round(yieldPct(ingredient.waste) * 100)}% aprovechable después de limpiar.
                          </Muted>
                          <Muted size={12}>
                            Precio unitario ya con la merma: {money2(unitPrice)} por {ingredient.unit}.
                          </Muted>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          onChange((d) => ({ ...d, ingredients: d.ingredients.filter((i) => i.id !== ingredient.id) }))
                        }
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
                        Eliminar ingrediente
                      </button>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>

          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            <Button
              variant="secondary"
              height={46}
              onClick={() =>
                onChange((d) => ({
                  ...d,
                  ingredients: [
                    ...d.ingredients,
                    { id: `i${Date.now()}`, name: 'Nuevo ingrediente', qty: 0, unit: 'g' as UnitCode, waste: 0 },
                  ],
                }))
              }
            >
              Agregar ingrediente
            </Button>
            <Button variant="secondary" height={46} onClick={() => setShowSubrecipePicker((v) => !v)}>
              + Agregar sub-receta (salsa, marinada, base)
            </Button>
            {showSubrecipePicker ? (
              <Card radius={RADIUS.block} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
                {state.subrecipes.length ? (
                  state.subrecipes.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        onChange((d) => ({
                          ...d,
                          ingredients: [
                            ...d.ingredients,
                            {
                              id: `i${Date.now()}`,
                              name: sub.name,
                              qty: 0,
                              unit: sub.unit,
                              subrecipeId: sub.id,
                            },
                          ],
                        }));
                        setShowSubrecipePicker(false);
                      }}
                      style={{
                        textAlign: 'left',
                        border: '1.5px solid var(--color-divider)',
                        borderRadius: RADIUS.pill,
                        background: 'transparent',
                        color: 'var(--color-text)',
                        padding: '12px 16px',
                        fontSize: 14,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {sub.name}
                    </button>
                  ))
                ) : (
                  <Muted size={13}>Todavía no tienes sub-recetas. Créalas desde la vista Sub-recetas.</Muted>
                )}
              </Card>
            ) : null}
          </div>
        </div>

        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
          <H size={16}>Rendimiento y extras</H>
          <NumberField label="Porciones que rinde" value={dish.portions ?? 1} onChange={(v) => setField('portions', v)} />
          <NumberField
            label="Condimentos y varios (%)"
            value={dish.extrasPct ?? 3}
            onChange={(v) => setField('extrasPct', v)}
          />
          <NumberField
            label="Empaque por porción ($)"
            value={dish.packaging ?? 0}
            onChange={(v) => setField('packaging', v)}
          />
          <NumberField label="Mano de obra por porción ($)" value={dish.labor ?? 0} onChange={(v) => setField('labor', v)} />

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>El precio ya incluye IVA</span>
            <input
              type="checkbox"
              checked={dish.priceIncludesTax ?? true}
              onChange={(e) => setField('priceIncludesTax', e.target.checked)}
              style={{ width: 22, height: 22 }}
            />
          </label>
          {dish.priceIncludesTax ?? true ? (
            <Muted size={12}>
              Precio sin IVA: {money2(m.netPrice)} · el food cost se calcula sobre este.
            </Muted>
          ) : null}
          <Muted size={12}>
            Ingredientes {money2(m.ingredientsCost)} / Varios {money2(m.extrasCost)}
          </Muted>
        </Card>

        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
          <H size={16}>Sección del menú</H>
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            {MENU_SECTIONS.map((section) => (
              <Pill key={section} selected={(dish.section ?? 'Fuertes') === section} onClick={() => setField('section', section)}>
                {section}
              </Pill>
            ))}
          </Row>
          <H size={16}>Qué tanto se vende</H>
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            {(Object.keys(POPULARITY_LABELS) as Popularity[]).map((popularity) => (
              <Pill
                key={popularity}
                selected={(dish.popularity ?? 'media') === popularity}
                onClick={() => setField('popularity', popularity)}
              >
                {POPULARITY_LABELS[popularity]}
              </Pill>
            ))}
          </Row>
        </Card>

        <div
          style={{
            margin: '10px 2px 1px',
            fontSize: 10.5,
            letterSpacing: '.09em',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--color-text-2)',
          }}
        >
          Lo que resulta
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <ResultCard label="Costo por porción" value={money2(m.costPerPortion)} onInfo={() => setInfo('costo')} />
          <ResultCard
            label="Food cost"
            value={pct(m.foodCost)}
            color={SEMAPHORE_COLOR[level]}
            onInfo={() => setInfo('foodCost')}
          />
          <Card radius={RADIUS.inner} style={{ padding: 14 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Muted size={11}>Precio de venta</Muted>
              <InfoButton onClick={() => setInfo('precio')} />
            </Row>
            <Row gap={6} style={{ marginTop: 4 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: text(55) }}>$</span>
              <input
                inputMode="decimal"
                value={dish.price || ''}
                onChange={(e) => setField('price', parseNumber(e.target.value))}
                aria-label="Precio de venta"
                placeholder="0"
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 19,
                  padding: 0,
                }}
              />
            </Row>
          </Card>
          <ResultCard
            label="Utilidad bruta"
            value={m.grossProfit === null ? '—' : money2(m.grossProfit)}
            hint={m.grossMargin === null ? undefined : `Margen ${pct(m.grossMargin)}`}
            onInfo={() => setInfo('utilidad')}
          />
        </div>

        <Card style={{ background: 'var(--color-accent-100)' }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <div>
              <Muted size={11.5} style={{ color: 'var(--color-accent-900)' }}>
                Precio sugerido
              </Muted>
              <H size={25} style={{ color: 'var(--color-accent-900)' }}>
                {money(m.suggestedPrice)}
              </H>
              <button
                type="button"
                onClick={() => setTarget((t) => nextFoodCostTarget(t))}
                style={{
                  marginTop: 4,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  color: 'var(--color-accent-700)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Food cost objetivo {target}% · cambiar
              </button>
            </div>
            <InfoButton onClick={() => setInfo('sugerido')} />
          </Row>
          <div style={{ marginTop: 12 }}>
            <Button
              height={44}
              onClick={() => {
                setField('price', Math.round(m.suggestedPrice));
                onFlash('Precio actualizado con tu food cost objetivo');
              }}
            >
              Usar precio
            </Button>
          </div>
        </Card>

        <Card>
          <H size={16}>Semáforo de rentabilidad</H>
          <div style={{ marginTop: 12, display: 'flex', height: 10, borderRadius: RADIUS.pill, overflow: 'hidden' }}>
            <span style={{ flex: 30, background: 'var(--color-accent-2-500)' }} />
            <span style={{ flex: 8, background: 'var(--color-warn)' }} />
            <span style={{ flex: 12, background: 'var(--color-accent)' }} />
          </div>
          <div
            style={{
              width: 0,
              height: 0,
              marginTop: 2,
              marginLeft: `calc(${semaphoreNeedlePct(m.foodCostRounded)}% - 6px)`,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: `8px solid ${m.hasPrice ? 'var(--color-text)' : 'var(--color-neutral-400)'}`,
              transition: 'margin-left .3s ease',
            }}
          />
          <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
            {SEMAPHORE_LEGEND.map((legend) => (
              <Muted key={legend} size={10.5}>
                {legend}
              </Muted>
            ))}
          </Row>
          <Muted size={13} style={{ marginTop: 10 }}>
            {semaphoreVerdict(m.foodCostRounded)}
          </Muted>
        </Card>

        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
          <H size={16}>Precio para apps de delivery</H>
          <H size={21}>{money(m.deliveryPrice)}</H>
          <NumberField
            label="Comisión que cobra la app (%)"
            value={dish.deliveryCommission ?? 28}
            onChange={(v) => setField('deliveryCommission', v)}
          />
          <Muted size={12}>
            Con esa comisión, este precio te deja el mismo neto que tu precio sugerido de mostrador.
          </Muted>
        </Card>

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
          }}
        >
          Ficha técnica para imprimir o PDF →
        </button>

        <Row gap={10}>
          <Button variant="secondary" height={48} onClick={onDuplicate}>
            Duplicar
          </Button>
          <Button
            height={48}
            onClick={() => {
              onFlash('Platillo guardado');
              onBack();
            }}
          >
            Guardar platillo
          </Button>
        </Row>

        <button
          type="button"
          onClick={onDelete}
          style={{
            border: 'none',
            background: 'transparent',
            color: text(45),
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          Eliminar este platillo
        </button>
      </div>

      {info ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 55,
            background: 'rgba(0,0,0,.35)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setInfo(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              borderRadius: `${RADIUS.sheet}px ${RADIUS.sheet}px 0 0`,
              padding: '22px 20px 28px',
              animation: 'mrlUp .22s ease both',
            }}
          >
            <H size={19}>{INFO[info][0]}</H>
            <Muted size={14} style={{ marginTop: 8 }}>
              {INFO[info][1]}
            </Muted>
            <div style={{ marginTop: 16 }}>
              <Button height={46} onClick={() => setInfo(null)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  // El valor se guarda como número pero NUNCA se reformatea mientras se escribe.
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: text(62), marginBottom: 6 }}>{label}</span>
      <input
        inputMode="decimal"
        value={draft ?? (value || value === 0 ? String(value) : '')}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange(parseNumber(e.target.value));
        }}
        onBlur={() => setDraft(null)}
        style={{
          width: '100%',
          height: 46,
          padding: '0 14px',
          borderRadius: RADIUS.pill,
          border: '1.5px solid var(--color-divider)',
          background: 'var(--color-surface)',
          fontSize: 16,
        }}
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: UnitCode;
  onChange: (value: UnitCode) => void;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: text(62), marginBottom: 6 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as UnitCode)}
        style={{
          width: '100%',
          height: 46,
          padding: '0 12px',
          borderRadius: RADIUS.pill,
          border: '1.5px solid var(--color-divider)',
          background: 'var(--color-surface)',
          fontSize: 16,
        }}
      >
        {UNIT_OPTIONS.map((unit) => (
          <option key={unit.code} value={unit.code}>
            {unit.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultCard({
  label,
  value,
  hint,
  color,
  onInfo,
}: {
  label: string;
  value: string;
  hint?: string;
  color?: string;
  onInfo: () => void;
}) {
  return (
    <Card radius={RADIUS.inner} style={{ padding: 14 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Muted size={11}>{label}</Muted>
        <InfoButton onClick={onInfo} />
      </Row>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, marginTop: 4, color }}>{value}</div>
      {hint ? <Muted size={11}>{hint}</Muted> : null}
    </Card>
  );
}
