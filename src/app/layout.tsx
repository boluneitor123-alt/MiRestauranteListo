import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiRestauranteListo',
  description: 'Tu ruta paso a paso para abrir un negocio de comida rentable.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
};

export const viewport: Viewport = {
  // El mismo naranja que el manifest: es el color de la barra del sistema.
  themeColor: '#f5a623',
  width: 'device-width',
  initialScale: 1,
  // Los inputs van a 16px; no hace falta bloquear el zoom del usuario.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Figtree para la app; Archivo, Caveat y Space Mono son de la landing
            y solo bajan sus archivos cuando una regla de landing.css las usa. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=Archivo:wght@400;600;700;800;900&family=Caveat:wght@600;700&family=Space+Mono:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
