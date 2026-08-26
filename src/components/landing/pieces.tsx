'use client';

import type { CSSProperties, ReactNode } from 'react';

/**
 * Piezas de la landing: los trazos de los iconos y los envoltorios que se
 * repiten. Los trazos vienen del `const ICON` de `LandingMRL v2.dc.html`.
 */
export const ICON: Record<string, [string, string]> = {
  calc: [
    'M4 4.5A2.5 2.5 0 0 1 6.5 2h11A2.5 2.5 0 0 1 20 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5Z',
    'M8 6h8M8 10.5h.01M12 10.5h.01M16 10.5h.01M8 14.5h.01M12 14.5h.01M16 14.5v3.5M8 18h4',
  ],
  menu: ['M4 11h16a8 8 0 1 0-16 0Z', 'M4.5 14.5h15M6 18h12'],
  permit: ['M8 3h8l4 4v14H4V3h4Z', 'M8 12h8M8 16h5M9.5 3v3h5V3'],
  mkt: ['M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z', 'M15.5 8.5a5 5 0 0 1 0 7'],
  team: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 3.5a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2M18 8v6M21 11h-6',
  ],
  tmpl: [
    'M4 6.5A2.5 2.5 0 0 1 6.5 4h3l2 2.5h6A2.5 2.5 0 0 1 20 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Z',
    'M4 10h16',
  ],
  people: [
    'M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2',
    'M10 3.2a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2M17 3.5a3.6 3.6 0 0 1 0 7M21 20v-2a4 4 0 0 0-3-3.8',
  ],
  shield: ['M12 2.5 4 6v6c0 4.6 3.4 8.6 8 9.5 4.6-.9 8-4.9 8-9.5V6Z', 'm8.6 12 2.3 2.3 4.5-4.6'],
  infin: [
    'M12 12c-2-2.6-3.4-3.8-5.2-3.8a3.8 3.8 0 1 0 0 7.6C8.6 15.8 10 14.6 12 12Z',
    'M12 12c2 2.6 3.4 3.8 5.2 3.8a3.8 3.8 0 1 0 0-7.6C15.4 8.2 14 9.4 12 12Z',
  ],
  head: [
    'M4 13v-1a8 8 0 1 1 16 0v1',
    'M4 13h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm16 0h-2.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1Z',
  ],
  spark: ['m12 2 2.4 6.4L21 10.8l-6.6 2.4L12 19.6l-2.4-6.4L3 10.8l6.6-2.4Z', 'M19 3.5v3M17.5 5h3'],
  map: ['m15 6-6-3-6 3v15l6-3 6 3 6-3V3Z', 'M9 3v15M15 6v15'],
  chart: ['M4 20h16', 'M6.5 16.5V11M11.5 16.5V5.5M16.5 16.5v-4'],
  home: ['M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z', 'M9 21v-6h6v6'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5l3 2'],
  bag: [
    'M7.5 8h9l2.5 11a1.5 1.5 0 0 1-1.5 1.8H6.5A1.5 1.5 0 0 1 5 19Z',
    'M9.5 8V6a2.5 2.5 0 0 1 5 0v2M12 12v4M13.6 12.8a2 2 0 0 0-3.1 1.2c0 1.9 3.1 1 3.1 2.8a2 2 0 0 1-3.1.4',
  ],
  check: [
    'M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5Z',
    'm8.5 11 2.2 2.2 4.6-4.6M8.5 17h7',
  ],
  hands: [
    'm8 12 4-4 4 4',
    'M3 12.5 7.5 8l3 3M21 12.5 16.5 8l-3 3M8 12l-2.5 2.5a2 2 0 0 0 2.8 2.8l.7-.7.7.7a2 2 0 0 0 2.8-2.8',
  ],
  cal: ['M3.5 5.5A2 2 0 0 1 5.5 3.5h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z', 'M3.5 9h17M8 2v4M16 2v4'],
  card: [
    'M2.5 7.5A2.5 2.5 0 0 1 5 5h14a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 19 19H5a2.5 2.5 0 0 1-2.5-2.5Z',
    'M2.5 10h19M6 15h4',
  ],
  back: ['M12 3a9 9 0 1 0 8.5 6', 'M21 3v6h-6'],
  lock: [
    'M4.5 12A2.5 2.5 0 0 1 7 9.5h10a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 21.5H7A2.5 2.5 0 0 1 4.5 19Z',
    'M8.5 9.5V7a3.5 3.5 0 0 1 7 0v2.5',
  ],
  phone: ['M6.5 3.5A2 2 0 0 1 8.5 1.5h7a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2Z', 'M10.5 19h3'],
  cloud: ['M6.5 18.5A4.5 4.5 0 0 1 6 9.6a6 6 0 0 1 11.5 1.5 4 4 0 0 1-.5 7.4Z', 'M12 12v6M9.5 14.5 12 12l2.5 2.5'],
  badge: ['M12 2.5 4 6v6c0 4.6 3.4 8.6 8 9.5 4.6-.9 8-4.9 8-9.5V6Z', 'm8.6 12 2.3 2.3 4.5-4.6'],
  route: ['m15 6-6-3-6 3v15l6-3 6 3 6-3V3Z', 'M9 3v15M15 6v15'],
  alerta: ['M12 3 2 20h20L12 3Z', 'M12 9v5M12 17h.01'],
  flecha: ['M5 12h14', 'M13 6l6 6-6 6'],
  mail: [
    'M3.5 7A2.5 2.5 0 0 1 6 4.5h12A2.5 2.5 0 0 1 20.5 7v10a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 17Z',
    'm4 6.5 8 6 8-6',
  ],
  doc: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z', 'M14 2v6h6M9 13h6M9 17h4'],
  store: [
    'M4 9.5 5.5 4h13L20 9.5',
    'M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M5.5 11.5V20h13v-8.5M10 20v-5h4v5',
  ],
  bulb: ['M9 18h6M10 21.5h4', 'M12 2.5a7 7 0 0 0-4 12.7V18h8v-2.8A7 7 0 0 0 12 2.5Z'],
  chef: ['M7 14h10v5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z', 'M7 14a4 4 0 0 1-.6-7.9 4 4 0 0 1 7.5-1.6 4 4 0 0 1 3.7 9.5'],
  ticket: [
    'M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v2a2 2 0 0 0 0 3.9v2a1.5 1.5 0 0 1-1.5 1.6h-15A1.5 1.5 0 0 1 3 16.4v-2a2 2 0 0 0 0-3.9Z',
    'M14.5 7v11',
  ],
  receipt: ['M5.5 2.5h13v19l-2.2-1.6-2.2 1.6-2.1-1.6L9.7 21l-2.1-1.6L5.5 21Z', 'M9 7h6M9 11h6M9 15h4'],
  star: [
    'm12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.2l7.1-.6Z',
    'm12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.2l7.1-.6Z',
  ],
};

/** El icono de dos trazos que usan todas las listas de la landing. */
export function Ico({
  name,
  size = 21,
  width = 2.3,
  style,
}: {
  name: keyof typeof ICON | string;
  size?: number;
  width?: number;
  style?: CSSProperties;
}) {
  const [d1, d2] = ICON[name] ?? ICON.star;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden
    >
      <path d={d1} />
      <path d={d2} />
    </svg>
  );
}

/** El rótulo en versalitas con su cuadrito ámbar. */
export function Kick({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span className="lp-kick" style={style}>
      <i />
      {children}
    </span>
  );
}

/** La palomita rellena de las listas de "lo que incluye". */
export function Check({ size = 20, color = 'var(--sage-d)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flex: 'none' }} aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 7.7-5.6 5.6a1 1 0 0 1-1.4 0l-2.4-2.4a1 1 0 1 1 1.4-1.4l1.7 1.7 4.9-4.9a1 1 0 0 1 1.4 1.4Z" />
    </svg>
  );
}

/** La flecha de los botones. */
export function Arrow({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** El subrayado a mano que se dibuja bajo una palabra. */
export function Uline({ color = '#F5A623' }: { color?: string }) {
  return (
    <svg
      width="100%"
      height="12"
      viewBox="0 0 300 12"
      preserveAspectRatio="none"
      fill="none"
      className="lp-uline"
      aria-hidden
    >
      <path d="M4 8.5C70 3 220 2 296 6.5" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Una ilustración de Arnold.
 *
 * Trae tres tamaños: el navegador baja el que le sirve. En un teléfono a 360px
 * el héroe se ve a 234px de ancho, así que bajar el archivo de 1000px era pagar
 * datos por píxeles que nadie ve.
 *
 * `width` y `height` son los del archivo, no los de pantalla: con ellos el
 * navegador reserva el hueco antes de que la imagen llegue y la página no
 * salta. El tamaño real lo sigue mandando el CSS.
 */
export function Ilustracion({
  nombre,
  alt,
  ancho,
  alto,
  sizes,
  prioridad = false,
  style,
}: {
  nombre: string;
  alt: string;
  ancho: number;
  alto: number;
  sizes: string;
  /** El héroe: se pide de inmediato porque es lo primero que se ve. */
  prioridad?: boolean;
  style?: CSSProperties;
}) {
  const base = `/img/${nombre}`;
  const juego = (ext: string) => `${base}-480w.${ext} 480w, ${base}-720w.${ext} 720w, ${base}.${ext} ${ancho}w`;
  return (
    // AVIF primero y WebP de respaldo: el AVIF pesa un tercio menos y el
    // navegador que no lo entienda se queda con el WebP sin enterarse.
    // `display: contents` para que el envoltorio no cambie ni un píxel del
    // acomodo: manda el estilo del <img>, igual que antes.
    <picture style={{ display: 'contents' }}>
      <source type="image/avif" srcSet={juego('avif')} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${base}.webp`}
        srcSet={juego('webp')}
        sizes={sizes}
        alt={alt}
        width={ancho}
        height={alto}
        loading={prioridad ? 'eager' : 'lazy'}
        decoding={prioridad ? 'sync' : 'async'}
        fetchPriority={prioridad ? 'high' : 'auto'}
        style={style}
      />
    </picture>
  );
}
