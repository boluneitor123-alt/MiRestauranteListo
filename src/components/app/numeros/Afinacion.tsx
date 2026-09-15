'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { CIUDADES, TAMANOS } from '@/content/estimaciones';
import { ciudadDelPerfil, estaAfinado, nombreDeCiudad } from '@/domain/estimacion';
import type { ProjectState } from '@/domain/projectState';
import { Button, RADIUS } from '@/components/ui';

/**
 * «Afina tu estimación: ¿en qué ciudad y de qué tamaño?»
 *
 * El diagnóstico son doce preguntas y no pregunta estas dos. Ponerlas ahí le
 * cobraría más caro el primer minuto a alguien que todavía no ha visto nada.
 * Aquí, en cambio, ya tiene sus números enfrente y la pregunta se explica
 * sola: la renta que está leyendo salió del dinero que dijo tener, que es un
 * proxy pobre de dónde y de qué tamaño va a abrir.
 *
 * Los montos los recalcula el servidor, no esta pantalla: en prueba Números
 * está en sólo lectura y el navegador no podría guardarlos. Lo que se manda
 * son las dos respuestas.
 */
export function Afinacion({
  state,
  onPatch,
  onFlash,
}: {
  state: ProjectState;
  onPatch: (patch: Partial<ProjectState>) => void;
  onFlash: (message: string) => void;
}) {
  const delPerfil = ciudadDelPerfil(state.profile.city);
  const [ciudad, setCiudad] = useState<string | undefined>(delPerfil);
  const [tamano, setTamano] = useState<string | undefined>(undefined);
  // Con la ciudad tomada del perfil no se vuelve a preguntar; el enlace de al
  // lado abre las opciones para quien se mudó o escribió otra cosa.
  const [preguntarCiudad, setPreguntarCiudad] = useState(!delPerfil);

  /*
    Tres condiciones para aparecer: que los números de abajo sean nuestros —si
    nunca hubo siembra no hay nada que afinar—, que algo siga siendo
    estimación, y que no esté ya contestada.
  */
  if (!state.selloEstimado || !state.estimados.length || estaAfinado(state.answers)) return null;

  const afinar = () => {
    if (!ciudad || !tamano) return;
    onPatch({ answers: { ...state.answers, ciudad, tamano } });
    onFlash('Ajustamos tu renta, tu obra y tu mobiliario');
  };

  return (
    <div
      style={{
        padding: '18px 17px',
        borderRadius: RADIUS.card,
        background: 'var(--color-accent-2-100)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 12,
      }}
    >
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            letterSpacing: '.09em',
            textTransform: 'uppercase',
            fontWeight: 800,
            color: 'var(--color-accent-2-800)',
          }}
        >
          <Sparkles size={13} strokeWidth={2.6} />
          Afina tu estimación
        </span>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, lineHeight: 1.15, marginTop: 7 }}>
          ¿En qué ciudad y de qué tamaño?
        </div>
        <p
          className="mrl-prose"
          style={{ margin: '7px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--color-accent-2-900)' }}
        >
          Tu renta es el gasto que decide si aguantas, y hoy la calculamos con lo que nos dijiste que tienes para
          abrir. Contesta dos cosas y ajustamos tu renta, tu obra y tu mobiliario.
        </p>
      </div>

      {preguntarCiudad ? (
        <Pregunta
          titulo="¿Dónde vas a abrir?"
          opciones={CIUDADES.map((c) => c.opcion)}
          elegida={ciudad}
          onElegir={setCiudad}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0 8px', flexWrap: 'wrap', fontSize: 13 }}>
          <span style={{ minWidth: 0 }}>
            Tomamos <strong>{nombreDeCiudad(state.profile.city)}</strong> de tu perfil.
          </span>
          <button
            type="button"
            onClick={() => {
              setPreguntarCiudad(true);
              setCiudad(undefined);
            }}
            style={{
              // Los 44px son del área tocable, no del renglón: el enlace se
              // lee del tamaño del texto que lo rodea y no como un título.
              minHeight: 44,
              padding: 0,
              border: 'none',
              background: 'none',
              color: 'var(--color-accent-2-800)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            No es ahí
          </button>
        </div>
      )}

      <Pregunta
        titulo="¿De qué tamaño es el local?"
        opciones={TAMANOS.map((t) => t.opcion)}
        elegida={tamano}
        onElegir={setTamano}
      />

      <Button height={48} disabled={!ciudad || !tamano} onClick={afinar}>
        Afinar mi estimación
      </Button>
    </div>
  );
}

function Pregunta({
  titulo,
  opciones,
  elegida,
  onElegir,
}: {
  titulo: string;
  opciones: string[];
  elegida: string | undefined;
  onElegir: (opcion: string) => void;
}) {
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0, minWidth: 0 }}>
      <legend style={{ padding: 0, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{titulo}</legend>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 7 }}>
        {opciones.map((opcion) => {
          const activa = elegida === opcion;
          return (
            <button
              key={opcion}
              type="button"
              onClick={() => onElegir(opcion)}
              aria-pressed={activa}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                minHeight: 46,
                padding: '11px 15px',
                borderRadius: RADIUS.pill,
                border: `1.5px solid ${activa ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                background: activa ? 'var(--color-accent-100)' : 'var(--color-surface)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontSize: 13.5,
                fontWeight: activa ? 700 : 500,
                lineHeight: 1.3,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span style={{ minWidth: 0 }}>{opcion}</span>
              {activa ? <Check size={17} color="var(--color-accent)" strokeWidth={3} style={{ flex: 'none' }} /> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
