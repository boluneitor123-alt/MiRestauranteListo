'use client';

import { useEffect, useState } from 'react';
import '../print.css';
import { emptyProjectState, importBackup, type ProjectState } from '@/domain/projectState';
import { ResumenFinanciero } from '@/components/print/ResumenFinanciero';

const STATE_KEY = 'mrl.state.v3';

/** Resumen financiero imprimible (README § 9). */
export default function ResumenFinancieroPage() {
  const [state, setState] = useState<ProjectState>(() => emptyProjectState());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw) setState(importBackup(JSON.parse(raw)));
    } catch {
      // Sin datos capturados se imprime el documento vacío.
    }
  }, []);

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
            background: '#d63a26',
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Imprimir o guardar como PDF
        </button>
      </div>

      <div className="doc">
        <ResumenFinanciero state={state} date={date} />
      </div>
    </>
  );
}
