'use client';

import { useEffect, useState } from 'react';
import '../print.css';
import { emptyProjectState, importBackup, type ProjectState } from '@/domain/projectState';
import { PlanDeApertura } from '@/components/print/PlanDeApertura';

const STATE_KEY = 'mrl.state.v3';

/** Plan de apertura imprimible (README § 9). */
export default function PlanDeAperturaPage() {
  const [state, setState] = useState<ProjectState>(() => emptyProjectState());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw) setState(importBackup(JSON.parse(raw)));
    } catch {
      // Sin datos capturados se imprime el documento vacío.
    }
  }, []);

  const today = new Date();
  const date = today.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

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
        <PlanDeApertura state={state} date={date} today={today} />
      </div>
    </>
  );
}
