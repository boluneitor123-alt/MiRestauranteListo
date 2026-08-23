'use client';

import { StoreProvider } from '@/state/store';
import { Cuenta } from '@/components/cuenta/Cuenta';
import './cuenta.css';

/**
 * Crear cuenta · iniciar sesión · recuperar acceso (entrega-v2 § 3).
 *
 * Fuera de `/app` a propósito: el acceso es una página, no una pantalla de la
 * app. Así el botón de atrás del navegador hace lo que se espera.
 */
export default function CuentaPage() {
  return (
    <StoreProvider>
      <Cuenta vistaInicial="signup" />
    </StoreProvider>
  );
}
