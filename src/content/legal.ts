// Portado de `entrega-v2/app/LegalMRL.dc.html`. El texto va tal cual.
// Lo único que no se copia son las cifras: el precio, los días de prueba y los
// de garantía salen de LICENSE_DEFAULTS, para que el documento no se
// desfase de lo que el producto cobra y ofrece de verdad.

import { LICENSE_DEFAULTS } from '@/domain/license';
import { money } from '@/domain/format';

export const TITULAR = 'Araceli Pizano Flores';
export const DOMICILIO =
  'José Antonio García Jimeno 1001, interior 9, Colonia Jardines de la Hacienda, C.P. 76180, Querétaro, Querétaro';
export const CORREO = 'hola@mirestaurantelisto.com';

/**
 * Fecha de la versión publicada. Va escrita a mano y no se calcula: un
 * documento legal dice cuándo se actualizó, no "hoy".
 */
export const ACTUALIZADO = '23 de agosto de 2026';

const PRECIO = `${money(LICENSE_DEFAULTS.price)} MXN`;
const PRUEBA = LICENSE_DEFAULTS.trialDays;
const GARANTIA = LICENSE_DEFAULTS.warrantyDays;

export interface LegalSection {
  id: string;
  title: string;
  body: string[];
  list?: string[];
}

export interface LegalDoc {
  /** Ruta donde vive. */
  slug: string;
  title: string;
  /** La línea gris bajo el título. */
  sub: string;
  sections: LegalSection[];
}

const TERMINOS: LegalSection[] = [
  {
    id: 'quienes',
    title: 'Quiénes somos',
    body: [
      `MiRestauranteListo es un producto digital operado por ${TITULAR}, con domicilio en ${DOMICILIO}. Puedes contactarnos en ${CORREO}.`,
      'Al crear una cuenta, pagar o usar el sitio y la aplicación aceptas estos términos. Si no estás de acuerdo, no uses el servicio.',
    ],
  },
  {
    id: 'que-es',
    title: 'Qué es el servicio',
    body: [
      'MiRestauranteListo es una herramienta de planeación y aprendizaje para personas que quieren abrir o mejorar un negocio de comida. Incluye lecciones, calculadoras, plantillas y documentos que se generan con los datos que tú capturas.',
      'El servicio te da método y cálculo. No te da dinero, ni permisos, ni proveedores, ni clientes: eso lo consigues tú.',
    ],
  },
  {
    id: 'no-asesoria',
    title: 'Esto no es asesoría profesional',
    body: [
      'El contenido de MiRestauranteListo es informativo y educativo. No constituye asesoría financiera, fiscal, contable, legal ni sanitaria.',
      'Los cálculos que produce la aplicación —punto de equilibrio, costos, precios sugeridos, presupuestos— se basan exclusivamente en los datos que tú capturas. Si capturas datos equivocados, el resultado será equivocado.',
      'Antes de firmar un contrato, contratar personal, tramitar permisos o comprometer dinero, consulta a un profesional con licencia en tu localidad. Las reglas cambian entre estados y municipios.',
    ],
  },
  {
    id: 'sin-garantia',
    title: 'No garantizamos resultados',
    body: [
      'No prometemos que vayas a abrir tu negocio, que vayas a ganar dinero, ni que evites pérdidas. El resultado de un negocio depende de decisiones, ejecución, ubicación, mercado y factores fuera de nuestro control.',
      'Cualquier ejemplo, cifra o escenario que aparezca en el producto es ilustrativo, no una proyección de tus resultados.',
    ],
  },
  {
    id: 'cuenta',
    title: 'Tu cuenta',
    body: [
      'Necesitas una cuenta para usar el servicio. Eres responsable de la información que registras y de mantener tu contraseña segura.',
      'Una cuenta es para una persona. No compartas tu acceso, no lo revendas y no lo uses para redistribuir el contenido.',
      'Podemos suspender o cancelar una cuenta que comparta accesos, copie el contenido para redistribuirlo, intente vulnerar el servicio o incumpla estos términos.',
    ],
  },
  {
    id: 'prueba',
    title: `Prueba de ${PRUEBA} días`,
    body: [
      `Ofrecemos ${PRUEBA} días de prueba sin costo y sin tarjeta de crédito. Durante la prueba tienes acceso al contenido que se indique en la aplicación.`,
      'Si no pagas al terminar la prueba, tu cuenta y tus datos se conservan, pero pierdes el acceso al contenido de pago. Puedes pagar después y recuperar tu acceso con tu proyecto intacto.',
    ],
  },
  {
    id: 'pago',
    title: 'Pago único y acceso',
    body: [
      `MiRestauranteListo se vende por un pago único de ${PRECIO}. No hay suscripción, no hay cargos recurrentes y no renovamos nada automáticamente.`,
      '"Acceso de por vida" significa: mientras el servicio siga operando, y sin límite de tiempo por tu parte. No significa que exista una obligación perpetua de operar el servicio. Si algún día decidiéramos cerrarlo, te avisaríamos con al menos 90 días de anticipación y te daríamos forma de exportar tu proyecto.',
      'Los pagos se procesan a través de Stripe. Nosotros no almacenamos tu número de tarjeta.',
    ],
  },
  {
    id: 'garantia',
    title: `Garantía de ${GARANTIA} días`,
    body: [
      `Si pagas y el producto no te sirve, puedes pedir tu reembolso completo dentro de los ${GARANTIA} días naturales siguientes a la fecha del pago.`,
      `Para solicitarlo, escribe a ${CORREO} desde el correo con el que compraste. No necesitas dar explicaciones.`,
      'El reembolso se hace por la misma vía del pago. El tiempo en que aparece en tu estado de cuenta depende de tu banco, normalmente entre 5 y 10 días hábiles. Al reembolsarte, tu acceso al contenido de pago termina.',
    ],
  },
  {
    id: 'contenido',
    title: 'Contenido y propiedad',
    body: [
      `Las lecciones, textos, ilustraciones, calculadoras, plantillas y el diseño de MiRestauranteListo son propiedad de ${TITULAR} y están protegidos por las leyes de propiedad intelectual.`,
      'Tu pago te da una licencia personal, intransferible y no exclusiva para usar el contenido. No te transfiere la propiedad.',
      'Puedes usar los documentos que genera la aplicación —tu plan, tu carta, tus fichas técnicas, tus resúmenes— libremente en tu negocio, imprimirlos y compartirlos con tus socios, contador o banco. Eso es tuyo.',
      'No puedes copiar, revender, redistribuir ni publicar el contenido de las lecciones ni las herramientas.',
    ],
  },
  {
    id: 'datos',
    title: 'Tus datos y tu proyecto',
    body: [
      'Los datos de tu proyecto son tuyos. Puedes exportarlos y borrarlos desde la aplicación en cualquier momento.',
      'Hacemos respaldos, pero no somos un sistema de archivo. Si tu proyecto es importante, exporta tu respaldo de vez en cuando.',
    ],
  },
  {
    id: 'responsabilidad',
    title: 'Límite de responsabilidad',
    body: [
      'En la medida que la ley lo permita, nuestra responsabilidad total frente a ti por cualquier reclamación relacionada con el servicio se limita al monto que nos pagaste.',
      'No respondemos por pérdidas indirectas: ganancias no obtenidas, oportunidades perdidas, daños a tu negocio o reputación.',
      'Nada de lo anterior limita derechos que la ley mexicana te otorgue como consumidor y que no puedan renunciarse.',
    ],
  },
  {
    id: 'cambios',
    title: 'Cambios al servicio y a estos términos',
    body: [
      'Mejoramos el producto de forma continua: agregamos contenido, cambiamos funciones y ajustamos el diseño. Eso está incluido en tu acceso, sin costo adicional.',
      'Si cambiamos estos términos de forma significativa, te avisaremos por correo y publicaremos la fecha de actualización. Si no estás de acuerdo con el cambio, puedes dejar de usar el servicio.',
    ],
  },
  {
    id: 'ley',
    title: 'Ley aplicable',
    body: [
      'Estos términos se rigen por las leyes de los Estados Unidos Mexicanos.',
      'Para cualquier controversia, las partes se someten a los tribunales competentes de la ciudad de Querétaro, Querétaro, renunciando a cualquier otro fuero.',
      'Como consumidor, puedes acudir a la Procuraduría Federal del Consumidor (PROFECO) para atender quejas relacionadas con esta compra.',
    ],
  },
];

const PRIVACIDAD: LegalSection[] = [
  {
    id: 'p-responsable',
    title: 'Responsable de tus datos',
    body: [
      `${TITULAR}, con domicilio en ${DOMICILIO}, es responsable del tratamiento de tus datos personales.`,
      `Para cualquier asunto relacionado con tus datos, escribe a ${CORREO}.`,
    ],
  },
  {
    id: 'p-que',
    title: 'Qué datos recabamos',
    body: ['Recabamos únicamente lo necesario para que el servicio funcione:'],
    list: [
      'Datos de identificación: nombre y correo electrónico.',
      'Datos de tu proyecto: los que tú capturas sobre tu negocio — giro, presupuesto, platillos, costos, gastos, avance en la ruta.',
      'Datos de la compra: monto, fecha y estado del pago. Tu tarjeta la procesa y almacena Stripe; nosotros no la vemos ni la guardamos.',
      'Datos técnicos: dirección IP, tipo de navegador y páginas visitadas, para operar y proteger el servicio.',
    ],
  },
  {
    id: 'p-para-que',
    title: 'Para qué los usamos',
    body: ['Usamos tus datos para estas finalidades necesarias:'],
    list: [
      'Crear y mantener tu cuenta, y darte acceso al contenido.',
      'Guardar tu proyecto y generar tus cálculos y documentos.',
      'Procesar tu pago y emitir tu comprobante.',
      'Responder tus dudas y darte soporte.',
      'Cumplir obligaciones fiscales y legales.',
    ],
  },
  {
    id: 'p-secundarias',
    title: 'Finalidades secundarias',
    body: [
      'Si nos lo autorizas, también podemos enviarte correos con novedades del producto, contenido nuevo y consejos para tu negocio.',
      'Esto no es necesario para usar el servicio. Puedes negarte desde el inicio o darte de baja en cualquier momento con el enlace al pie de cada correo, sin que afecte tu acceso.',
    ],
  },
  {
    id: 'p-terceros',
    title: 'Con quién los compartimos',
    body: ['No vendemos tus datos. Los compartimos únicamente con proveedores que nos permiten operar, y solo con lo que necesitan:'],
    list: [
      'Stripe, para procesar pagos.',
      'Nuestro proveedor de alojamiento y base de datos, para guardar tu cuenta y tu proyecto.',
      'Nuestro proveedor de correo, para enviarte mensajes del servicio.',
      'Autoridades, cuando exista una obligación legal.',
    ],
  },
  {
    id: 'p-derechos',
    title: 'Tus derechos ARCO',
    body: [
      'Tienes derecho a Acceder a tus datos, Rectificarlos si son inexactos, Cancelarlos cuando consideres que no se requieren, y Oponerte a su uso para fines específicos. También puedes revocar tu consentimiento.',
      `Para ejercerlos, escribe a ${CORREO} desde el correo de tu cuenta, indicando qué derecho quieres ejercer. Te responderemos en un plazo máximo de 20 días hábiles.`,
      'Buena parte de esto lo puedes hacer tú directamente: desde la aplicación puedes ver, editar, exportar y borrar los datos de tu proyecto.',
    ],
  },
  {
    id: 'p-conservacion',
    title: 'Cuánto tiempo los guardamos',
    body: [
      'Conservamos tus datos mientras tu cuenta exista. Si la borras, eliminamos tu proyecto.',
      'Conservamos los registros de la compra el tiempo que exijan las obligaciones fiscales aplicables, aunque hayas borrado tu cuenta.',
    ],
  },
  {
    id: 'p-seguridad',
    title: 'Cómo los protegemos',
    body: [
      'El sitio usa conexión cifrada. Las contraseñas se guardan cifradas, no en texto plano. El acceso a la base de datos está restringido.',
      'Ningún sistema es infalible. Si ocurriera una vulneración que afecte tus datos de forma significativa, te lo informaríamos.',
    ],
  },
  {
    id: 'p-cookies',
    title: 'Cookies',
    body: [
      'Usamos cookies necesarias para mantener tu sesión abierta y recordar tus preferencias en la aplicación. Sin ellas el servicio no funciona.',
      'Si en el futuro usamos cookies de análisis o publicidad, te lo informaremos y pediremos tu consentimiento.',
    ],
  },
  {
    id: 'p-cambios',
    title: 'Cambios a este aviso',
    body: [
      'Si modificamos este aviso, publicaremos la versión actualizada en esta página con su fecha. Si el cambio es significativo, te avisaremos por correo.',
    ],
  },
];

export const DOC_TERMINOS: LegalDoc = {
  slug: '/terminos',
  title: 'Términos de uso',
  sub: `Última actualización: ${ACTUALIZADO} · MiRestauranteListo`,
  sections: TERMINOS,
};

export const DOC_PRIVACIDAD: LegalDoc = {
  slug: '/privacidad',
  title: 'Aviso de privacidad',
  sub: 'Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares',
  sections: PRIVACIDAD,
};
