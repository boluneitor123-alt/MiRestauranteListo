'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { FB_PIXEL_ID } from '@/content/medicion';

/**
 * `PageView` en cada cambio de ruta.
 *
 * El código base del píxel dispara `PageView` una sola vez al cargar. Next
 * navega sin recargar, así que sin esto todo el tráfico se vería como una sola
 * vista y el embudo se pierde.
 *
 * La primera vez no dispara: esa vista ya la mandó el código base del `layout`.
 * Sin esa guarda, cada visita cuenta doble desde el principio.
 */
export function PixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    try {
      window.fbq?.('track', 'PageView');
    } catch {
      // La medición no interrumpe la navegación.
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Código base del píxel de Meta.
 *
 * Va con `afterInteractive` para que no compita con la primera pintura: mucha
 * de esta gente abre la landing con datos en la calle, y `fbevents.js` pesa
 * unos 70 KB. Nada de la página depende de que cargue.
 */
export function PixelBase() {
  return (
    <>
      <Script id="fb-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${FB_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
