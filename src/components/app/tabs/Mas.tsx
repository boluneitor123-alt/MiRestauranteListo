'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Download, Lock } from 'lucide-react';
import { FAQ_ITEMS as FAQ, GIROS } from '@/content/catalog';
import { ROUTE_MODULES } from '@/content/route';
import { fixedExpensesTotal } from '@/domain/finance';
import { DeliveryCalculator } from '../tools/DeliveryCalculator';
import { AdDoctor } from '../tools/AdDoctor';
import { TOUR_STEPS } from '@/content/onboarding';
import { DEMO_DISHES, DEMO_SUBRECIPES } from '@/content/demo';
import { exportBackup, importBackup, ACCENT_OPTIONS, type ProjectState } from '@/domain/projectState';
import { projectProgress } from '@/domain/progress';
import { menuAggregates } from '@/domain/aggregates';
import { money, pct } from '@/domain/format';
import { LICENSE_STATUS_LABELS } from '@/domain/license';
import type { Capabilities } from '@/domain/access';
import type { Diagnosis, Target } from '@/domain/diagnosis';
import type { PlatformInfo } from '@/lib/device';
import type { Entitlement } from '@/state/store';
import { Button, Card, Field, H, Muted, Pill, ProgressBar, RADIUS, Row, ScreenHeader, Switch, text } from '@/components/ui';

export type SubScreen =
  | 'perfil'
  | 'proyecto'
  | 'giro'
  | 'plantilla'
  | 'notas'
  | 'proveedores'
  | 'diagnostico'
  | 'como-usar'
  | 'recorrido'
  | 'faq'
  | 'recursos'
  | 'novedades'
  | 'ajustes'
  | 'compra'
  | 'respaldo'
  | 'invita'
  | 'ayuda'
  | 'terminos'
  | 'recuperar'
  | 'alertas'
  | 'mapa'
  | 'delivery'
  | 'anuncios';

const GROUPS: Array<{ title: string; items: Array<{ id: SubScreen; label: string; meta?: string }> }> = [
  {
    title: 'Mi proyecto',
    items: [
      { id: 'perfil', label: 'Mi perfil' },
      { id: 'proyecto', label: 'Datos del proyecto' },
      { id: 'giro', label: 'Tipo de negocio' },
      { id: 'plantilla', label: 'Plantilla de mi giro' },
      { id: 'notas', label: 'Mis notas' },
      { id: 'proveedores', label: 'Mis proveedores' },
      { id: 'diagnostico', label: 'Repetir mi diagnóstico' },
    ],
  },
  {
    title: 'Herramientas',
    items: [
      { id: 'delivery', label: 'Calculadora de delivery' },
      { id: 'anuncios', label: 'Analizador de anuncios' },
    ],
  },
  {
    title: 'Aprender',
    items: [
      { id: 'como-usar', label: 'Cómo usar MiRestauranteListo', meta: '5 pasos' },
      { id: 'recorrido', label: 'Repetir el recorrido guiado', meta: `${TOUR_STEPS.length} pasos` },
      { id: 'faq', label: 'Preguntas frecuentes', meta: `${FAQ.length}` },
      { id: 'recursos', label: 'Recursos descargables', meta: '6' },
      { id: 'novedades', label: 'Novedades incluidas' },
    ],
  },
  {
    title: 'Cuenta y ayuda',
    items: [
      { id: 'ajustes', label: 'Ajustes' },
      { id: 'compra', label: 'Mi compra' },
      { id: 'respaldo', label: 'Respaldo de mis datos' },
      { id: 'invita', label: 'Invita y gana' },
      { id: 'ayuda', label: 'Ayuda y soporte' },
      { id: 'terminos', label: 'Términos y privacidad' },
    ],
  },
];

const RESOURCES = [
  ['Plantilla de costeo (CSV con fórmulas)', 'plantilla-costeo.csv'],
  ['Comparador de proveedores (CSV con fórmulas)', 'comparador-proveedores.csv'],
  ['Plan de apertura de 30 días (CSV)', 'plan-apertura-30-dias.csv'],
  ['Checklist de permisos (imprimible)', 'checklist-permisos.html'],
  ['Formato de receta estándar (imprimible)', 'receta-estandar.html'],
  ['Guía de precios de menú (imprimible)', 'guia-precios-menu.html'],
] as const;

const CHANGELOG = [
  ['v1.0 · Hoy', 'Ruta de 90 tareas en 14 módulos, costeador con sub-recetas, presupuesto con subconceptos y punto de equilibrio.'],
  ['Próximo', 'Exportar tu carta a PDF con el diseño ya acomodado.'],
  ['Próximo', 'Comparador de proveedores dentro de la app.'],
  ['Próximo', 'Control de inventario inicial y mermas del mes.'],
] as const;

const TERMS = [
  ['Qué compras', 'Un acceso de por vida a MiRestauranteListo con un solo pago, sin suscripción mensual.'],
  ['Cuántos equipos', 'Puedes usar tu licencia en hasta 3 equipos. Si cambias de teléfono, libera uno desde soporte.'],
  ['Garantía', 'Tienes 14 días para pedir reembolso completo, sin explicaciones.'],
  ['Tus datos', 'Son tuyos. Puedes descargarlos en cualquier momento desde Respaldo, y borrarlos desde Ajustes.'],
  ['Qué no somos', 'MiRestauranteListo es una herramienta de planeación. No sustituye a tu contador ni a tu asesor legal.'],
] as const;

const HOW_TO = [
  ['Contesta tu diagnóstico', 'Doce preguntas para saber en qué etapa estás y qué te falta.'],
  ['Sigue tu ruta', 'Diez módulos en orden. Cada tarea te dice por qué importa y qué hacer exactamente.'],
  ['Costea tus platillos', 'Captura ingredientes con su precio de compra y su merma para ver tu costo real.'],
  ['Arma tus números', 'Presupuesto de apertura, gastos fijos y cuánto tienes que vender al día.'],
  ['Revisa cada semana', 'Los insumos se mueven: vuelve a tus costos una vez al mes.'],
] as const;

/** Pestaña "Más" y sus sub-pantallas (README § 1.9). */
export function Mas({
  state,
  sub,
  entitlement,
  can,
  platform,
  diagnosis,
  formOpen,
  onOpenSub,
  onPatch,
  onReplace,
  onGo,
  onOpenPaywall,
  onFlash,
  onRestartDiagnosis,
  onStartTour,
  onActivate,
  onLogout,
}: {
  state: ProjectState;
  sub: SubScreen | null;
  entitlement: Entitlement | null;
  can: Capabilities;
  platform: PlatformInfo;
  diagnosis: Diagnosis;
  formOpen: boolean;
  onOpenSub: (sub: SubScreen | null) => void;
  onPatch: (patch: Partial<ProjectState>) => void;
  onReplace: (state: ProjectState) => void;
  onGo: (target: Target) => void;
  onOpenPaywall: () => void;
  onFlash: (message: string) => void;
  onRestartDiagnosis: () => void;
  onStartTour: () => void;
  onActivate: (code: string) => Promise<{ ok: boolean; message?: string }>;
  onLogout: () => void;
}) {
  if (sub) {
    return (
      <SubScreenView
        sub={sub}
        state={state}
        entitlement={entitlement}
        can={can}
        platform={platform}
        diagnosis={diagnosis}
        formOpen={formOpen}
        onBack={() => onOpenSub(null)}
        onPatch={onPatch}
        onReplace={onReplace}
        onGo={onGo}
        onOpenPaywall={onOpenPaywall}
        onFlash={onFlash}
        onRestartDiagnosis={onRestartDiagnosis}
        onStartTour={onStartTour}
        onActivate={onActivate}
      />
    );
  }

  return (
    <div className="mrl-measure" style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
      <H size={25}>Más</H>

      <Card>
        <Row gap={12} style={{ flexWrap: 'wrap' }}>
          <span
            style={{
              width: 46,
              height: 46,
              flexShrink: 0,
              borderRadius: RADIUS.pill,
              background: 'var(--color-accent-100)',
              color: 'var(--color-accent-700)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            {(state.profile.name || 'T').slice(0, 1).toUpperCase()}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700 }}>{state.profile.name || 'Tu perfil'}</div>
            <Muted size={12}>{state.profile.email || 'Sin correo capturado'}</Muted>
          </div>
          <span
            style={{
              padding: '5px 10px',
              borderRadius: RADIUS.pill,
              background: entitlement?.licensed ? 'var(--color-accent-2-100)' : 'var(--color-neutral-200)',
              color: entitlement?.licensed ? 'var(--color-accent-2-700)' : text(55),
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {entitlement?.licensed ? 'Acceso de por vida' : (entitlement?.trial.label ?? 'Prueba')}
          </span>
        </Row>
      </Card>

      <Card>
        <H size={16}>{platform.installed ? 'Ya la tienes instalada' : 'Instala la app'}</H>
        <Muted size={12.5} style={{ marginTop: 4 }}>
          {platform.installHint}
        </Muted>
      </Card>

      {GROUPS.map((group) => (
        <div key={group.title}>
          <Muted size={11.5} style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            {group.title}
          </Muted>
          <Card style={{ marginTop: 8, padding: 4 }}>
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => (item.id === 'diagnostico' ? onRestartDiagnosis() : item.id === 'recorrido' ? onStartTour() : onOpenSub(item.id))}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  padding: '14px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text)',
                  fontSize: 14.5,
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                {item.label}
                <Row gap={6}>
                  {item.meta ? <Muted size={12}>{item.meta}</Muted> : null}
                  <ChevronRight size={16} strokeWidth={2.6} color={text(40)} />
                </Row>
              </button>
            ))}
          </Card>
        </div>
      ))}

      <Button variant="secondary" height={46} onClick={onLogout}>
        Cerrar sesión
      </Button>
    </div>
  );
}

function SubScreenView(props: {
  sub: SubScreen;
  state: ProjectState;
  entitlement: Entitlement | null;
  can: Capabilities;
  platform: PlatformInfo;
  diagnosis: Diagnosis;
  formOpen: boolean;
  onBack: () => void;
  onPatch: (patch: Partial<ProjectState>) => void;
  onReplace: (state: ProjectState) => void;
  onGo: (target: Target) => void;
  onOpenPaywall: () => void;
  onFlash: (message: string) => void;
  onRestartDiagnosis: () => void;
  onStartTour: () => void;
  onActivate: (code: string) => Promise<{ ok: boolean; message?: string }>;
}) {
  const { sub, state, onBack, onPatch, onFlash } = props;

  const wrap = (title: string, subtitle: string, children: React.ReactNode) => (
    <div>
      <ScreenHeader title={title} subtitle={subtitle} onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
        {children}
      </div>
    </div>
  );

  switch (sub) {
    // Las dos herramientas viven detrás del pago único.
    case 'delivery':
      if (!props.can.printableDocuments) return <ToolLocked name="La calculadora de delivery" onBack={onBack} onOpenPaywall={props.onOpenPaywall} />;
      return <DeliveryCalculator onBack={onBack} />;

    case 'anuncios':
      if (!props.can.printableDocuments) return <ToolLocked name="El analizador de anuncios" onBack={onBack} onOpenPaywall={props.onOpenPaywall} />;
      return (
        <AdDoctor
          ticket={state.ticket}
          marginPct={state.margin}
          monthlyFixed={fixedExpensesTotal(state.fixed)}
          onBack={onBack}
        />
      );

    case 'perfil': {
      const progress = projectProgress({
        modules: ROUTE_MODULES,
        done: state.done,
        skipped: state.skipped,
        extraTasks: state.extraTasks,
      });
      const aggregates = menuAggregates(state.dishes, { subrecipes: state.subrecipes });
      return wrap('Mi perfil', 'Tus datos de contacto', (
        <>
          <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
            <Field label="Nombre" value={state.profile.name} onChange={(v) => onPatch({ profile: { ...state.profile, name: v } })} />
            <Field label="Correo" value={state.profile.email} onChange={(v) => onPatch({ profile: { ...state.profile, email: v } })} />
            <Field label="Teléfono" value={state.profile.phone} onChange={(v) => onPatch({ profile: { ...state.profile, phone: v } })} />
            <Field label="Ciudad" value={state.profile.city} onChange={(v) => onPatch({ profile: { ...state.profile, city: v } })} />
          </Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <MiniKpi label="Avance del proyecto" value={`${progress.pct}%`} />
            <MiniKpi label="Tareas completadas" value={`${progress.done} de ${progress.total}`} />
            <MiniKpi label="Platillos costeados" value={String(state.dishes.length)} />
            <MiniKpi label="Food cost promedio" value={pct(aggregates.averageFoodCost)} />
          </div>
        </>
      ));
    }

    case 'proyecto':
      return wrap('Datos del proyecto', 'Afectan tus números', (
        <>
          <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
            <Field label="Nombre del negocio" value={state.project.name} onChange={(v) => onPatch({ project: { ...state.project, name: v } })} />
            <Field
              label="Presupuesto tope"
              prefix="$"
              inputMode="decimal"
              value={state.project.budgetCap}
              onChange={(v) => onPatch({ project: { ...state.project, budgetCap: Number(v.replace(/[^0-9.]/g, '')) || 0 } })}
            />
            <Field label="Fecha objetivo de apertura" value={state.project.openDate} onChange={(v) => onPatch({ project: { ...state.project, openDate: v } })} />
            <Field label="Personas al inicio" value={state.project.people} onChange={(v) => onPatch({ project: { ...state.project, people: v } })} />
          </Card>
          <Muted size={12.5}>
            Tu presupuesto tope es contra lo que se compara la inversión de apertura. La fecha objetivo marca el ritmo de
            tu ruta y las personas al inicio te ayudan a estimar la nómina de tus gastos fijos.
          </Muted>
        </>
      ));

    case 'giro':
      return wrap('Tipo de negocio', 'Benchmarks por giro', (
        <>
          {GIROS.map((giro) => (
            <Card key={giro.name} radius={RADIUS.block} style={{ padding: 14 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <H size={16}>{giro.name}</H>
                <Pill
                  selected={state.project.giro === giro.name}
                  onClick={() => {
                    onPatch({ project: { ...state.project, giro: giro.name } });
                    onFlash(`Tu giro ahora es ${giro.name}`);
                  }}
                >
                  {state.project.giro === giro.name ? 'Tu giro' : 'Elegir'}
                </Pill>
              </Row>
              <Muted size={12.5} style={{ marginTop: 6 }}>
                Inversión {giro.investment} · Food cost {giro.foodCost} · Ticket {giro.ticket} · Equipo {giro.team}
              </Muted>
            </Card>
          ))}
        </>
      ));

    case 'plantilla':
      return wrap('Plantilla de mi giro', `Datos de arranque para ${state.project.giro}`, (
        <>
          <Muted size={13.5}>
            La plantilla carga platillos y sub-recetas de ejemplo de tu giro para que veas cómo se costea. Puedes
            editarlos o borrarlos después.
          </Muted>
          <Card style={{ background: 'var(--color-accent-100)' }}>
            <Muted size={13} style={{ color: 'var(--color-accent-900)' }}>
              Cuidado: cargar la plantilla reemplaza tus platillos y sub-recetas actuales. Descarga tu respaldo primero.
            </Muted>
          </Card>
          <Button variant="secondary" height={46} onClick={() => props.onGo({ tab: 'mas', view: 'respaldo' })}>
            Descargar respaldo primero
          </Button>
          <Button
            onClick={() => {
              onPatch({ dishes: structuredClone(DEMO_DISHES) as never, subrecipes: structuredClone(DEMO_SUBRECIPES) as never });
              onFlash('Plantilla cargada');
              onBack();
            }}
          >
            Cargar plantilla
          </Button>
        </>
      ));

    case 'notas':
      return <Notes state={state} formOpen={props.formOpen} onBack={onBack} onPatch={onPatch} onFlash={onFlash} />;

    case 'proveedores':
      return <Suppliers state={state} formOpen={props.formOpen} onBack={onBack} onPatch={onPatch} onFlash={onFlash} />;

    case 'ajustes':
      return wrap('Ajustes', 'Cómo se ve y cómo te avisa', (
        <>
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Muted size={13}>Equipo detectado</Muted>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{props.platform.label}</span>
            </Row>
          </Card>
          <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
            <Switch label="Alertas de mi proyecto" checked={state.settings.alerts} onChange={(v) => onPatch({ settings: { ...state.settings, alerts: v } })} />
            <Switch label="Recordatorio semanal" checked={state.settings.weekly} onChange={(v) => onPatch({ settings: { ...state.settings, weekly: v } })} />
            <Switch label="Guardar en el teléfono" checked={state.settings.saveOnDevice} onChange={(v) => onPatch({ settings: { ...state.settings, saveOnDevice: v } })} />
            <Switch label="Modo noche" checked={state.settings.dark} onChange={(v) => onPatch({ settings: { ...state.settings, dark: v } })} />
          </Card>
          <Card>
            <Muted size={12.5} style={{ marginBottom: 10 }}>
              Color de la interfaz
            </Muted>
            <Row gap={10} style={{ flexWrap: 'wrap' }}>
              {ACCENT_OPTIONS.map((accent) => (
                <button
                  key={accent.value}
                  type="button"
                  onClick={() => onPatch({ settings: { ...state.settings, accent: accent.value } })}
                  aria-label={accent.name}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.pill,
                    background: accent.value,
                    border: state.settings.accent === accent.value ? '3px solid var(--color-text)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Row>
          </Card>
          <Card>
            <Muted size={12.5} style={{ marginBottom: 10 }}>
              Moneda
            </Muted>
            <Row gap={8}>
              {(['MXN', 'USD'] as const).map((currency) => (
                <Pill
                  key={currency}
                  selected={state.settings.currency === currency}
                  onClick={() => onPatch({ settings: { ...state.settings, currency } })}
                >
                  {currency}
                </Pill>
              ))}
            </Row>
          </Card>
          <Button
            variant="secondary"
            height={46}
            onClick={() => {
              if (confirm('¿Restablecer todos tus datos? Esto no se puede deshacer.')) {
                props.onReplace(importBackup(null));
                onFlash('Datos restablecidos');
              }
            }}
          >
            Restablecer mis datos
          </Button>
        </>
      ));

    case 'respaldo':
      return wrap('Respaldo de mis datos', 'Todo lo que capturaste', (
        <>
          <Muted size={13.5}>
            El respaldo incluye tu perfil, tu ruta, tus platillos y sub-recetas, tu presupuesto con subconceptos, tus
            gastos fijos, tus notas y tus proveedores.
          </Muted>
          <Button
            onClick={() => {
              const blob = new Blob([JSON.stringify(exportBackup(state), null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'mirestaurantelisto-respaldo.json';
              link.click();
              URL.revokeObjectURL(url);
              onFlash('Respaldo descargado');
            }}
          >
            <Download size={17} strokeWidth={2.6} /> Descargar respaldo (.json)
          </Button>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: text(62), marginBottom: 6 }}>
              Restaurar desde archivo
            </span>
            <input
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  props.onReplace(importBackup(JSON.parse(await file.text())));
                  onFlash('Respaldo restaurado');
                } catch {
                  onFlash('Ese archivo no se pudo leer');
                }
              }}
            />
          </label>
        </>
      ));

    case 'recuperar':
      return <Recover onBack={onBack} entitlement={props.entitlement} onActivate={props.onActivate} onFlash={onFlash} />;

    case 'compra':
      return wrap('Mi compra', 'Estado de tu acceso', (
        <>
          <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Muted size={13}>Estado</Muted>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {props.entitlement?.licensed
                  ? 'Acceso de por vida'
                  : (props.entitlement?.trial.label ?? 'Prueba en curso')}
              </span>
            </Row>
            {props.entitlement?.code ? (
              <Row style={{ justifyContent: 'space-between' }}>
                <Muted size={13}>Código</Muted>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{props.entitlement.code}</span>
              </Row>
            ) : null}
            {props.entitlement?.status ? (
              <Row style={{ justifyContent: 'space-between' }}>
                <Muted size={13}>Licencia</Muted>
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {LICENSE_STATUS_LABELS[props.entitlement.status as keyof typeof LICENSE_STATUS_LABELS] ??
                    props.entitlement.status}
                </span>
              </Row>
            ) : null}
            {props.entitlement?.devices ? (
              <Row style={{ justifyContent: 'space-between' }}>
                <Muted size={13}>Equipos</Muted>
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {props.entitlement.devices.used} de {props.entitlement.devices.max}
                </span>
              </Row>
            ) : null}
          </Card>
          {!props.entitlement?.licensed ? <Button onClick={props.onOpenPaywall}>Ver el pago único</Button> : null}
          <Button variant="secondary" height={46} onClick={() => props.onGo({ tab: 'mas', view: 'recuperar' })}>
            Recuperar acceso en otro equipo
          </Button>
        </>
      ));

    case 'faq':
      return <Faq onBack={onBack} />;

    case 'recursos':
      return wrap('Recursos descargables', '6 archivos listos para usar', (
        <>
          {RESOURCES.map(([label, file]) => (
            <Card key={file} radius={RADIUS.block} style={{ padding: 14 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
                  <Muted size={11.5}>{file}</Muted>
                </div>
                {props.can.resources ? (
                  <a
                    href={`/api/recursos/${file}`}
                    download
                    style={{ color: 'var(--color-accent-700)', fontWeight: 800, fontSize: 12.5 }}
                  >
                    Descargar
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={props.onOpenPaywall}
                    style={{
                      border: 'none',
                      background: 'var(--color-neutral-200)',
                      borderRadius: RADIUS.pill,
                      padding: '6px 12px',
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: text(55),
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Con el pago
                  </button>
                )}
              </Row>
            </Card>
          ))}
        </>
      ));

    case 'novedades':
      return wrap('Novedades incluidas', 'Actualizaciones de las herramientas de apertura', (
        <>
          {CHANGELOG.map(([version, description]) => (
            <Card key={version + description} radius={RADIUS.block} style={{ padding: 14 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>{version}</div>
              <Muted size={12.5} style={{ marginTop: 4 }}>
                {description}
              </Muted>
            </Card>
          ))}
        </>
      ));

    case 'terminos':
      return wrap('Términos y privacidad', 'En corto y sin letras chiquitas', (
        <>
          {TERMS.map(([title, body]) => (
            <Card key={title} radius={RADIUS.block} style={{ padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div>
              <Muted size={12.5} style={{ marginTop: 4 }}>
                {body}
              </Muted>
            </Card>
          ))}
        </>
      ));

    case 'como-usar':
      return wrap('Cómo usar MiRestauranteListo', '5 pasos', (
        <>
          {HOW_TO.map(([title, body], i) => (
            <Card key={title} radius={RADIUS.block} style={{ padding: 14 }}>
              <Row gap={12} align="flex-start">
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: RADIUS.pill,
                    background: 'var(--color-accent-100)',
                    color: 'var(--color-accent-700)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{title}</div>
                  <Muted size={12.5} style={{ marginTop: 3 }}>
                    {body}
                  </Muted>
                </div>
              </Row>
            </Card>
          ))}
          <Button onClick={() => props.onGo({ tab: 'ruta' })}>Empezar por mi ruta</Button>
        </>
      ));

    case 'invita':
      return wrap('Invita y gana', `${20}% para quien invites`, (
        <>
          <Card style={{ textAlign: 'center' }}>
            <Muted size={12.5}>Tu código de invitación</Muted>
            <H size={26} style={{ marginTop: 6 }}>
              AMIGO-{(state.profile.email || 'MRL').slice(0, 4).toUpperCase()}
            </H>
          </Card>
          <Muted size={13}>
            Comparte tu código: quien lo use se lleva 20% de descuento en su pago único.
          </Muted>
          <Button
            onClick={() => {
              const text = `Estoy usando MiRestauranteListo para abrir mi negocio de comida. Con mi código AMIGO-${(state.profile.email || 'MRL').slice(0, 4).toUpperCase()} te dan 20% de descuento.`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
            }}
          >
            Compartir por WhatsApp
          </Button>
        </>
      ));

    case 'ayuda':
      return wrap('Ayuda y soporte', 'Te contestamos nosotros', (
        <>
          <Card radius={RADIUS.block} style={{ padding: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>WhatsApp</div>
            <Muted size={12.5}>La vía más rápida. Contestamos el mismo día.</Muted>
          </Card>
          <Card radius={RADIUS.block} style={{ padding: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Correo</div>
            <Muted size={12.5}>hola@mirestaurantelisto.mx</Muted>
          </Card>
          <Card radius={RADIUS.block} style={{ padding: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Horario</div>
            <Muted size={12.5}>Lunes a viernes, 9:00 a 19:00 (hora del centro de México).</Muted>
          </Card>
          <Muted size={12.5}>
            Antes de escribirnos, revisa las {FAQ.length} preguntas frecuentes: casi siempre la respuesta ya está ahí.
          </Muted>
        </>
      ));

    case 'alertas':
      return wrap('Alertas', 'Lo que tu proyecto necesita', (
        <>
          {props.diagnosis.recommendations.map((rec) => (
            <Card key={rec.id} radius={RADIUS.block} style={{ padding: 14 }}>
              <Row gap={10} align="flex-start">
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: RADIUS.pill,
                    marginTop: 6,
                    background:
                      rec.severity === 'alta'
                        ? 'var(--color-accent)'
                        : rec.severity === 'media'
                          ? 'var(--color-warn)'
                          : 'var(--color-accent-2-500)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{rec.title}</div>
                  <Muted size={12.5} style={{ marginTop: 4 }}>
                    {rec.body}
                  </Muted>
                  <button
                    type="button"
                    onClick={() => props.onGo(rec.target)}
                    style={{
                      marginTop: 8,
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      color: 'var(--color-accent-700)',
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {rec.cta} →
                  </button>
                </div>
              </Row>
            </Card>
          ))}
        </>
      ));

    case 'mapa':
      return wrap('Vista general de mi ruta', `${ROUTE_MODULES.length} módulos`, (
        <>
          {props.diagnosis.progress.modules.map((module) => (
            <Card key={module.id} radius={RADIUS.block} style={{ padding: 14 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{module.name}</div>
                  <Muted size={12}>
                    {module.skipped ? `Omitido · ${module.reason}` : `${module.done} de ${module.total} tareas`}
                  </Muted>
                </div>
                <button
                  type="button"
                  onClick={() => props.onGo({ tab: 'ruta', module: module.id })}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-accent-700)',
                    fontWeight: 800,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Abrir →
                </button>
              </Row>
              <div style={{ marginTop: 10 }}>
                <ProgressBar pct={module.skipped ? 0 : module.pct} />
              </div>
            </Card>
          ))}
        </>
      ));

    default:
      return wrap('Próximamente', 'Esta pantalla llega en la siguiente versión', <Muted>Vuelve pronto.</Muted>);
  }
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <Card radius={RADIUS.inner} style={{ padding: 14 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19 }}>{value}</div>
      <Muted size={11}>{label}</Muted>
    </Card>
  );
}

function Notes({
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
  const [showForm, setShowForm] = useState(formOpen);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  return (
    <div>
      <ScreenHeader title="Mis notas" subtitle="Lo que no quieres olvidar" onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
        {state.notes.map((note) => (
          <Card key={note.id} radius={RADIUS.block} style={{ padding: 14 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{note.title}</div>
              <button
                type="button"
                onClick={() => onPatch({ notes: state.notes.filter((n) => n.id !== note.id) })}
                aria-label="Eliminar nota"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: text(45), fontSize: 18 }}
              >
                ×
              </button>
            </Row>
            <Muted size={12.5} style={{ marginTop: 4 }}>
              {note.body}
            </Muted>
            <Muted size={11} style={{ marginTop: 6 }}>
              {note.date}
            </Muted>
          </Card>
        ))}

        {showForm ? (
          <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
            <Field label="Título" value={title} onChange={setTitle} placeholder="Ej. Local de Av. Juárez" />
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: text(62), marginBottom: 6 }}>
                Nota
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: RADIUS.small,
                  border: '1.5px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                  fontSize: 16,
                  resize: 'vertical',
                }}
              />
            </label>
            <Row gap={10}>
              <Button variant="secondary" height={44} onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button
                height={44}
                disabled={!title.trim()}
                onClick={() => {
                  onPatch({
                    notes: [
                      { id: `n${Date.now()}`, title: title.trim(), body: body.trim(), date: new Date().toLocaleDateString('es-MX') },
                      ...state.notes,
                    ],
                  });
                  setTitle('');
                  setBody('');
                  setShowForm(false);
                  onFlash('Nota guardada');
                }}
              >
                Guardar
              </Button>
            </Row>
          </Card>
        ) : (
          <Button onClick={() => setShowForm(true)}>Nueva nota</Button>
        )}
      </div>
    </div>
  );
}

function Suppliers({
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
  const [showForm, setShowForm] = useState(formOpen);
  const [draft, setDraft] = useState({ name: '', item: '', contact: '', terms: '', delivery: '' });

  return (
    <div>
      <ScreenHeader title="Mis proveedores" subtitle="Quién te surte y en qué condiciones" onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
        {state.suppliers.map((supplier) => (
          <Card key={supplier.id} radius={RADIUS.block} style={{ padding: 14 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{supplier.name}</div>
              <button
                type="button"
                onClick={() => onPatch({ suppliers: state.suppliers.filter((s) => s.id !== supplier.id) })}
                aria-label="Eliminar proveedor"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: text(45), fontSize: 18 }}
              >
                ×
              </button>
            </Row>
            <Muted size={12.5} style={{ marginTop: 4 }}>
              {supplier.item} · {supplier.contact}
            </Muted>
            <Muted size={12}>
              {supplier.terms} · Entrega: {supplier.delivery}
            </Muted>
          </Card>
        ))}

        {showForm ? (
          <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
            <Field label="Nombre" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field label="Qué te surte" value={draft.item} onChange={(v) => setDraft({ ...draft, item: v })} />
            <Field label="Contacto" value={draft.contact} onChange={(v) => setDraft({ ...draft, contact: v })} />
            <Field label="Condiciones" value={draft.terms} onChange={(v) => setDraft({ ...draft, terms: v })} placeholder="Crédito 8 días" />
            <Field label="Días de entrega" value={draft.delivery} onChange={(v) => setDraft({ ...draft, delivery: v })} placeholder="Martes y viernes" />
            <Row gap={10}>
              <Button variant="secondary" height={44} onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button
                height={44}
                disabled={!draft.name.trim()}
                onClick={() => {
                  onPatch({ suppliers: [{ id: `s${Date.now()}`, ...draft }, ...state.suppliers] });
                  setDraft({ name: '', item: '', contact: '', terms: '', delivery: '' });
                  setShowForm(false);
                  onFlash('Proveedor guardado');
                }}
              >
                Guardar
              </Button>
            </Row>
          </Card>
        ) : (
          <Button onClick={() => setShowForm(true)}>Nuevo proveedor</Button>
        )}
      </div>
    </div>
  );
}

function Faq({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <ScreenHeader title="Preguntas frecuentes" subtitle={`${FAQ.length} respuestas directas`} onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
        {FAQ.map((item, i) => (
          <Card key={item.q} radius={RADIUS.block} style={{ padding: 14 }}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {item.q}
              <ChevronDown
                size={17}
                strokeWidth={2.6}
                color={text(45)}
                style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}
              />
            </button>
            {open === i ? (
              <Muted size={13} style={{ marginTop: 10, animation: 'mrlUp .2s ease both' }}>
                {item.a}
              </Muted>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Recover({
  onBack,
  entitlement,
  onActivate,
  onFlash,
}: {
  onBack: () => void;
  entitlement: Entitlement | null;
  onActivate: (code: string) => Promise<{ ok: boolean; message?: string }>;
  onFlash: (message: string) => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <ScreenHeader title="Recuperar acceso" subtitle="Cambiaste de equipo" onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
        <Muted size={13.5}>
          Si ya pagaste, primero intenta desbloquear sin escribir nada: buscamos tu compra automáticamente.
        </Muted>
        <Button
          variant="secondary"
          height={48}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const result = await onActivate('');
            setBusy(false);
            onFlash(result.ok ? 'Acceso desbloqueado' : 'No encontramos una compra pendiente en este equipo');
          }}
        >
          Buscar mi pago y desbloquear
        </Button>

        <Card style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
          <Field label="Tu código" value={code} onChange={setCode} placeholder="MRL-XXXX-XXXX" />
          <Button
            disabled={busy || !code.trim()}
            onClick={async () => {
              setBusy(true);
              setError(null);
              const result = await onActivate(code.trim());
              setBusy(false);
              if (result.ok) {
                onFlash('Acceso desbloqueado en este equipo');
                onBack();
              } else {
                setError(result.message ?? 'No pudimos desbloquear con ese código.');
              }
            }}
          >
            Desbloquear este equipo
          </Button>
          {error ? (
            <Muted size={12.5} style={{ color: 'var(--color-accent-800)' }}>
              {error}
            </Muted>
          ) : null}
        </Card>

        {entitlement?.devices ? (
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Muted size={13}>Equipos usados</Muted>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {entitlement.devices.used} de {entitlement.devices.max}
              </span>
            </Row>
          </Card>
        ) : null}

        <Row gap={8} align="flex-start">
          <Lock size={15} color={text(45)} strokeWidth={2.6} style={{ marginTop: 2 }} />
          <Muted size={12}>
            Tu código llega por correo como comprobante de compra. Sólo lo necesitas al cambiar de equipo.
          </Muted>
        </Row>
      </div>
    </div>
  );
}

/** Las dos herramientas se ven en la lista pero se abren con el pago único. */
function ToolLocked({
  name,
  onBack,
  onOpenPaywall,
}: {
  name: string;
  onBack: () => void;
  onOpenPaywall: () => void;
}) {
  return (
    <div>
      <ScreenHeader title={name} subtitle="Se abre con el pago único" onBack={onBack} />
      <div className="mrl-measure" style={{ padding: '10px 20px 30px' }}>
        <Card style={{ background: 'var(--color-accent-100)' }}>
          <Row gap={10} align="flex-start">
            <Lock size={18} color="var(--color-accent-700)" strokeWidth={2.6} style={{ flex: 'none', marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--color-accent-900)' }}>
                {name} es parte del pago único
              </div>
              <p
                className="mrl-prose"
                style={{ margin: '5px 0 0', fontSize: 12.8, lineHeight: 1.5, color: 'var(--color-accent-900)' }}
              >
                Un pago, acceso de por vida y garantía de 14 días. Durante la prueba puedes seguir usando tu ruta y el
                Costeador.
              </p>
            </div>
          </Row>
          <div style={{ marginTop: 12 }}>
            <Button onClick={onOpenPaywall}>Ver el pago único</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
