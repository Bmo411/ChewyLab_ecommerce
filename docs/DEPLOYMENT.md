# Despliegue de ChewyLab

Revisión: 2026-11-20. Dominio confirmado por el propietario: **https://chewylab.blueberrieslab.com**. Supabase y Stripe serán propios de ChewyLab, separados de Uji Standard. Esta entrega prepara código y configuración; no publica ni activa cobros reales.

## Estado de configuración

**Coolify es el destino actual:** usar [docs/COOLIFY.md](COOLIFY.md). El `Dockerfile` en la raíz reúne frontend y API en un contenedor, con puerto 8788 y un solo dominio. Las instrucciones Render/Vercel de este documento se conservan como alternativa; en Coolify el webhook usa `https://chewylab.blueberrieslab.com/webhooks/stripe` y el frontend deja `VITE_API_URL` vacío.

- `Frontend/.env` existe y contiene `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Tras reactivar el proyecto, se verificó nuevamente el 2026-11-19: Auth y las consultas REST directas responden HTTP 200 con la clave pública actual. Hay 3 productos activos, 3 categorías y 9 variantes activas con stock y precios positivos; los 3 productos tienen imágenes e ingredientes. Las columnas consultadas por catálogo, validación de checkout y carrito son compatibles. La consulta general `/rest/v1/` sigue devolviendo 401, pero no impide las consultas directas verificadas. La ausencia de DNS observada anteriormente quedó resuelta.
- `chewy_orders` y `chewy_checkout_reservations` todavía no aparecen en la caché REST (`404 PGRST205`). Falta aplicar/verificar la migración de pagos con acceso de administración. La clave pública no permite auditar las definiciones de RLS ni confirmar aislamiento entre cuentas; esas verificaciones siguen pendientes.
- No se encontró clave de servicio de Supabase ni claves de Stripe dentro de ChewyLab. No se reutilizaron credenciales de Uji.
- `Frontend/.env` estaba versionado y se retira del índice Git en esta publicación, conservando la copia local y `.env.example`. Sus dos variables son públicas por diseño; la seguridad depende de RLS. Las claves privadas deben ir únicamente en `api/.env` y en el runtime del hosting, nunca en `VITE_*`, Git o documentación.

## 1. Supabase propio

Para una base existente: hacer respaldo, revisar las columnas reales y ejecutar solamente `supabase/migrations/20261119_stripe_checkout.sql`. Es aditiva y valida el contrato mínimo del catálogo antes de instalar. No modifica las políticas existentes del catálogo/carrito: auditarlas por separado.

Para un proyecto nuevo vacío: ejecutar primero `supabase/catalog.sql` y después la migración. No ejecutar `catalog.sql` sobre tablas existentes. El esquema nuevo incluye RLS para catálogo público y carritos aislados por usuario. Los pedidos y RPC de pago sólo admiten `service_role`. Las pruebas ejecutan ambos SQL en PostgreSQL embebido; falta verificar migración y concurrencia en el Supabase real.

Cargar categorías, productos, variantes, imágenes y fichas alimentarias reales. Los productos nacen inactivos; no se incluyen precios, stock o ingredientes ficticios. Crear Storage si se usará para imágenes, con lectura pública y escritura restringida, y guardar sus URLs en `product_images`.

Configurar Authentication → URL Configuration:

- Site URL: `https://chewylab.blueberrieslab.com`.
- Redirect URLs: el mismo dominio y `http://localhost:6900` para desarrollo.
- Confirmar correo, plantillas y SMTP de autenticación antes de abrir registros al público.

## 2. API en Render

Importar el repositorio y usar `render.yaml`: raíz `api`, Node 22, instalación `npm ci --omit=dev`, inicio `npm start`, healthcheck `/health`. Usar un servicio que permanezca activo para recibir webhooks.

Variables privadas de Render (o `api/.env` local, copiando `.env.example`):

| Variable | Contenido |
| --- | --- |
| `WEB_URL` | `https://chewylab.blueberrieslab.com` sin slash final |
| `SUPABASE_URL` | URL del proyecto propio y operativo |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada del mismo proyecto |
| `STRIPE_SECRET_KEY` | Clave Stripe test primero; live sólo tras completar verificación |
| `STRIPE_WEBHOOK_SECRET` | Secreto de firma del endpoint y entorno correctos |
| `SHIPPING_AMOUNT_CENTS` | Tarifa nacional plana en centavos de MXN. Vacío bloquea checkout; `0` significa gratis |
| `COMMERCE_ENABLED` | `false` hasta completar pruebas y políticas |
| `LEGAL_PUBLICATION_CONFIRMED` | `false` hasta publicar y revisar términos/privacidad/devoluciones/envíos |

La tarifa plana es una implementación inicial configurable, no una tarifa aprobada por el negocio. No se copiaron los $99/$299 ni umbral de envío gratis de Uji. Los precios del catálogo representan el importe final del producto; no hay cálculo fiscal adicional ni CFDI automático.

Verificar `/health` → `ok:true`, `schema:true`. Mientras falte la migración la comprobación devuelve 503. `/api/commerce-status` enumera bloqueadores sin revelar secretos. La API vuelve a validar precios y stock en una transacción; el navegador sólo envía variantes, cantidades y una clave idempotente.

## 3. Frontend en Vercel y dominio

- Root Directory: `Frontend`; Build Command: `npm run build`; Output: `dist`.
- Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL=https://<host-real-de-la-api>`.
- `Frontend/vercel.json` permite abrir directamente `/checkout`, `/login` y `/pedido-exitoso`.
- Añadir `chewylab.blueberrieslab.com` al proyecto Vercel. Publicar en DNS de `blueberrieslab.com` el CNAME exacto que indique Vercel, y comprobar SSL. El host de API se toma del despliegue real, no de un nombre supuesto.
- Reconstruir el frontend después de cambiar `VITE_*`.

Desarrollo: `npm run install:all`, copiar ambos `.env.example` a `.env` si no existen, luego ejecutar `npm run dev:api` y `npm run dev:web` en terminales separadas. Vite usa puerto 6900 y proxy `/api` a 8788; para desarrollo configurar `WEB_URL=http://localhost:6900` en API y dejar `VITE_API_URL` vacío.

Validación automatizada: `npm run build`, `npm run lint`, `npm test`, `npm run test:seo` y `npm run test:e2e`. E2E usa Chrome instalado, datos simulados y un servidor temporal en 6901; no crea cobros ni usuarios reales. Al 2026-11-20 se comprobaron 24 casos de API/SQL/hosting, 3 de artefactos SEO y 12 de navegador (escritorio y móvil). También se verificaron los productos reales con y sin JavaScript bajo el servidor de producción. La auditoría del frontend y la de dependencias de producción de la API quedaron sin vulnerabilidades conocidas después de actualizar dependencias. Se actualizaron Vite a 8, React Router a 7 y Zod a 4; usar Node 22.12 o posterior compatible (Node 22 en Vercel/Render). Estas pruebas no reemplazan la compra test en las cuentas reales ni validan concurrencia entre conexiones de Supabase. Lint conserva una advertencia previa de dependencias del efecto de autenticación en CartContext; build advierte sobre el tamaño del bundle.

## 4. Stripe propio

Crear la cuenta y completar su activación. Empezar con modo test. En perfil público de Stripe configurar URLs **reales y publicadas** de términos y privacidad de ChewyLab; no existen todavía en este repositorio. La sesión exige aceptación de términos, dirección de envío en México y teléfono.

Crear webhook de tipo snapshot en `https://<host-real-de-la-api>/webhooks/stripe` con estos eventos:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`

Se admiten tarjetas; OXXO/SPEI requieren otro ciclo de reservas. No activarlos sólo cambiando métodos en Stripe. No se necesita clave pública de Stripe ni Stripe.js porque se usa Checkout alojado.

Prueba local con Stripe CLI: `stripe listen --forward-to localhost:8788/webhooks/stripe`. Guardar el `whsec_` local sólo en `api/.env`; es distinto del secreto de Render. Para probar una compra usar el checkout real de la tienda; `stripe trigger` aislado no crea la reserva necesaria. Tarjeta test `4242 4242 4242 4242`, vencimiento futuro y CVC de prueba.

Después de configurar y revisar políticas, poner ambas compuertas en `true` para una prueba test controlada. Verificar sesión, dirección, total, términos, pedido, stock, carrito y retorno. Reenviar el mismo evento desde Stripe: debe conservar un solo pedido y un solo descuento. Cerrar pestaña antes del retorno: el webhook debe registrar igualmente el pedido. Probar tarjeta rechazada y sesión expirada. Activar live sólo al terminar y con webhook live propio.

## 5. Recuperación y operación

- El webhook confirmado es quien registra el pedido, descuenta stock y resta las cantidades compradas del carrito. La página de retorno nunca confirma un cobro por sí sola.
- Un timeout de Stripe **no libera** inventario: la sesión puede haberse creado. El mismo carrito conserva su clave en sessionStorage y reintenta con idempotencia persistida en la base.
- Las reservas duran 35 minutos en Stripe. No se liberan por reloj: un webhook de pago puede llegar tarde. La expiración confirmada por Stripe libera la reserva sin reponer stock ya vendido.
- Ejecutar `npm run reconcile --prefix api` desde la raíz (con variables disponibles en el entorno), o `npm run reconcile` desde `api` con su `.env`, si se pierden webhooks. Procesa hasta 100 reservas vencidas por ejecución y consulta Stripe antes de liberar. Programar esta tarea en el proveedor de hosting para operación continua.
- Si una reserva no tiene ID Stripe por un fallo entre creación y guardado, conciliación recorre las sesiones del intervalo y busca su metadata. Si Stripe falla, termina sin liberar inventario.
- Si un pago y el inventario no concuerdan, el webhook falla y Stripe reintenta. Revisar en Stripe y Supabase; no devolver stock ni cobrar de nuevo sin conciliar.
- Rate limit en memoria por instancia. Migrar a almacenamiento compartido si se escala a varias réplicas. Agregar alertas de webhook/errores y respaldo de base.
- Reembolsos se realizan manualmente desde Stripe. Todavía no se sincronizan al pedido ni reponen stock; documentar el procedimiento antes de ventas reales.

## Verificación antes de abrir ventas

1. Supabase operativo, migración aplicada, RLS revisado y catálogo con inventario real.
2. API/frontend publicados, dominio/SSL, Auth/SMTP y CORS correctos.
3. Tarifa, cobertura y plazos aprobados; contacto real y políticas públicas completas. Los datos de muestra fueron retirados del footer y no se han sustituido por información inventada.
4. Ingredientes, conservación, información nutrimental, alérgenos y etiquetado revisados por el responsable del producto.
5. Compra test completa, doble webhook, pago rechazado, expiración y conciliación verificados contra los servicios reales.
6. Proceso de preparación, envío, notificación al comprador y reembolsos establecido. No hay backoffice ni correos de pedidos en esta entrega.

## Fuentes técnicas

- [Stripe: fulfillment por webhook](https://docs.stripe.com/checkout/fulfillment?ui=full-page)
- [Stripe: firmas, reintentos y cuerpo crudo](https://docs.stripe.com/events/manage-webhook-endpoints)
