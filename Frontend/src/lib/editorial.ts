export const brand = {
  name: 'Chewy Lab', descriptor: 'GOURMET GUMMY CO.',
  motto: 'Más que una gomita, o eso queremos que creas.',
  origin: 'Guadalajara, Jalisco, México',
};

export const editorialPages: Record<string, { title: string; description: string; label: string; code: string; intro: string; review?: boolean }> = {
  '/manifiesto': { title: 'El manifiesto de Chewy Lab', description: 'Diseño serio. Gomitas con sentido del humor. Conoce el manifiesto de Chewy Lab, una marca de confitería formulada en Guadalajara.', label: 'Manifiesto', code: 'CL / 001', intro: 'Tomarnos el antojo en serio. A nosotros mismos, un poco menos.' },
  '/laboratorios': { title: 'Nuestros laboratorios de sabor', description: 'Explora el universo de Chewy Lab: picor, acidez, notas botánicas y coco. Perfiles de sabor con una presentación innecesariamente solemne.', label: 'Laboratorios', code: 'CL / 002', intro: 'Cuatro formas de justificar una bolsa de dulces con vocabulario de laboratorio.' },
  '/ingredientes': { title: 'Ingredientes, sin letra pequeña', description: 'Consulta ingredientes, información nutrimental y conservación de los productos de Chewy Lab. La etiqueta tiene la última palabra.', label: 'Ingredientes', code: 'CL / 003', intro: 'El empaque puede ser teatral. La composición debe ser clara.' },
  '/preguntas-frecuentes': { title: 'Preguntas frecuentes', description: 'Resuelve tus dudas sobre presentaciones, ingredientes, cuenta, pagos y pedidos de Chewy Lab. Respuestas claras para un antojo bastante específico.', label: 'Preguntas frecuentes', code: 'CL / 004', intro: 'Respuestas directas. Ya usamos suficiente solemnidad en el empaque.' },
  '/envios': { title: 'Envíos y cuidado del pedido', description: 'Conoce cómo preparar tu dirección, consultar el envío antes de pagar y revisar la recepción de tus productos Chewy Lab dentro de México.', label: 'Envíos', code: 'CL / 005', intro: 'La presentación merece llegar entera. Tú mereces saber cómo funciona el envío.' },
  '/contacto': { title: 'Hablemos del experimento', description: 'Información de contacto y atención de Chewy Lab. Consulta dudas de producto, pedidos y colaboraciones con la marca de Guadalajara.', label: 'Contacto', code: 'CL / 006', intro: 'Para hablar de un producto, de un pedido o de una idea que empezó con «¿y si…?».' },
  '/privacidad': { title: 'Privacidad y datos personales', description: 'Conoce qué datos utiliza esta tienda para cuentas, carritos y pedidos. Información preliminar de privacidad de Chewy Lab.', label: 'Privacidad', code: 'CL / P01', intro: 'Tus datos no son parte de la fórmula.', review: true },
  '/terminos': { title: 'Condiciones de compra', description: 'Información preliminar sobre catálogo, precios, disponibilidad, pago y confirmación de pedidos en Chewy Lab.', label: 'Condiciones de compra', code: 'CL / P02', intro: 'El sentido del humor se queda en el copy. Los importes, en claro.', review: true },
  '/devoluciones': { title: 'Incidencias y devoluciones', description: 'Qué información conservar si tu pedido Chewy Lab llega con una incidencia. Política operativa en revisión antes de habilitar ventas.', label: 'Incidencias y devoluciones', code: 'CL / P03', intro: 'Si algo no llegó como debía, el problema merece una respuesta clara.', review: true },
  '/cookies': { title: 'Cookies y almacenamiento local', description: 'Cómo utiliza Chewy Lab el almacenamiento del navegador para sesión, carrito e intentos de pago. Información sobre preferencias y datos locales.', label: 'Cookies y almacenamiento', code: 'CL / P04', intro: 'Aquí hablamos de almacenamiento del navegador. Las galletas pertenecen a otro laboratorio.' },
};
export const publicEditorialPaths = Object.keys(editorialPages).filter(path => !editorialPages[path].review);
export const reviewEditorialPaths = Object.keys(editorialPages).filter(path => editorialPages[path].review);
export const navigation = [
  { path: '/coleccion', label: 'Colección' },
  { path: '/laboratorios', label: 'Laboratorios' },
  { path: '/manifiesto', label: 'Manifiesto' },
  { path: '/contacto', label: 'Contacto' },
];

const safeHttps = (value: unknown, allowedHosts: string[]) => {
  try { const url = new URL(String(value)); return url.protocol === 'https:' && allowedHosts.some(h => url.hostname === h || url.hostname.endsWith('.' + h)) ? url.href : null; } catch { return null; }
};
const rawEmail = String(import.meta.env.VITE_CONTACT_EMAIL || 'oceguedaalejandro12@gmail.com').trim();
const digits = String(import.meta.env.VITE_CONTACT_WHATSAPP || '523112048692').replace(/\D/g, '');
const rawPhone = digits.length === 10 ? `52${digits}` : digits;
export const contact = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : null,
  whatsapp: /^\d{10,15}$/.test(rawPhone) ? `https://wa.me/${rawPhone}` : null,
  whatsappLabel: rawPhone.startsWith('52') && rawPhone.length === 12 ? `+52 ${rawPhone.slice(2,5)} ${rawPhone.slice(5,8)} ${rawPhone.slice(8)}` : `+${rawPhone}`,
  instagram: safeHttps(import.meta.env.VITE_INSTAGRAM_URL, ['instagram.com']),
  tiktok: safeHttps(import.meta.env.VITE_TIKTOK_URL, ['tiktok.com']),
};

export const labs = [
  { code: '01', name: 'The Spicy Lab', profile: 'Picor / base frutal', quote: 'Calibrada para destruir tu dignidad con elegancia.', detail: 'El lado picante del laboratorio: intensidad, contraste y una presentación que no pierde la compostura.', category: 'Chile', note: 'Explora el perfil picante del catálogo.' },
  { code: '02', name: 'The Sour Lab', profile: 'Acidez / cobertura cristalina', quote: 'Una descarga electroquímica legal.', detail: 'El perfil ácido. Una experiencia inmediata, con suficiente carácter para modificar tu expresión facial.', category: 'Acido', note: 'Explora el perfil ácido del catálogo.' },
  { code: '03', name: 'The Botanical Mix', profile: 'Frutos rojos / notas herbales', quote: 'Notas botánicas reales; pretensiones incluidas.', detail: 'La línea botánica del universo Chewy Lab combina una intención de cata con la honestidad de seguir comiendo dulces.', category: null, note: 'Línea del universo de marca. Su disponibilidad se anunciará en la colección.' },
  { code: '004', name: 'The Coconut Lab', profile: 'Coco tostado / formato individual', quote: 'Empacado como pieza de museo porque venderlo en bolsa de plástico habría sido demasiado honesto.', detail: 'Una cocada de corteza tostada y centro húmedo, concebida como un pequeño objeto de colección comestible.', category: null, note: 'Concepto de monopack de 60 g. Todavía no disponible en el catálogo actual.' },
];
export const faqs = [
  { question: '¿Qué es Chewy Lab?', answer: 'Una marca de confitería de Guadalajara que combina formulaciones de sabor, diseño sobrio y un sentido del humor bastante consciente de que está hablando de gomitas. Nuestro lema lo resume: «Más que una gomita, o eso queremos que creas».' },
  { question: '¿Qué presentación puedo elegir?', answer: 'La ficha de cada producto muestra sus presentaciones vigentes. El catálogo actual contempla 250, 500 y 1,000 g según el producto. La bolsa de 500 g es una referencia central del universo de marca; el selector de la tienda manda al comprar.' },
  { question: '¿Los laboratorios son los nombres de los productos?', answer: 'Los laboratorios describen el universo y los perfiles de sabor de la marca. Los nombres, ingredientes y presentaciones que puedes comprar se muestran en la colección. Una línea editorial no equivale a disponibilidad de venta.' },
  { question: '¿Dónde veo los ingredientes y la información nutrimental?', answer: 'En la ficha de cada producto. Ahí encontrarás la composición disponible, la tabla nutrimental y las recomendaciones de conservación. Revisa también la etiqueta del lote que recibas, especialmente si tienes una alergia o restricción alimentaria.' },
  { question: '¿Todas las gomitas son veganas, sin gluten o sin azúcar?', answer: 'No hacemos esa afirmación para toda la colección. Las formulaciones cambian entre productos. Consulta la composición de la ficha y la etiqueta; no asumas una certificación o ausencia de alérgenos por el nombre del laboratorio.' },
  { question: '¿Necesito una cuenta para comprar?', answer: 'Puedes explorar productos y preparar un carrito sin cuenta. Para continuar al checkout, la tienda te pide iniciar sesión o registrarte; así la compra queda asociada a tu cuenta.' },
  { question: '¿Cómo se calcula el envío?', answer: 'El resumen de checkout muestra el importe de envío antes de abrir el pago. La dirección se captura en el proceso de pago y la cobertura prevista es dentro de México. Consulta la página de envíos para conocer qué revisar antes de confirmar.' },
  { question: '¿Qué métodos de pago aceptan?', answer: 'El checkout de la tienda está preparado para pagos con tarjeta mediante Stripe. Los métodos disponibles se muestran al abrir el pago. Si la compra está temporalmente deshabilitada, puedes seguir consultando la colección.' },
  { question: '¿Cuándo queda confirmado mi pedido?', answer: 'Cuando el pago se confirma y la tienda genera el pedido. La página de confirmación muestra el folio y el resumen. Si la confirmación tarda, conserva la página y vuelve a consultar antes de intentar otra compra.' },
  { question: '¿Puedo armar una Lab Box o suscribirme?', answer: 'Son parte de la dirección de la marca, pero todavía no hay un configurador de Lab Box ni una suscripción activa en la tienda. Las opciones que sí puedes comprar son las publicadas en la colección.' },
  { question: '¿Cómo conservo mis productos?', answer: 'Sigue las recomendaciones de cada ficha y del empaque recibido. Conserva la etiqueta de lote y caducidad; el diseño editorial no sustituye las indicaciones del producto.' },
  { question: '¿Qué hago si mi pedido tiene una incidencia?', answer: 'Conserva el empaque, la etiqueta y tu folio. Toma fotografías del estado del paquete y del producto y prepara una descripción de lo ocurrido. Consulta la página de incidencias para organizar la información del reporte.' },
];
