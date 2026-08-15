import Link from 'next/link';

/**
 * Raíz temporal: la landing de venta (README § 12) va aquí cuando se implemente
 * el paso 6 del plan.
 */
export default function Home() {
  return (
    <main style={{ padding: '80px 28px', maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 40, lineHeight: 1.02, letterSpacing: '-.02em' }}>
        MiRestauranteListo
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.5, color: 'color-mix(in srgb, var(--color-text) 70%, transparent)' }}>
        Abre tu negocio de comida sin adivinar: en qué etapa estás, qué te falta, cuánto invertir, cuánto cobrar y
        cuánto vender.
      </p>
      <p style={{ marginTop: 26 }}>
        <Link href="/app" style={{ color: 'var(--color-accent-700)', fontWeight: 700 }}>
          Entrar a la app →
        </Link>
      </p>
    </main>
  );
}
