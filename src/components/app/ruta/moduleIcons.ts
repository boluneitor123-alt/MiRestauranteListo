/**
 * Los iconos de los 14 módulos: tres trazos cada uno.
 *
 * Copiados tal cual del `const ICO` de
 * `entrega-v2/app/MiRestauranteListo.dc.html`. Están fuera del bloque que lee
 * `scripts/extraer-diseno.mjs` porque viven en la capa de vista del prototipo,
 * no en su contenido; si la entrega cambia un icono, se copia a mano aquí.
 */
export const MODULE_ICONS: Record<string, [string, string, string]> = {
  concepto: ['M9 18h6M10 22h4', 'M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2Z', ''],
  local: ['M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z', 'M9 21v-6h6v6', ''],
  equipamiento: ['M4 3h16v18H4z', 'M4 10h16', 'M8 6.5h.01M8 13.5h.01'],
  proveedores: [
    'M3 7h11v10H3z',
    'M14 10h3.5l2.5 3.5V17h-6',
    'M7 19.4a1.9 1.9 0 1 0 0-.01M17.3 19.4a1.9 1.9 0 1 0 0-.01',
  ],
  personal: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 3.5a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2',
    'M19 21v-2a4 4 0 0 0-3-3.9M16 3.6a3.9 3.9 0 0 1 0 7.4',
  ],
  menu: ['M5 3h14v18H5z', 'M9 8h6M9 12h6M9 16h3', ''],
  costeo: [
    'M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z',
    'M8 6h8',
    'M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4',
  ],
  permisos: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z', 'M14 2v6h6', 'M9 13h6M9 17h4'],
  marketing: [
    'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z',
    'M15.5 8.5a5 5 0 0 1 0 7',
    'M18.5 6a9 9 0 0 1 0 12',
  ],
  apertura: ['M6 21V8l6-4 6 4v13', 'M3 21h18', 'M10 21v-5h4v5'],
  ventas: ['M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z', 'M15.5 8.5a5 5 0 0 1 0 7', ''],
  maps: ['M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z', 'M12 12.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2', ''],
  delivery: [
    'M5 17.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M14 17.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0',
    'M9.8 17.5h4.4M7.5 15 10 7h4l2.5 8',
    'M8.5 7h7',
  ],
  contratar: ['M9 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4', 'M2.5 20a6.5 6.5 0 0 1 13 0', 'M17 11.5h5M19.5 9v5'],
};

/** Los tres trazos de un módulo; vacíos si el módulo no tiene icono propio. */
export const moduleIcon = (id: string): [string, string, string] => MODULE_ICONS[id] ?? ['', '', ''];
