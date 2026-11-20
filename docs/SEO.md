# SEO y acceso de buscadores e IA

Revisión: 2026-11-20. Dominio canónico: **https://chewylab.blueberrieslab.com**.

## Implementación y referencia Uji

Se revisaron `UjiStandar/web/public/robots.txt`, `src/components/Seo.tsx`, `src/lib/seo.ts`, `src/entry-server.tsx` y `scripts/prerender.mjs`. Se adaptó el enfoque de HTML generado por ruta, metadatos compartidos con el cliente y sitemap del catálogo. No se copiaron productos, credenciales ni datos comerciales de Uji.

- `Frontend/public/robots.txt` permite rastrear páginas públicas y recursos. La regla genérica incluye Googlebot, Bingbot y OAI-SearchBot. Bloquea rastreo de API, webhooks y healthchecks; no sustituye la autenticación.
- Cada build obtiene únicamente el catálogo público de Supabase y genera HTML completo para inicio, colección y cada producto activo. Los tres productos actuales son visibles sin JavaScript, con ingredientes y presentaciones.
- `sitemap.xml` se genera con las URLs públicas reales, sin fechas de modificación inventadas. Cuenta, checkout y confirmación de pedidos quedan fuera.
- Títulos, descripción, canonical, Open Graph y Twitter Cards son específicos de cada página y se actualizan al navegar. Las páginas públicas usan el dominio configurado, sin parámetros de campaña o filtros en el canonical.
- JSON-LD: Organization, WebSite, CollectionPage/ItemList, Product/AggregateOffer y BreadcrumbList. Los precios provienen del mismo catálogo que el contenido visible; no se inventan reseñas, certificaciones, devolución o envío gratuito.
- `llms.txt` añade un índice legible de páginas y productos. Es un complemento, no un requisito de Google ni una garantía de aparición en respuestas de IA.
- `/login`, `/register`, `/checkout`, `/pedido-exitoso`, errores y endpoints internos llevan `noindex`; las páginas privadas no se bloquean por robots para que los buscadores puedan leer esa instrucción. Los pedidos requieren además autenticación.
- Coolify sirve el HTML correcto para cada ruta. Los productos ausentes devuelven 404 con noindex. Las variantes con slash final o `index.html` redirigen a la URL principal.
- El mismo HTML se entrega a personas y rastreadores: no hay contenido diferente por User-Agent.
- Los `.env` se conservan localmente y se excluyen de Git y Docker. El HTML sólo incorpora datos públicos, nunca usuarios, carritos ni claves privadas.

## Contenido y enlaces

Se conectaron botones de inicio y categorías con URLs reales. Las categorías del inicio provienen de Supabase y filtran la colección mediante `?categoria=...`, cuya canonical permanece en `/coleccion`. Se retiraron del sitio visible los contactos de muestra, enlaces vacíos del footer, cifras/afirmaciones sin respaldo y el formulario de newsletter que no guardaba suscripciones. No se agregaron políticas ni contactos ficticios: siguen pendientes para activar ventas.

## Build y actualización de catálogo

`npm run build` ejecuta TypeScript, build cliente, build SSR y generación de páginas. Requiere las variables públicas `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y acceso de red a Supabase. `VITE_SITE_URL` permite cambiar el origen y por defecto usa el dominio confirmado. Si falla la lectura del catálogo, el build falla en lugar de publicar HTML vacío.

Los visitantes revalidan el catálogo al cargar. El HTML de rastreo y la lista del sitemap corresponden al último build: reconstruir y desplegar tras publicar/desactivar productos o cambiar precios, ingredientes, imágenes o presentaciones. Nuevos slugs no tendrán HTML propio hasta ese despliegue. A partir de 1,000 productos/categorías el generador requiere paginación y falla explícitamente para evitar truncamiento.

## Coolify

1. Configurar las variables públicas como Buildtime. `VITE_API_URL` permanece vacío en la imagen porque API y tienda comparten origen. `VITE_SITE_URL` debe coincidir con `WEB_URL` y el dominio público.
2. Publicación principal: `SEARCH_INDEXING_ENABLED=true` (comportamiento predeterminado). Previews/staging: `false`, que añade noindex global y robots con bloqueo completo.
3. Configurar DNS/SSL, permitir visitas públicas y revisar que el proxy de Coolify no añada otro noindex, login o bloqueo de rastreo. Revisar también firewall/WAF si se usa uno.
4. Verificar 200 para `/robots.txt`, `/sitemap.xml`, `/llms.txt`, inicio, colección y productos. Probar 404 real para un slug inexistente y el noindex de checkout.
5. Agregar la propiedad del dominio en Google Search Console (verificación DNS) y Bing Webmaster Tools; enviar `https://chewylab.blueberrieslab.com/sitemap.xml`. No se crearon cuentas ni registros DNS desde esta entrega.
6. Usar URL Inspection y Rich Results Test después de publicar. Corregir avisos basados en datos reales; las políticas/envíos deben completarse antes de reclamar capacidades comerciales adicionales.

## Validación

- `npm run build` y `npm run lint`.
- `npm test`: API, SQL, permisos, hosting y routing prerenderizado.
- `npm run test:seo`: HTML sin JavaScript, canonical, sitemap, robots, JSON-LD y noindex.
- `npm run test:e2e`: checkout y navegación SEO en escritorio/móvil.

Las validaciones locales no acreditan indexación o posicionamiento. Hace falta publicar el dominio, permitir acceso y esperar el rastreo. Robots y metadatos no garantizan recomendaciones en una IA.

Resultado de esta revisión: build y lint sin errores (se conserva una advertencia de autenticación previa), 24 pruebas API/SQL/hosting, 3 pruebas de artefactos SEO y 12 pruebas de navegador aprobadas. Se comprobaron respuestas HTML con User-Agent OAI-SearchBot y el catálogo real en Chrome con JavaScript activado y desactivado, sin errores de CSP o ejecución.

## Fuentes

- [Google: SEO con JavaScript y prerenderizado](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: datos estructurados de producto](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Google: optimización para funciones de IA; llms.txt no es obligatorio](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [OpenAI: OAI-SearchBot y control de rastreo](https://developers.openai.com/api/docs/bots)
