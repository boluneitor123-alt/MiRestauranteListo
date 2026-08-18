'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '../print.css';
import { emptyProjectState, importBackup, type ProjectState } from '@/domain/projectState';
import { FichaTecnica } from '@/components/print/FichaTecnica';

const STATE_KEY = 'mrl.state.v3';

/**
 * Ficha técnica imprimible. Lee lo que el usuario capturó y se exporta a PDF
 * desde el diálogo de impresión; el mismo componente sirve para generarla del
 * lado servidor.
 */
export default function FichaTecnicaPage() {
  return (
    <Suspense fallback={null}>
      <FichaTecnicaDocument />
    </Suspense>
  );
}

function FichaTecnicaDocument() {
  const params = useSearchParams();
  const [state, setState] = useState<ProjectState>(() => emptyProjectState());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw) setState(importBackup(JSON.parse(raw)));
    } catch {
      // Sin datos capturados se imprime el documento vacío.
    }
  }, []);

  const dishId = params.get('platillo');
  const dishes = useMemo(
    () => (dishId ? state.dishes.filter((d) => d.id === dishId) : state.dishes),
    [state.dishes, dishId],
  );
  const date = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <>
      <div className="print-actions">
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            height: 44,
            padding: '0 18px',
            borderRadius: 999,
            border: 'none',
            background: '#c67139',
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Imprimir o guardar como PDF
        </button>
      </div>

      <div className="doc">
        {dishes.length ? (
          dishes.map((dish) => (
            <FichaTecnica
              key={dish.id}
              dish={dish}
              project={state.project.name}
              ctx={{ subrecipes: state.subrecipes }}
              date={date}
              targetFoodCost={state.fcTarget}
            />
          ))
        ) : (
          <p>Todavía no tienes platillos costeados. Costea uno en el Costeador y vuelve a abrir esta ficha.</p>
        )}
      </div>
    </>
  );
}
