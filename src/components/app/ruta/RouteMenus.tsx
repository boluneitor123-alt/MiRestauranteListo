'use client';

import type { CSSProperties } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { courseState, type AccessLevel } from '@/domain/access';
import type { ModuleProgress } from '@/domain/progress';
import { RADIUS } from '@/components/ui';

/** Token de color de un módulo, listo para usar en CSS. */
const cv = (col: string) => `var(--color-${col || 'accent-500'})`;

export type MenuOpen = 'ruta' | 'curso' | null;

/**
 * Los dos menús de Mi Ruta.
 *
 * Antes era una tira de 14 chips con scroll horizontal, que se sentía
 * apretada. Ahora son dos botones: uno ancho con el módulo activo y otro
 * compacto con la estrella y el contador global de los cuatro cursos.
 *
 * Las animaciones que llaman la atención (halo, brillo, chispas, latido)
 * se apagan solas: la de la ruta en cuanto el usuario la abre una vez, la
 * de la estrella en cuanto completa su primera lección de curso.
 */
export function RouteMenus({
  level,
  rutaModules,
  cursoModules,
  current,
  open,
  rutaSeen,
  onToggle,
  onSelect,
}: {
  level: AccessLevel;
  rutaModules: ModuleProgress[];
  cursoModules: ModuleProgress[];
  current: ModuleProgress;
  open: MenuOpen;
  /** El usuario ya abrió el menú de la ruta alguna vez. */
  rutaSeen: boolean;
  onToggle: (which: 'ruta' | 'curso') => void;
  onSelect: (moduleId: string) => void;
}) {
  const openR = open === 'ruta';
  const openC = open === 'curso';
  const onCourse = cursoModules.some((m) => m.id === current.id);

  const cursoDone = cursoModules.reduce((a, m) => a + m.done, 0);
  const cursoTotal = cursoModules.reduce((a, m) => a + m.total, 0);

  // "Virgen": nunca abrió los cursos ni completó una lección de curso.
  const virgin = !openC && !onCourse && cursoDone === 0;
  // La ruta se anuncia mientras el usuario no la haya abierto.
  const rutaVirgin = !openR && !rutaSeen;

  const trigger = (active: boolean, accent: string): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 14px',
    borderRadius: 20,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text)',
    background: 'var(--color-neutral-100)',
    border: `1.5px solid ${active ? accent : 'var(--color-divider)'}`,
    boxShadow: active ? 'var(--shadow-md)' : 'var(--shadow-sm)',
    transition: 'box-shadow .15s ease, border-color .15s ease',
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', minWidth: 0 }}>
        {/* ── Menú 1 · Mi ruta ────────────────────────────────────────── */}
        <button
          type="button"
          className="mrl-tap"
          aria-expanded={openR}
          onClick={() => onToggle('ruta')}
          style={{
            ...trigger(openR, cv(current.col)),
            flex: 1,
            minWidth: 0,
            position: 'relative',
            overflow: 'hidden',
            animation: rutaVirgin ? 'mrlHaloA 2.9s ease-in-out infinite' : 'none',
          }}
        >
          {/* Brillo que recorre el botón mientras no lo ha abierto. */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '32%',
              pointerEvents: 'none',
              background:
                'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent-300) 55%, transparent), transparent)',
              animation: rutaVirgin ? 'mrlSheen 3.8s ease-in-out .4s infinite' : 'none',
              opacity: rutaVirgin ? 1 : 0,
            }}
          />
          {/* El cuadro de color late y se llena por dentro con el avance. */}
          <span
            aria-hidden
            style={{
              width: 26,
              height: 26,
              flex: 'none',
              borderRadius: 9,
              position: 'relative',
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'end stretch',
              background: onCourse ? 'var(--color-neutral-300)' : cv(current.col),
              animation: openR
                ? 'mrlSpinIn .34s cubic-bezier(.2,1.4,.4,1) both'
                : rutaVirgin
                  ? 'mrlBeat 2.9s ease-in-out infinite'
                  : 'none',
            }}
          >
            <span
              style={{
                display: 'block',
                height: `${current.total ? (current.done / current.total) * 100 : 0}%`,
                background: 'color-mix(in srgb, #fff 42%, transparent)',
                transition: 'height .4s cubic-bezier(.2,.9,.3,1)',
              }}
            />
          </span>

          <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span
              style={{
                display: 'block',
                fontSize: 10,
                letterSpacing: '.09em',
                textTransform: 'uppercase',
                fontWeight: 800,
                color: 'var(--color-neutral-600)',
              }}
            >
              {openR ? `Elige uno de los ${rutaModules.length}` : 'Mi ruta · toca para cambiar'}
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                lineHeight: 1.15,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {onCourse ? 'Elige un módulo' : current.name}
            </span>
          </span>

          {/* Tres puntos que se asoman en cascada junto al chevrón. */}
          {rutaVirgin ? (
            <span aria-hidden style={{ display: 'grid', gap: 2, flex: 'none' }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'var(--color-accent-400)',
                    animation: `mrlPeek 1.5s ease-in-out ${(i * 0.16).toFixed(2)}s infinite`,
                  }}
                />
              ))}
            </span>
          ) : null}

          {/* El chevrón vive en un círculo relleno: se lee como control. */}
          <span
            aria-hidden
            style={{
              width: 24,
              height: 24,
              flex: 'none',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: openR ? cv(current.col) : 'var(--color-neutral-200)',
              color: openR ? 'var(--color-bg)' : 'var(--color-neutral-700)',
              transition: 'background .18s ease, color .18s ease',
            }}
          >
            <ChevronDown
              size={14}
              strokeWidth={3}
              style={{ transform: openR ? 'rotate(180deg)' : 'none', transition: 'transform .22s cubic-bezier(.2,.9,.3,1)' }}
            />
          </span>
        </button>

        {/* ── Menú 2 · Puntos extra ───────────────────────────────────── */}
        <button
          type="button"
          className="mrl-tap"
          aria-expanded={openC}
          aria-label={`Puntos extra: ${cursoDone} de ${cursoTotal} lecciones`}
          onClick={() => onToggle('curso')}
          style={{
            ...trigger(openC || onCourse, 'var(--color-accent-2-500)'),
            flex: 'none',
            padding: '11px 13px',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: openC || onCourse ? 'var(--color-accent-2-500)' : 'var(--color-accent-2-300)',
            color: 'var(--color-accent-2-700)',
            position: 'relative',
            overflow: 'hidden',
            animation: virgin ? 'mrlHalo 2.6s ease-in-out infinite' : 'none',
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '38%',
              pointerEvents: 'none',
              background:
                'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent-2-300) 60%, transparent), transparent)',
              animation: virgin ? 'mrlSheen 3.4s ease-in-out infinite' : 'none',
              opacity: virgin ? 1 : 0,
            }}
          />
          <span style={{ position: 'relative', display: 'grid', placeItems: 'center', flex: 'none' }}>
            <Star
              size={17}
              strokeWidth={2.6}
              fill={openC || onCourse ? 'currentColor' : 'none'}
              style={{
                animation: openC
                  ? 'mrlSpinIn .34s cubic-bezier(.2,1.4,.4,1) both'
                  : virgin
                    ? 'mrlNudge 2.6s ease-in-out infinite'
                    : 'none',
              }}
            />
            {/* Tres chispas girando alrededor de la estrella, desfasadas. */}
            {virgin
              ? [0, 1, 2].map((i) => (
                  <Star
                    key={i}
                    aria-hidden
                    size={7}
                    fill="currentColor"
                    style={{
                      position: 'absolute',
                      top: ['-6px', '4px', '-2px'][i],
                      left: ['-7px', '-9px', '13px'][i],
                      color: 'var(--color-accent-2-400)',
                      animation: `mrlTwinkle 2.6s ease-in-out ${(i * 0.55).toFixed(2)}s infinite`,
                      pointerEvents: 'none',
                    }}
                  />
                ))
              : null}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 800,
              fontSize: 13,
              whiteSpace: 'nowrap',
              animation: 'mrlCount .3s cubic-bezier(.2,1.4,.4,1) both',
            }}
          >
            {cursoDone}/{cursoTotal}
          </span>
          <span
            aria-hidden
            style={{
              width: 20,
              height: 20,
              flex: 'none',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: openC ? 'var(--color-accent-2-600)' : 'var(--color-accent-2-100)',
              color: openC ? 'var(--color-bg)' : 'var(--color-accent-2-700)',
              transition: 'background .18s ease, color .18s ease',
            }}
          >
            <ChevronDown
              size={12}
              strokeWidth={3}
              style={{ transform: openC ? 'rotate(180deg)' : 'none', transition: 'transform .22s cubic-bezier(.2,.9,.3,1)' }}
            />
          </span>
        </button>
      </div>

      {/* ── Panel del menú de la ruta ──────────────────────────────────── */}
      {openR ? (
        <div
          style={{
            padding: 8,
            borderRadius: 24,
            background: 'var(--color-neutral-100)',
            boxShadow: 'var(--shadow-md)',
            animation: 'mrlUp .22s ease both',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 2,
          }}
        >
          {rutaModules.map((m) => (
            <button
              key={m.id}
              type="button"
              className="mrl-row"
              onClick={() => onSelect(m.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '10px 11px',
                borderRadius: 18,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
                background: m.id === current.id ? 'var(--color-neutral-200)' : 'transparent',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  flex: 'none',
                  borderRadius: '50%',
                  background: cv(m.col),
                  opacity: m.skipped ? 0.35 : 1,
                }}
              />
              <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 13.5,
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.name}
                </span>
                {/* Cada módulo con su propia barra de avance. */}
                <span
                  aria-hidden
                  style={{
                    display: 'block',
                    marginTop: 5,
                    height: 4,
                    borderRadius: 999,
                    background: 'var(--color-neutral-300)',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      width: `${m.total ? (m.done / m.total) * 100 : 0}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: cv(m.col),
                    }}
                  />
                </span>
              </span>
              <span
                style={{
                  flex: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 800,
                  fontSize: 12,
                  color: m.done === m.total ? 'var(--color-accent-2-700)' : 'var(--color-neutral-600)',
                }}
              >
                {m.skipped ? 'omitido' : `${m.done}/${m.total}`}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {/* ── Panel de los cuatro cursos ─────────────────────────────────── */}
      {openC ? (
        <div
          style={{
            padding: 10,
            borderRadius: 24,
            background: 'var(--color-accent-2-800)',
            color: 'var(--color-bg)',
            boxShadow: 'var(--shadow-md)',
            animation: 'mrlUp .22s ease both',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 2,
          }}
        >
          <div
            style={{
              padding: '4px 10px 8px',
              fontSize: 10,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              fontWeight: 800,
              color: 'var(--color-accent-2-300)',
            }}
          >
            Puntos extra
          </div>
          {cursoModules.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '13px 14px',
                borderRadius: RADIUS.small,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-bg)',
                background: m.id === current.id ? 'color-mix(in srgb, var(--color-bg) 16%, transparent)' : 'transparent',
                textAlign: 'left',
              }}
            >
              <Star size={15} strokeWidth={2.6} fill="currentColor" style={{ flex: 'none' }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700 }}>{m.name}</span>
                <span style={{ display: 'block', marginTop: 2, fontSize: 12, opacity: 0.8 }}>
                  {m.total} lecciones · {courseState(level, m.done)}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
