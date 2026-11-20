# Despliegue en Coolify

Dominio: **https://chewylab.blueberrieslab.com**. La imagen sirve frontend y API en un mismo proceso Node 22, puerto **8788**, bajo el mismo dominio. Supabase sigue externo. No es necesario crear otro dominio para API, instalar una base local ni mantener Vite en producción.

## Configuración de la aplicación

1. Subir estos cambios al repositorio que importará Coolify. Los archivos locales sin commit/push no están disponibles para construir en el servidor.
2. Crear una aplicación desde ese repositorio y elegir **Dockerfile** como Build Pack/Build strategy.
3. Base Directory: `/` si el repositorio es `ChewyLab_ecommerce` (raíz Git comprobada aquí). Si se importa un repositorio superior, usar `/ChewyLab_ecommerce`.
4. Dockerfile Location: `/Dockerfile`, relativo a esa base. Target: `production` o vacío (es la última etapa).
5. Ports Exposes: `8788`. No sobrescribir Start Command: la imagen ejecuta `node src/server.mjs`.
6. Dominio HTTPS: `chewylab.blueberrieslab.com`, puerto interno 8788. En versiones que reciben una URL completa con puerto, usar `https://chewylab.blueberrieslab.com:8788`; el visitante entra sin puerto público.
7. DNS: apuntar `chewylab.blueberrieslab.com` al servidor de Coolify y verificar certificado SSL.

El Dockerfile contiene un healthcheck ejecutado con Node contra `/health/live`. Dejar desactivado el healthcheck del panel si se desea usar el de la imagen: el del panel lo reemplaza. Este endpoint comprueba que la aplicación está levantada; `/health` sigue comprobando acceso al esquema de pagos y puede devolver 503 mientras falta configurar la API. Así el catálogo puede estar disponible durante esa preparación.

## Variables

### Buildtime (públicas)

| Variable | Valor |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del Supabase propio, la misma del frontend local |
| `VITE_SUPABASE_ANON_KEY` | Clave pública actual del frontend |
| `VITE_SITE_URL` | `https://chewylab.blueberrieslab.com` (valor predeterminado) |

Marcar las variables como disponibles durante el build. El Dockerfile declara sus `ARG`; si se usa el ajuste manual de argumentos, conservar esos nombres. `VITE_API_URL` queda vacío dentro del build para usar `/api` bajo el mismo dominio. El build necesita acceso de red al catálogo público de Supabase para generar HTML por producto, robots y sitemap; no basta con configurar las claves sólo en runtime. Las variables `VITE_*` forman parte del JavaScript público; requieren reconstruir la imagen si cambian.

### Runtime

| Variable | Valor inicial |
| --- | --- |
| `WEB_URL` | `https://chewylab.blueberrieslab.com` |
| `SUPABASE_URL` | Mismo proyecto del frontend; necesario también para permitir su conexión en CSP |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada del proyecto; vacía permite publicar sólo catálogo |
| `STRIPE_SECRET_KEY` | Clave test primero; vacía mientras se prepara Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto del destino propio de Stripe |
| `SHIPPING_AMOUNT_CENTS` | Tarifa aprobada en centavos de MXN; vacío impide pagar |
| `COMMERCE_ENABLED` | `false` |
| `LEGAL_PUBLICATION_CONFIRMED` | `false` |
| `SEARCH_INDEXING_ENABLED` | `true` en el dominio público; `false` en previews |

La imagen ya establece `NODE_ENV=production`, `PORT=8788` y `STATIC_DIR=/app/public`. No cambiar esas rutas/puerto sin adaptar también el routing. Las claves privadas deben estar **sólo en runtime**, con Buildtime desactivado. No usar `.env` del repositorio para producción: `.dockerignore` excluye todos los `.env`, dependencias locales y artefactos de pruebas.

## Stripe y Supabase

- Aplicar `supabase/migrations/20261119_stripe_checkout.sql` desde el SQL Editor del Supabase existente, después de respaldo y revisión. No ejecutar `supabase/catalog.sql` sobre el catálogo existente.
- Mantener Auth Site URL y Redirect URLs con `https://chewylab.blueberrieslab.com`.
- Webhook Stripe: **https://chewylab.blueberrieslab.com/webhooks/stripe**. Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `checkout.session.async_payment_failed`.
- Publicar términos y privacidad reales, completar tarifas/contacto y verificar una compra test antes de activar ambas compuertas comerciales.
- Una vez configurados los servicios, programar `node scripts/reconcile.mjs` dentro del contenedor en Coolify para recuperar reservas de webhooks perdidos. La tarea no requiere volúmenes; los pedidos viven en Supabase.

## Comprobación tras desplegar

1. `/`, `/coleccion`, `/producto/<slug-real>`, `/login` y `/checkout` abren directamente y cargan estilos/imágenes.
2. `/health/live` devuelve 200. `/api/commerce-status` devuelve JSON y mantiene compras cerradas inicialmente.
3. `/health` devuelve `database:true`, `schema:true` después de clave de servicio y migración. Vigilarlo como readiness de pagos, separado del estado del catálogo.
4. El carrito conserva datos al entrar y salir; la consulta de pedidos exige sesión.
5. Stripe test registra pedido y descuenta stock una vez; reenviar el webhook no duplica.

## Validación de esta entrega

Build y lint pasan (lint conserva la advertencia previa del efecto de autenticación). Las 23 pruebas de API/SQL pasan e incluyen el hosting unificado: rutas SPA, API, 404, caché de assets, CSP para Supabase e imágenes, healthcheck vivo y pagos cerrados sin credenciales. También se comprobó en Chrome el build compilado servido por Node con cabeceras de producción: se ven los 3 productos reales de Supabase, no se detectaron errores de ejecución/CSP y checkout redirige a login sin sesión. La prueba de la imagen completa depende de disponer de un daemon Docker: el CLI local está instalado, pero Docker Desktop no estaba iniciado al revisar. No se ha publicado en Coolify.

## Referencias

- [Coolify: Dockerfile, contexto y puerto](https://coolify.io/docs/applications/builds/dockerfile)
- [Coolify: variables de build y runtime](https://coolify.io/docs/applications/configuration/environment-variables)
- [Coolify: healthchecks y precedencia de la imagen](https://coolify.io/docs/applications/configuration/health-checks)
