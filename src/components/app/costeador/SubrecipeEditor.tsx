'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ingredientCost, ingredientUnitPrice, subrecipeBatchCost, subrecipeUnitCost, yieldPct } from '@/domain/costing';
import { money2 } from '@/domain/format';
import type { Ingredient, Subrecipe } from '@/domain/types';
import type { UnitCode } from '@/domain/units';
import { Button, Card, H, Muted, RADIUS, Row, ScreenHeader, text } from '@/components/ui';
import { NumberField, SelectField } from './DishEditor';

/** Editor de sub-receta por lote (README § 1.7). */
export function SubrecipeEditor({
  subrecipe,
  subrecipes,
  onBack,
  onChange,
  onDelete,
  onFlash,
}: {
  subrecipe: Subrecipe;
  subrecipes: readonly Subrecipe[];
  onBack: () => void;
  onChange: (update: (sub: Subrecipe) => Subrecipe) => void;
  onDelete: () => void;
  onFlash: (message: string) => void;
}) {
  const [openIngredient, setOpenIngredient] = useState<string | null>(null);
  const ctx = { subrecipes };
  const batch = subrecipeBatchCost(subrecipe, ctx);
  const perUnit = subrecipeUnitCost(subrecipe, ctx);

  const setIngredient = (id: string, patch: Partial<Ingredient>) =>
    onChange((s) => ({ ...s, ingredients: s.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));

  return (
    <div>
      <ScreenHeader
        title="Sub-receta"
        subtitle="Costea el lote una vez y úsalo en tus platillos"
        onBack={onBack}
        tone="success"
      />

      <div className="mrl-measure" style={{ padding: '16px 20px 32px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: text(62), marginBottom: 6 }}>
              Nombre
            </span>
            <input
              value={subrecipe.name}
              onChange={(e) => onChange((s) => ({ ...s, name: e.target.value }))}
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
          <NumberField
            label="Cantidad que rinde el lote"
            value={subrecipe.yieldQty}
            onChange={(v) => onChange((s) => ({ ...s, yieldQty: v }))}
          />
          <SelectField
            label="Unidad del lote"
            value={subrecipe.unit}
            onChange={(v: UnitCode) => onChange((s) => ({ ...s, unit: v }))}
          />
        </Card>

        <div>
          <H size={16}>Ingredientes del lote</H>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            {subrecipe.ingredients.map((ingredient) => {
              const open = openIngredient === ingredient.id;
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
                    Cantidad: {ingredient.qty} {ingredient.unit} · Precio unitario:{' '}
                    {money2(ingredientUnitPrice(ingredient, ctx))} por {ingredient.unit}
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
                      <NumberField
                        label="Merma: lo que se desperdicia (%)"
                        value={ingredient.waste ?? 0}
                        onChange={(v) => setIngredient(ingredient.id, { waste: v })}
                      />
                      <Muted size={12}>
                        Te queda {Math.round(yieldPct(ingredient.waste) * 100)}% aprovechable después de limpiar.
                      </Muted>
                      <button
                        type="button"
                        onClick={() =>
                          onChange((s) => ({ ...s, ingredients: s.ingredients.filter((i) => i.id !== ingredient.id) }))
                        }
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--color-accent-800)',
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

          <div style={{ marginTop: 10 }}>
            <Button
              variant="secondary"
              height={46}
              onClick={() =>
                onChange((s) => ({
                  ...s,
                  ingredients: [
                    ...s.ingredients,
                    { id: `i${Date.now()}`, name: 'Nuevo ingrediente', qty: 0, unit: 'g', waste: 0 },
                  ],
                }))
              }
            >
              Agregar ingrediente
            </Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <Card radius={RADIUS.inner} style={{ padding: 16 }}>
            <Muted size={11}>Costo del lote</Muted>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, marginTop: 4 }}>{money2(batch)}</div>
          </Card>
          <Card radius={RADIUS.inner} style={{ padding: 16 }}>
            <Muted size={11}>Costo por {subrecipe.unit}</Muted>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, marginTop: 4 }}>{money2(perUnit)}</div>
          </Card>
        </div>

        <Button
          variant="success"
          onClick={() => {
            onFlash('Sub-receta guardada');
            onBack();
          }}
        >
          Guardar sub-receta
        </Button>

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
          Eliminar esta sub-receta
        </button>
      </div>
    </div>
  );
}
