'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calculator, Home, ListChecks, MoreHorizontal, Plus, TrendingUp } from 'lucide-react';
import { ROUTE_MODULES } from '@/content/route';
import { ONBOARDING_QUESTIONS, TOUR_STEPS } from '@/content/onboarding';
import { diagnose, type Target } from '@/domain/diagnosis';
import { DEFAULT_FOOD_COST_TARGET } from '@/domain/costing';
import { projectProgress, taskKey } from '@/domain/progress';
import { accentInk, BRAND_ACCENT } from '@/domain/projectState';
import type { Dish, Subrecipe } from '@/domain/types';
import { detectPlatform, type PlatformInfo } from '@/lib/device';
import { useStore } from '@/state/store';
import { RADIUS, Sheet, text } from '@/components/ui';
import { Onboarding } from './screens/Onboarding';
import { Diagnostic } from './screens/Diagnostic';
import { Blocked, OfflineGate, Paywall } from './screens/Gates';
import { Tour } from './screens/Tour';
import { Celebration, type CelebrationState } from './ruta/Celebration';
import { InstallSheet, shouldShowInstallSheet } from './screens/InstallSheet';
import { Inicio } from './tabs/Inicio';
import { Ruta } from './tabs/Ruta';
import { Costeador, type CostView } from './tabs/Costeador';
import { Numeros, type NumbersView } from './tabs/Numeros';
import { Mas, type SubScreen } from './tabs/Mas';
import { DishEditor } from './costeador/DishEditor';
import { SubrecipeEditor } from './costeador/SubrecipeEditor';
import { EVENTOS_PROPIOS, eventoPropio } from '@/content/medicion';

type Screen = 'onboarding' | 'result' | 'app' | 'dish' | 'subedit' | 'paywall';
export type Tab = 'inicio' | 'ruta' | 'costeador' | 'numeros' | 'mas';

const TABS: Array<{ id: Tab; label: string; Icon: typeof Home }> = [
  { id: 'inicio', label: 'Inicio', Icon: Home },
  { id: 'ruta', label: 'Mi Ruta', Icon: ListChecks },
  { id: 'costeador', label: 'Costeador', Icon: Calculator },
  { id: 'numeros', label: 'Números', Icon: TrendingUp },
  { id: 'mas', label: 'Más', Icon: MoreHorizontal },
];

const FAB_ACTIONS = [
  { id: 'platillo', label: 'Nuevo platillo', hint: 'Costea un platillo desde cero' },
  { id: 'gasto', label: 'Nuevo gasto de apertura', hint: 'Un concepto más en tu presupuesto' },
  { id: 'tarea', label: 'Nueva tarea pendiente', hint: 'Agrégala a un módulo de tu ruta' },
  { id: 'proveedor', label: 'Nuevo proveedor', hint: 'Quién te surte y en qué condiciones' },
  { id: 'nota', label: 'Nueva nota', hint: 'Lo que no quieres olvidar' },
] as const;

export function App() {
  const {
    state,
    patch,
    update,
    replace,
    entitlement,
    can,
    online,
    refreshEntitlement,
    claim,
    activate,
    toast,
    flash,
    deviceId,
    user,
    authReady,
    register,
    login,
    logout,
  } = useStore();

  // La app arranca en el tablero: si no hay sesión, el efecto de arriba se
  // lleva al usuario a /cuenta antes de que se pinte nada.
  const [screen, setScreen] = useState<Screen>('app');
  const [tab, setTab] = useState<Tab>('inicio');
  const [obStep, setObStep] = useState(0);
  // null = Mi Ruta enseña sus tres etapas; con id, el módulo abierto.
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [openTaskKey, setOpenTaskKey] = useState<string | null>(null);
  const [costView, setCostView] = useState<CostView>('platillos');
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);
  /**
   * La hoja de instalación se MARCA al terminar de crear la cuenta pero se
   * MUESTRA cuando el usuario llega al tablero, no en medio del onboarding.
   */
  const [installPending, setInstallPending] = useState(false);
  const [numbersView, setNumbersView] = useState<NumbersView>('home');
  const [subScreen, setSubScreen] = useState<SubScreen | null>(null);
  const [dishId, setDishId] = useState<string | null>(null);
  const [subrecipeId, setSubrecipeId] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [platform, setPlatform] = useState<PlatformInfo>(() => detectPlatform());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setPlatform(detectPlatform());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  /**
   * Al completar una tarea hay celebración: confeti, el salto de porcentaje y
   * el conteo del módulo. Se calcula con el avance de antes y el de después.
   */
  const celebrateTask = (key: string) => {
    const antes = projectProgress({
      modules: ROUTE_MODULES,
      done: state.done,
      skipped: state.skipped,
      extraTasks: state.extraTasks,
    });
    const despues = projectProgress({
      modules: ROUTE_MODULES,
      done: { ...state.done, [key]: true },
      skipped: state.skipped,
      extraTasks: state.extraTasks,
    });
    const modulo = despues.modules.find((m) => m.tasks.some((t) => t.key === key));
    const tarea = modulo?.tasks.find((t) => t.key === key);
    if (!modulo || !tarea) return;
    const completo = modulo.done >= modulo.total;
    setCelebration({
      task: tarea.title,
      from: antes.pct,
      to: despues.pct,
      moduleDone: completo,
      sub: completo
        ? `Terminaste el módulo ${modulo.name} completo`
        : `${modulo.done} de ${modulo.total} en ${modulo.name}`,
    });
  };

  // El tema y el acento se aplican al contenedor raíz de la app.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', state.settings.accent);
    // La tinta sobre el acento sólido se recalcula con el color elegido: con el
    // naranja va oscura, con el azul o el carbón va clara.
    root.style.setProperty('--on-accent', accentInk(state.settings.accent));
    // Con el naranja de marca mandan los hexadecimales del diseño; con
    // cualquier otro acento la rampa se deriva (ver globals.css).
    if (state.settings.accent.toLowerCase() === BRAND_ACCENT.toLowerCase()) root.removeAttribute('data-accent');
    else root.setAttribute('data-accent', 'custom');
    root.setAttribute('data-theme', state.settings.dark ? 'dark' : 'light');
  }, [state.settings.accent, state.settings.dark]);

  // Al volver del checkout, la app reclama la licencia sola: cada 2.5 s hasta ~100 s.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!new URLSearchParams(window.location.search).has('pago')) return;
    let tries = 0;
    const id = setInterval(async () => {
      tries += 1;
      const ok = await claim();
      if (ok || tries >= 40) {
        clearInterval(id);
        if (ok) flash('Pago confirmado · acceso de por vida');
      }
    }, 2500);
    return () => clearInterval(id);
  }, [claim, flash]);

  /**
   * Sin sesión no hay app: se manda a `/cuenta`, que es donde vive el acceso
   * desde la entrega v2. Antes el formulario era una pantalla interna, y salir
   * de él con el botón de atrás metía al usuario a la sesión anterior.
   *
   * `?entrar` y `?crear` siguen funcionando —la landing los usa— pero ahora
   * llevan a la página de acceso en lugar de a una pantalla de la app.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const quiere = params.has('crear') ? 'signup' : params.has('entrar') ? 'login' : null;
    if (quiere) {
      window.location.href = `/cuenta#${quiere}`;
      return;
    }
    if (authReady && !user) window.location.href = '/cuenta#login';
  }, [authReady, user]);

  /**
   * Cuenta sin diagnóstico contestado: se manda al onboarding.
   *
   * Es una decisión de **arranque** y por eso se toma una sola vez: si se
   * volviera a tomar, "Repetir mi diagnóstico" no podría salir de él.
   */
  const arranque = useRef(false);
  useEffect(() => {
    if (arranque.current || !authReady || !user) return;
    arranque.current = true;
    if (Object.keys(state.answers).length < ONBOARDING_QUESTIONS.length) {
      setObStep(0);
      setScreen('onboarding');
      // Cuenta nueva: la hoja de instalación sale al llegar al tablero.
      setInstallPending(true);
    }
  }, [authReady, user, state.answers]);

  const diagnosis = useMemo(
    () => diagnose({ state, modules: ROUTE_MODULES, showFigures: can.showsInvestmentFigures }),
    [state, can.showsInvestmentFigures],
  );

  const blocked = entitlement?.level === 'bloqueado';
  // El punto naranja de la campana: sólo con una recomendación de severidad alta.
  const hasAlerts = diagnosis.recommendations.some((r) => r.severity === 'alta');

  const scrollTop = () => scrollRef.current?.scrollTo({ top: 0 });

  const go = (target: Target) => {
    setScreen('app');
    setTab(target.tab);
    setFabOpen(false);
    setSubScreen(null);
    setFormOpen(false);
    if (target.module) setModuleId(target.module);
    setOpenTaskKey(target.task ?? null);
    if (target.tab === 'numeros') setNumbersView((target.view as NumbersView) ?? 'home');
    if (target.tab === 'costeador') setCostView((target.view as CostView) ?? 'platillos');
    if (target.tab === 'mas' && target.view) setSubScreen(target.view as SubScreen);
    scrollTop();
  };

  const newDish = (): string => {
    const id = `d${Date.now()}`;
    const dish: Dish = {
      id,
      name: 'Platillo nuevo',
      price: 0,
      ingredients: [],
      portions: 1,
      extrasPct: 3,
      priceIncludesTax: true,
      deliveryCommission: 28,
      section: 'Fuertes',
      popularity: 'media',
    };
    update((s) => ({ ...s, dishes: [...s.dishes, dish] }));
    return id;
  };

  const openDish = (id?: string) => {
    if (!id && can.dishLimit !== null && state.dishes.length >= can.dishLimit) {
      setScreen('paywall');
      return;
    }
    setDishId(id ?? newDish());
    setScreen('dish');
    setFabOpen(false);
    scrollTop();
  };

  const openSubrecipe = (id?: string) => {
    let target = id;
    if (!target) {
      target = `sr${Date.now()}`;
      const sub: Subrecipe = { id: target, name: 'Sub-receta nueva', yieldQty: 1000, unit: 'ml', ingredients: [] };
      update((s) => ({ ...s, subrecipes: [...s.subrecipes, sub] }));
    }
    setSubrecipeId(target);
    setScreen('subedit');
    setFabOpen(false);
    scrollTop();
  };

  const runFabAction = (id: (typeof FAB_ACTIONS)[number]['id']) => {
    setFabOpen(false);
    setFormOpen(true);
    switch (id) {
      case 'platillo':
        openDish();
        break;
      case 'gasto':
        go({ tab: 'numeros', view: 'presupuesto' });
        break;
      case 'tarea':
        go({ tab: 'ruta' });
        break;
      case 'proveedor':
        go({ tab: 'mas', view: 'proveedores' });
        break;
      case 'nota':
        go({ tab: 'mas', view: 'notas' });
        break;
    }
  };

  const dish = state.dishes.find((d) => d.id === dishId);
  const subrecipe = state.subrecipes.find((s) => s.id === subrecipeId);

  const body = (() => {
    if (screen === 'onboarding') {
      return (
        <Onboarding
          step={obStep}
          answers={state.answers}
          onAnswer={(id, option) =>
            update((s) => ({
              ...s,
              answers: { ...s.answers, [id]: option },
              project: id === 'giro' ? { ...s.project, giro: option } : s.project,
            }))
          }
          onBack={() => {
            // En el primer paso, atrás sale de la app a la página de acceso.
            if (obStep === 0) window.location.href = '/cuenta#login';
            else setObStep((n) => n - 1);
          }}
          onNext={() => {
            if (obStep === ONBOARDING_QUESTIONS.length - 1) {
              // Fin del diagnóstico. Se cuenta una sola vez por cuenta: el
              // diagnóstico se puede rehacer desde Más, y sin la bandera cada
              // repetición mandaría otro evento e inflaría la conversión.
              if (!state.settings.diagnosticoMedido) {
                eventoPropio(EVENTOS_PROPIOS.diagnosticoCompletado);
                patch({ settings: { ...state.settings, diagnosticoMedido: true } });
              }
              setScreen('result');
            } else setObStep((n) => n + 1);
          }}
        />
      );
    }

    if (screen === 'result') {
      return (
        <Diagnostic
          diagnosis={diagnosis}
          giro={state.project.giro}
          hasTemplate={state.project.giro !== 'Otro'}
          onEnter={() => {
            setScreen('app');
            setTab('inicio');
            if (!state.settings.tourDone) setTourStep(0);
          }}
          onLoadTemplate={() => {
            setScreen('app');
            setTab('mas');
            setSubScreen('plantilla');
          }}
        />
      );
    }

    if (screen === 'paywall') {
      return (
        <Paywall
          entitlement={entitlement}
          onClose={() => setScreen('app')}
          onClaim={claim}
          onCheckout={() => {
            // El cobro vive en `/pago`, con el Payment Element de Stripe. Al
            // volver, `?pago=1` dispara la activación automática.
            window.location.href = '/pago';
          }}
        />
      );
    }

    if (screen === 'dish' && dish) {
      return (
        <DishEditor
          dish={dish}
          state={state}
          onBack={() => {
            setScreen('app');
            setTab('costeador');
          }}
          onChange={(fn) => update((s) => ({ ...s, dishes: s.dishes.map((d) => (d.id === dish.id ? fn(d) : d)) }))}
          onDuplicate={() => {
            const copy: Dish = { ...structuredClone(dish), id: `d${Date.now()}`, name: `${dish.name} (copia)` };
            update((s) => ({ ...s, dishes: [...s.dishes, copy] }));
            setDishId(copy.id);
            flash('Platillo duplicado');
          }}
          onDelete={() => {
            update((s) => ({ ...s, dishes: s.dishes.filter((d) => d.id !== dish.id) }));
            setScreen('app');
            setTab('costeador');
            flash('Platillo eliminado');
          }}
          onPrint={() => window.open(`/print/ficha-tecnica?platillo=${dish.id}`, '_blank', 'noopener')}
          onFlash={flash}
        />
      );
    }

    if (screen === 'subedit' && subrecipe) {
      return (
        <SubrecipeEditor
          subrecipe={subrecipe}
          subrecipes={state.subrecipes}
          onBack={() => {
            setScreen('app');
            setTab('costeador');
            setCostView('subrecetas');
          }}
          onChange={(fn) =>
            update((s) => ({ ...s, subrecipes: s.subrecipes.map((x) => (x.id === subrecipe.id ? fn(x) : x)) }))
          }
          onDelete={() => {
            update((s) => ({ ...s, subrecipes: s.subrecipes.filter((x) => x.id !== subrecipe.id) }));
            setScreen('app');
            setTab('costeador');
            setCostView('subrecetas');
            flash('Sub-receta eliminada');
          }}
          onFlash={flash}
        />
      );
    }

    if (blocked && tab !== 'mas') {
      return (
        <Blocked
          onOpenPaywall={() => setScreen('paywall')}
          onGoMore={() => setTab('mas')}
          onBackup={() => {
            setTab('mas');
            setSubScreen('respaldo');
          }}
        />
      );
    }

    switch (tab) {
      case 'inicio':
        return (
          <Inicio
            state={state}
            diagnosis={diagnosis}
            licensed={!!entitlement?.licensed}
            trial={
              entitlement && !entitlement.licensed
                ? { daysLeft: entitlement.trial.daysLeft, expired: entitlement.trial.expired }
                : null
            }
            startedAt={entitlement?.trial.startedAt ?? null}
            hasAlerts={hasAlerts}
            onGo={go}
            onOpenProject={() => {
              setTab('mas');
              setSubScreen('proyecto');
            }}
            onOpenProfile={() => {
              setTab('mas');
              setSubScreen('perfil');
            }}
            onOpenAlerts={() => {
              setTab('mas');
              setSubScreen('alertas');
            }}
            onOpenPaywall={() => setScreen('paywall')}
            onOpenDoc={() => window.open('/print/plan-de-apertura', '_blank', 'noopener')}
            onNewDish={openDish}
            onKeepExample={() => {
              patch({ settings: { ...state.settings, exampleHidden: true } });
              flash('Puedes editar o borrar los ejemplos cuando quieras');
            }}
            onClearExample={() => {
              update((s) => ({
                ...s,
                dishes: [],
                subrecipes: [],
                settings: { ...s.settings, exampleHidden: true },
              }));
              flash('Listo, empiezas en blanco');
            }}
          />
        );

      case 'ruta':
        return (
          <Ruta
            state={state}
            level={entitlement?.level ?? 'bloqueado'}
            moduleId={moduleId}
            openTaskKey={openTaskKey}
            formOpen={formOpen}
            onSelectModule={(id) => {
              setModuleId(id);
              setOpenTaskKey(null);
            }}
            onToggleTask={(key) => {
              const marcando = !state.done[key];
              update((s) => ({ ...s, done: { ...s.done, [key]: !s.done[key] } }));
              if (marcando) celebrateTask(key);
            }}
            onSkipModule={(id, reason) => {
              update((s) => ({ ...s, skipped: { ...s.skipped, [id]: reason } }));
              flash('Módulo omitido');
            }}
            onRestoreModule={(id) =>
              update((s) => {
                const skipped = { ...s.skipped };
                delete skipped[id];
                return { ...s, skipped };
              })
            }
            onAddTask={(module, title, hint) =>
              update((s) => ({
                ...s,
                extraTasks: [...s.extraTasks, { id: `${Date.now()}`, moduleId: module, title, hint }],
              }))
            }
            onDeleteTask={(id) =>
              update((s) => ({ ...s, extraTasks: s.extraTasks.filter((x) => x.id !== id) }))
            }
            onOpenTask={setOpenTaskKey}
            onOpenProject={() => {
              setTab('mas');
              setSubScreen('proyecto');
              scrollTop();
            }}
            onOpenProfile={() => {
              setTab('mas');
              setSubScreen('perfil');
              scrollTop();
            }}
            onOpenAlerts={() => {
              setTab('mas');
              setSubScreen('alertas');
              scrollTop();
            }}
            hasAlerts={hasAlerts}
            onOpenPaywall={() => setScreen('paywall')}
            onOpenOverview={() => {
              setTab('mas');
              setSubScreen('mapa');
            }}
            onOpenTool={(tool) => {
              setTab('mas');
              setSubScreen(tool);
            }}
          />
        );

      case 'costeador':
        return (
          <Costeador
            state={state}
            view={costView}
            level={entitlement?.level ?? 'bloqueado'}
            can={can}
            onChangeView={setCostView}
            onOpenDish={openDish}
            onNewDish={() => openDish()}
            onOpenSubrecipe={openSubrecipe}
            onNewSubrecipe={() => openSubrecipe()}
            onOpenPaywall={() => setScreen('paywall')}
            onOpenProfile={() => {
              setTab('mas');
              setSubScreen('perfil');
              scrollTop();
            }}
            onOpenAlerts={() => {
              setTab('mas');
              setSubScreen('alertas');
              scrollTop();
            }}
            onOpenProject={() => {
              setTab('mas');
              setSubScreen('proyecto');
              scrollTop();
            }}
            onOpenGuide={() => {
              setTab('mas');
              setSubScreen('faq');
              scrollTop();
            }}
            hasAlerts={hasAlerts}
            onUpdate={update}
            onFlash={flash}
          />
        );

      case 'numeros':
        return (
          <Numeros
            state={state}
            view={numbersView}
            can={can}
            formOpen={formOpen}
            onChangeView={setNumbersView}
            onOpenProfile={() => {
              setTab('mas');
              setSubScreen('perfil');
              scrollTop();
            }}
            onOpenAlerts={() => {
              setTab('mas');
              setSubScreen('alertas');
              scrollTop();
            }}
            onOpenProject={() => {
              setTab('mas');
              setSubScreen('proyecto');
              scrollTop();
            }}
            hasAlerts={hasAlerts}
            onPatch={patch}
            onOpenPaywall={() => setScreen('paywall')}
            onPrint={() => window.open('/print/resumen-financiero', '_blank', 'noopener')}
            onFlash={flash}
          />
        );

      case 'mas':
        return (
          <Mas
            state={state}
            sub={subScreen}
            entitlement={entitlement}
            can={can}
            platform={platform}
            diagnosis={diagnosis}
            formOpen={formOpen}
            onOpenSub={setSubScreen}
            onPatch={patch}
            onReplace={replace}
            onGo={go}
            onOpenPaywall={() => setScreen('paywall')}
            onFlash={flash}
            onRestartDiagnosis={() => {
              setObStep(0);
              setScreen('onboarding');
            }}
            onStartTour={() => {
              setScreen('app');
              setSubScreen(null);
              setTourStep(0);
            }}
            onActivate={activate}
            onLogout={async () => {
              await logout();
              // Cerrar sesión saca de la app: el proyecto se queda en el
              // servidor, intacto, esperando el siguiente inicio de sesión.
              window.location.href = '/cuenta#login';
            }}
          />
        );
    }
  })();

  return (
    <div className="mrl-shell">
      {/* El hueco de abajo cambia según haya botón flotante que esquivar. */}
      <div className={screen === 'app' ? 'mrl-scroll mrl-scroll-fab' : 'mrl-scroll'} ref={scrollRef}>
        {body}
      </div>

      {screen === 'app' ? (
        <>
          <button
            type="button"
            className="mrl-fab"
            aria-label="Agregar algo nuevo"
            onClick={() => setFabOpen(true)}
          >
            <Plus size={26} strokeWidth={2.8} />
          </button>

          <nav className="mrl-nav" aria-label="Navegación principal">
            {TABS.map(({ id, label, Icon }) => {
              const active = tab === id;
              const disabled = blocked && id !== 'mas';
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTab(id);
                    setSubScreen(null);
                    setNumbersView('home');
                    setFormOpen(false);
                    scrollTop();
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    display: 'grid',
                    justifyItems: 'center',
                    gap: 4,
                    padding: '6px 0',
                    cursor: 'pointer',
                    opacity: disabled ? 0.4 : 1,
                    /*
                      El rótulo de la pestaña activa iba en el naranja de marca
                      a 10.5px: 2.03:1 contra el fondo de la barra. El 800 de la
                      misma rampa da 6.3 y sigue distinguiéndose del gris.
                    */
                    color: active ? 'var(--color-accent-800)' : text(50),
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <Icon size={21} strokeWidth={2.6} />
                  <span style={{ fontSize: 10.5, fontWeight: 700 }}>{label}</span>
                </button>
              );
            })}
          </nav>
        </>
      ) : null}

      {fabOpen ? (
        <Sheet title="Agregar algo nuevo" onClose={() => setFabOpen(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            {FAB_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => runFabAction(action.id)}
                style={{
                  textAlign: 'left',
                  border: '1.5px solid var(--color-divider)',
                  borderRadius: RADIUS.inner,
                  background: 'transparent',
                  color: 'var(--color-text)',
                  padding: 14,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{action.label}</div>
                <div style={{ fontSize: 12, color: text(60), marginTop: 2 }}>{action.hint}</div>
              </button>
            ))}
          </div>
        </Sheet>
      ) : null}

      {tourStep !== null ? (
        <Tour
          step={tourStep}
          onNext={() => {
            const next = tourStep + 1;
            if (next >= TOUR_STEPS.length) {
              setTourStep(null);
              patch({ settings: { ...state.settings, tourDone: true } });
              return;
            }
            setTourStep(next);
            const step = TOUR_STEPS[next];
            setTab(step.tab as Tab);
            if (step.view) setCostView(step.view as CostView);
            scrollTop();
          }}
          onSkip={() => {
            setTourStep(null);
            patch({ settings: { ...state.settings, tourDone: true } });
          }}
        />
      ) : null}

      {toast ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 112,
            zIndex: 70,
            padding: '12px 18px',
            borderRadius: RADIUS.pill,
            background: 'var(--color-neutral-900)',
            color: 'var(--color-neutral-100)',
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: 'var(--shadow-lg)',
            animation: 'mrlToast .2s ease both',
            maxWidth: '88%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {toast}
        </div>
      ) : null}

      {screen === 'app' && shouldShowInstallSheet(platform, installPending) ? (
        <InstallSheet platform={platform} onClose={() => setInstallPending(false)} onFlash={flash} />
      ) : null}

      {celebration ? <Celebration state={celebration} onClose={() => setCelebration(null)} /> : null}

      {!online ? <OfflineGate onRetry={refreshEntitlement} /> : null}
    </div>
  );
}

/** Claves de tareas de seed: se exportan para las pruebas del flujo. */
export { taskKey, DEFAULT_FOOD_COST_TARGET };
