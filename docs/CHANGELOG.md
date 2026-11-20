# Cambios

## 2026-11-20

- Dockerfile con defaults públicos de Supabase/dominio y configuración de runtime para publicar catálogo sin capturar variables en Coolify. Sólo se incluyó la clave `anon` verificada; las claves privadas y la activación comercial siguen fuera de la imagen.

- SEO adaptado de la implementación local de Uji: HTML prerenderizado por página/producto, datos públicos precargados y revalidación en el navegador.
- Canonical, títulos/descripciones por ruta, Open Graph, Twitter Cards y JSON-LD de organización, sitio, colección, producto/ofertas y breadcrumbs.
- `robots.txt`, sitemap dinámico de productos y `llms.txt`; noindex en cuenta, checkout, pedidos y errores, con 404 reales y control de previews.
- Enlaces reales desde inicio y categorías; retirados contactos de muestra, cifras/afirmaciones no confirmadas y newsletter sin persistencia del sitio visible.
- Configuración Coolify actualizada para build de SEO y rastreo. Los `.env` permanecen locales; variables privadas sólo en runtime.
- Validación: 24 pruebas API/SQL/hosting, 3 de artefactos SEO y 12 de navegador; prueba de catálogo real con/sin JavaScript y User-Agent OAI-SearchBot. Build y lint sin errores.

## 2026-11-19

- Preparación Coolify: Dockerfile multietapa, exclusión de secretos, runtime sin root, tienda/API en el mismo origen, rutas SPA y healthcheck vivo separado de readiness de pagos. CSP permite el proyecto Supabase configurado y las imágenes HTTPS. Guía en `docs/COOLIFY.md`.

- API Express con Supabase Auth, Stripe Checkout alojado, validación de solicitudes, límites de uso y comprobación de disponibilidad.
- Migración aditiva para reservas/pedidos, precios verificados en SQL, bloqueo de variantes, snapshots, finalización idempotente y permisos exclusivos del servidor.
- Esquema de catálogo/carrito con RLS para instalaciones vacías, separado de la migración existente.
- Checkout conectado con recuperación de errores, reutilización de intento y retorno autenticado; el pedido sólo se confirma por webhook.
- Conciliación manual/programable de reservas para recuperar fallos sin liberar stock de una sesión todavía cobrable.
- Configuración Vercel/Render, variables de ejemplo, dominio confirmado, documentación de comparación y despliegue.
- Reparación de errores previos de TypeScript/lint y metadatos básicos.
- Pruebas: 22 casos HTTP/SQL y 10 casos de navegador en escritorio/móvil; auditorías del frontend y producción de API sin vulnerabilidades conocidas.
- Actualización por seguridad: Vite 8, React Router 7, Zod 4 y parches compatibles; retiro de plugins SWC, Lovable y typography que no estaban usados en la configuración. Node 22.12 o posterior compatible.
- Credenciales privadas, migración remota, DNS, despliegue, políticas y prueba Stripe externa permanecen pendientes.
- Revisión tras reactivar Supabase: Auth y REST directo operativos con las credenciales públicas existentes; catálogo confirmado con 3 productos activos y 9 variantes activas con stock. Columnas de checkout/carrito compatibles; tablas de pedidos/reservas aún ausentes de la caché REST. Actualizada la documentación para retirar el bloqueo de conectividad ya resuelto.
