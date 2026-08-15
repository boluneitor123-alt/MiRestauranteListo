import type { NextConfig } from 'next';

/**
 * El producto exige conexión por diseño: no se registra service worker ni caché
 * offline (README § 1.12 y § 13).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
