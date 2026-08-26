'use client';

import { StoreProvider } from '@/state/store';
import { Cuenta } from '@/components/cuenta/Cuenta';
import '../landing.css';
import './cuenta.css';

/**
 * Crear cuenta · iniciar sesión · recuperar acceso (entrega-v2 § 3).
 *
 * Fuera de `/app` a propósito: el acceso es una página, no una pantalla de la
 * app. Así el botón de atrás del navegador hace lo que se espera.
 *
 * Trae `landing.css` porque habla el mismo idioma visual que la página de
 * venta: los tokens, los botones y la escala de teléfono salen de ahí.
 */
export default function CuentaPage() {
  return (
    <StoreProvider>
      <Cuenta vistaInicial="signup" />
    </StoreProvider>
  );
}
