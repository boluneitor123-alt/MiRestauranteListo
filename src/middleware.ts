import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/server/auth/names';

/**
 * Puerta del panel de control.
 *
 * El middleware corre en el Edge y no puede consultar la base de datos, así
 * que aquí sólo se rechaza a quien ni siquiera trae sesión. Quién es admin lo
 * decide el servidor con el `role` de la cuenta: la página del panel lo
 * verifica contra `/api/auth/me` y cada ruta de API lo verifica de nuevo con
 * `isAdmin`. Ninguna de esas dos comprobaciones depende del cliente.
 */
export function middleware(request: NextRequest) {
  const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value;
  if (hasSession) return NextResponse.next();

  // Sin sesión, al acceso: es la única puerta del producto.
  const url = request.nextUrl.clone();
  url.pathname = '/cuenta';
  url.search = '';
  url.hash = 'login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
