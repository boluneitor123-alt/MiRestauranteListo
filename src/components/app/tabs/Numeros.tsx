'use client';

import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, FileText, Lock } from 'lucide-react';
import { breakeven, conceptTotal, fixedExpensesTotal, investment, type Subconcept } from '@/domain/finance';
import { money } from '@/domain/format';
import { menuAggregates } from '@/domain/aggregates';
import { alcanceDe, type AccessLevel, type Capabilities } from '@/domain/access';
import { SoloLectura } from '@/components/app/SoloLectura';
import { AvisoDeEstimado } from '@/components/app/EtiquetaEstimado';
import type { ProjectState } from '@/domain/projectState';
import { Button, Card, Field, H, Muted, ProgressBar, RADIUS, Row, ScreenHeader, Switch, text } from '@/components/ui';
import { NumberField } from '../costeador/DishEditor';
import { Afinacion } from '../numeros/Afinacion';
import { BUDGET_CONCEPTS } from '@/content/catalog';
import { titularDeEquilibrio } from '@/domain/titular';
import { keyResults, type KeyResult } from '@/components/app/inicio/ResultadosClave';
import { FraseDeNumeros } from '../numeros/FraseDeNumeros';
import { PestanasDeNumeros } from '../numeros/PestanasDeNumeros';
import { Chrome } from '../inicio/Chrome';
import { Encabezado } from '../inicio/Encabezado';

/**
 * El presupuesto que se enseña durante la prueba: los 13 conceptos de una
 * cafetería real, con sus montos. Sale del prototipo, no está inventado.
 */
const EXAMPLE_BUDGET = BUDGET_CONCEPTS;
const EXAMPLE_BUDGET_CAP = 250000;


/**
 * Las cuatro vistas de Números.
 *
 * Se fueron «Prueba de estrés» y «Revisión de realidad»: dos módulos que
 * pedían capturar más para decir algo, en una pantalla cuyo trabajo es
 * contestar «¿esto me va a dar de comer?». Lo que la persona capturó ahí
 * —lugares, pedidos por hora, horas semanales— sigue guardado; sólo dejó de
 * tener pantalla.
 */
export type NumbersView = 'home' | 'presupuesto' | 'fijos' | 'equilibrio';

/** Números: inversión, gastos fijos y punto de equilibrio (README § 1.8). */
export function Numeros({
  state,
  view,
  level,
  can,
  formOpen,
  onChangeView,
  onPatch,
  onOpenPaywall,
  onPrint,
  onFlash,
  onOpenProfile,
  onOpenAlerts,
  onOpenProject,
  hasAlerts,
}: {
  state: ProjectState;
  view: NumbersView;
  level: AccessLevel;
  can: Capabilities;
  formOpen: boolean;
  onChangeView: (view: NumbersView) => void;
  onPatch: (patch: Partial<ProjectState>) => void;
  onOpenPaywall: () => void;
  onPrint: () => void;
  onFlash: (message: string) => void;
  onOpenProfile: () => void;
  onOpenAlerts: () => void;
  /** Abre los datos del proyecto desde el rótulo del encabezado. */
  onOpenProject: () => void;
  /** Hay una alerta que merece el punto naranja de la campana. */
  hasAlerts: boolean;
}) {
  /** Cuántos valores de ese grupo siguen siendo estimación. */
  const estimadosDe = (grupo: string) => state.estimados.filter((r) => r.startsWith(`${grupo}:`)).length;
  const sello = state.selloEstimado ?? '';

  /*
    Las pestañas viven en las cuatro vistas, no sólo en el Resumen. Si sólo
    salieran ahí serían una fila de accesos directos: entras a Presupuesto,
    desaparecen, y para ver Gastos fijos hay que volver atrás. Son pestañas
    porque se quedan.
  */
  const pestanas = (
    <div style={{ padding: '0 20px 4px' }}>
      <PestanasDeNumeros activa={view} onCambiar={onChangeView} />
    </div>
  );

  if (view === 'presupuesto') {
    // Durante la prueba el presupuesto NO lleva candado: se ve completo, con
    // los 13 conceptos de un caso real, y sólo no se puede editar. Es el
    // bloqueo que mejor convierte y por eso se muestra en vez de esconderse.
    return (
      <>
      {pestanas}
      <div style={{ padding: '0 20px' }}>
        <AvisoDeEstimado sello={sello} cuantos={estimadosDe('presupuesto')} />
      </div>
      <Budget
        state={state}
        formOpen={formOpen}
        readOnly={can.alcances['numeros:presupuesto'] !== 'abierto'}
        onBack={() => onChangeView('home')}
        onPatch={onPatch}
        onFlash={onFlash}
        onOpenPaywall={onOpenPaywall}
      />
      </>
    );
  }

  if (view === 'fijos') {
    return (
      <>
      {/*
        Las pestañas van FUERA del bloque de sólo lectura. Dentro caían en el
        subárbol `inert`, que quita clics y foco de teclado: en prueba, entrar
        a Gastos fijos dejaba a la persona sin poder volver a las otras vistas
        más que con el botón de atrás.
      */}
      {pestanas}
      <SoloLectura
        activo={alcanceDe(level, 'numeros:fijos') !== 'abierto'}
        level={level}
        onOpenPaywall={onOpenPaywall}
      >
        <>
          <div style={{ padding: '0 20px' }}>
            <AvisoDeEstimado sello={sello} cuantos={estimadosDe('fijos')} />
          </div>
          <FixedExpenses state={state} onBack={() => onChangeView('home')} onPatch={onPatch} />
        </>
      </SoloLectura>
      </>
    );
  }

  if (view === 'equilibrio') {
    return (
      <>
      {pestanas}
      <SoloLectura
        activo={alcanceDe(level, 'numeros:equilibrio') !== 'abierto'}
        level={level}
        onOpenPaywall={onOpenPaywall}
      >
        <Breakeven state={state} onBack={() => onChangeView('home')} onPatch={onPatch} />
      </SoloLectura>
      </>
    );
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

  /*
    La misma entrada con la que Inicio arma su franja: las dos pantallas leen
    la frase del mismo cálculo y no pueden decir cifras distintas.
  */
  const entradaDelTitular = {
    fixedExpenses: fixed,
    grossMargin: state.margin,
    ticket: state.ticket,
    ownerGoal: state.ownerGoal,
    hours: state.hours,
    closedOneDay: state.closedOneDay,
  };

  return (
    <div className="mrl-measure" style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
      <Chrome
        initial={(state.profile.name || 'T').trim().slice(0, 1).toUpperCase()}
        hasAlerts={hasAlerts}
        onOpenAlerts={onOpenAlerts}
        onOpenProfile={onOpenProfile}
      />

      <Encabezado
        titulo="Números"
        bajada="Las cuentas que deciden si tu negocio aguanta."
        proyecto={state.project.name}
        onOpenProject={onOpenProject}
      />

      {/* La frase primero, antes de las pestañas: es la pieza central. */}
      <FraseDeNumeros titular={titularDeEquilibrio(entradaDelTitular)} />

      <PestanasDeNumeros activa={view} onCambiar={onChangeView} />

      {/*
        Las cuatro métricas. La inversión va bajo candado y sin cifra en
        prueba: se ve que existe y qué la abre, que convierte mejor que
        esconderla.
      */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {keyResults({
          ticket: state.ticket,
          equilibrio: be.monthlySales,
          margin: menuAggregates(state.dishes, { subrecipes: state.subrecipes }).suggestedMargin ?? 0,
          inversion: invest.total,
          muestraInversion: can.muestraCifrasDeInversion,
        }).map((row) => (
          <TarjetaDeMetrica key={row.label} row={row} />
        ))}
      </div>

      <H size={19} style={{ margin: '12px 2px 0' }}>
        Calculadoras
      </H>

      {/*
        En prueba el presupuesto no lleva candado ni manda al pago: entra a la
        vista de ejemplo, que se lee completa. Ese bloqueo convierte mejor
        justo porque deja ver lo que hay dentro. Tiene además su propia
        pestaña: «cuánto necesito para abrir» es la primera pregunta de quien
        descarga esto, y aquí abajo se leía como un accesorio.
      */}
      <FilaModulo
        kicker="Módulo 1"
        title="Presupuesto de apertura"
        hint={
          can.muestraCifrasDeInversion
            ? `${money(invest.total)} · ${state.budget.length} conceptos`
            : `${state.budget.length} conceptos con subconceptos · míralo completo antes de pagar`
        }
        circulo="var(--color-accent-700)"
        d1="M3 7.5h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
        d2="M3 7.5 15.5 4l1 3.5M16.5 13.5h.01"
        onClick={() => onChangeView('presupuesto')}
      />
      <FilaModulo
        kicker="Módulo 2"
        title="Gastos fijos mensuales"
        hint={`${money(fixed)} al mes · ${state.fixed.length} conceptos`}
        circulo="var(--color-accent-2-800)"
        d1="M4 21V9l8-6 8 6v12"
        d2="M2 21h20M9 21v-6h6v6M9 11h.01M15 11h.01"
        onClick={() => onChangeView('fijos')}
      />
      <FilaModulo
        kicker="Módulo 3"
        title="Punto de equilibrio"
        hint={`${money(be.monthlySales)} al mes · ${be.ticketsPerDay} tickets al día`}
        circulo="var(--color-accent-2-600)"
        d1="M12 3v18M4 8h16"
        d2="M4 8 2 15h4ZM20 8l-2 7h4ZM8 21h8"
        onClick={() => onChangeView('equilibrio')}
      />

      <button
        type="button"
        /* El resumen financiero se genera con los datos reales: es de lo que
           se abre con el pago, no del recorrido de prueba. */
        onClick={() => (alcanceDe(level, 'numeros:resumen') === 'abierto' ? onPrint() : onOpenPaywall())}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          border: '1px solid var(--color-border)',
          borderRadius: RADIUS.block,
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          textAlign: 'left',
        }}
      >
        <FileText size={22} strokeWidth={2} style={{ flex: 'none' }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-.01em' }}>
          Resumen financiero para imprimir o PDF
        </span>
        <ChevronRight size={17} strokeWidth={2.6} style={{ flex: 'none', color: 'var(--color-text-2)' }} />
      </button>
      <p className="mrl-prose" style={{ margin: '0 2px', fontSize: 13.5, lineHeight: 1.5, color: 'var(--color-text-2)' }}>
        Incluye presupuesto con subconceptos, gastos fijos, punto de equilibrio y escenarios de venta. Es el documento
        que le muestras a tu socio o al banco.
      </p>
    </div>
  );
}

/** Una fila de módulo financiero: círculo con icono, rótulo, título y pie. */
function FilaModulo({
  kicker,
  title,
  hint,
  tono,
  circulo,
  d1,
  d2,
  onClick,
}: {
  kicker: string;
  title: string;
  hint: string;
  /** 'accent' pinta la fila entera en el pastel del acento. */
  tono?: 'accent';
  /** Relleno del círculo del icono cuando la fila va en blanco. */
  circulo?: string;
  d1: string;
  d2: string;
  onClick: () => void;
}) {
  const destacada = tono === 'accent';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        textAlign: 'left',
        padding: 16,
        border: `1px solid ${destacada ? 'var(--color-accent-200)' : 'var(--color-border)'}`,
        borderRadius: RADIUS.block,
        background: destacada ? 'var(--color-accent-100)' : 'var(--color-surface)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text)',
      }}
    >
      <span
        style={{
          width: 52,
          height: 52,
          flex: 'none',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: destacada ? 'var(--color-accent-500)' : circulo,
          color: destacada ? 'var(--on-accent)' : 'var(--color-neutral-100)',
        }}
      >
        <svg width={23} height={23} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={d1} />
          <path d={d2} />
        </svg>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 10.5, letterSpacing: '.1em', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-800)' }}>
          {kicker}
        </span>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-heading)',
            fontSize: 19,
            marginTop: 2,
            color: destacada ? 'var(--color-accent-900)' : 'var(--color-text)',
          }}
        >
          {title}
        </span>
        <span style={{ display: 'block', fontSize: 13, marginTop: 2, color: destacada ? 'var(--color-accent-800)' : 'var(--color-text-2)' }}>
          {hint}
        </span>
      </span>
      <ChevronRight size={17} strokeWidth={2.75} style={{ flex: 'none', color: 'var(--color-neutral-600)' }} />
    </button>
  );
}

function Budget({
  state,
  formOpen,
  onBack,
  onPatch,
  onFlash,
  readOnly = false,
  onOpenPaywall,
}: {
  state: ProjectState;
  formOpen: boolean;
  onBack: () => void;
  onPatch: (patch: Partial<ProjectState>) => void;
  onFlash: (message: string) => void;
  /** En prueba: se ve el ejemplo completo pero no se puede capturar. */
  readOnly?: boolean;
  onOpenPaywall?: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(formOpen);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  // En solo lectura se enseñan los 13 conceptos de la cafetería de ejemplo,
  // no el presupuesto vacío del usuario: así se ve de qué se trata.
  const concepts = readOnly ? EXAMPLE_BUDGET : state.budget;
  const subconcepts = readOnly ? {} : state.budgetSub;
  const budgetCap = readOnly ? EXAMPLE_BUDGET_CAP : state.project.budgetCap;

  const result = investment({
    concepts,
    subconcepts,
    budgetCap,
  });

  const setAmountFor = (key: string, value: number) =>
    onPatch({ budget: state.budget.map((c) => (c.key === key ? { ...c, amount: value } : c)) });

  const setSubconcepts = (key: string, subs: Subconcept[]) =>
    onPatch({ budgetSub: { ...state.budgetSub, [key]: subs } });

  return (
    <div>
      <ScreenHeader title="Presupuesto de apertura" subtitle="Cuánto necesitas para abrir" onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
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

        {readOnly ? (
          <div
            style={{
              padding: '13px 15px',
              borderRadius: RADIUS.small,
              background: 'var(--color-accent-100)',
              color: 'var(--color-accent-900)',
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 800 }}>
              Vista de ejemplo
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 3 }}>
              Una cafetería de 45 m² en zona de oficinas
            </div>
            <p className="mrl-prose" style={{ margin: '6px 0 0', fontSize: 12.5, lineHeight: 1.5 }}>
              Así se ve un presupuesto de apertura completo, con sus 13 conceptos. Con el pago único capturas los tuyos
              y los desglosas por partes.
            </p>
            {onOpenPaywall ? (
              <div style={{ marginTop: 12 }}>
                <Button onClick={onOpenPaywall}>Capturar mis propios números</Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
          {concepts.map((concept) => {
            const subs = subconcepts[concept.key] ?? [];
            const total = conceptTotal(concept.amount, subs);
            const isOpen = open === concept.key;

            return (
              <Card key={concept.key} radius={RADIUS.block} style={{ padding: 14 }}>
                <Row gap={10}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : concept.key)}
                    style={{
                      flex: 1, minWidth: 0,
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
                  {subs.length || readOnly ? (
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
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8, animation: 'mrlUp .2s ease both' }}>
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
                            flex: 1, minWidth: 0,
                            height: 44,
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
                            height: 44,
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
                    {readOnly ? (
                      <Muted size={12.5}>
                        Cada concepto se puede desglosar por partes. Con el pago único capturas las tuyas.
                      </Muted>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setSubconcepts(concept.key, [
                            ...subs,
                            { id: `s${Date.now()}`, label: 'Nueva parte', amount: 0 },
                          ])
                        }
                      >
                        Agregar subconcepto
                      </Button>
                    )}
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
                          color: 'var(--color-accent-800)',
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

        {readOnly ? null : showForm ? (
          <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
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
          <Button variant="secondary" onClick={() => setShowForm(true)}>
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
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
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

        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
          {state.fixed.map((concept) => (
            <Row key={concept.key} gap={10}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600 }}>{concept.label}</span>
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
                  height: 44,
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
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginTop: 16 }}>
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

        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
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
              className="mrl-rango"
              type="range"
              aria-label="Ticket promedio, en pesos"
              min={80}
              max={400}
              step={5}
              value={state.ticket}
              onChange={(e) => onPatch({ ticket: Number(e.target.value) })}
            />
          </div>

          <div>
            <Row style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: text(62) }}>Margen bruto</span>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{state.margin}%</span>
            </Row>
            <input
              className="mrl-rango"
              type="range"
              aria-label="Margen bruto, en porcentaje"
              min={40}
              max={85}
              value={state.margin}
              onChange={(e) => onPatch({ margin: Number(e.target.value) })}
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


/**
 * Una de las cuatro métricas de la portada: icono de color, cifra y pie.
 *
 * La inversión llega con `bajoCandado` en prueba: se ve la tarjeta, se ve su
 * rótulo y en lugar de la cifra dice qué la abre. Esconderla entera convertía
 * peor que enseñar que existe.
 */
function TarjetaDeMetrica({ row }: { row: KeyResult }) {
  return (
    <div
      style={{
        padding: '13px 14px',
        border: '1px solid var(--color-border)',
        borderRadius: RADIUS.block,
        background: 'var(--color-surface)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 7,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 26,
            height: 26,
            flex: 'none',
            borderRadius: 8,
            background: `var(--cat-${row.cat})`,
            color: `var(--cat-${row.cat}-ink)`,
          }}
        >
          <svg
            width={15}
            height={15}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d={row.d1} />
            <path d={row.d2} />
          </svg>
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-2)', minWidth: 0 }}>{row.label}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {row.bajoCandado ? <Lock size={14} strokeWidth={2.6} style={{ flex: 'none', color: 'var(--color-text-2)' }} /> : null}
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: row.bajoCandado ? 15 : 21,
            lineHeight: 1.1,
            letterSpacing: '-.02em',
            minWidth: 0,
          }}
        >
          {row.value}
        </span>
      </div>

      <span style={{ fontSize: 11.5, lineHeight: 1.35, color: 'var(--color-text-2)' }}>{row.foot}</span>
    </div>
  );
}
