# ChewyLab frente a Uji Standard

Revisión de código local: 2026-11-20. La comparación no acredita que las funciones de Uji estén activas en producción. Sus propios documentos todavía listan pendientes externos.

| Área | Uji Standard, repositorio local | ChewyLab después de esta entrega |
| --- | --- | --- |
| Catálogo | API, variantes dinámicas, borradores/próximamente, fichas legales | Lectura directa con Supabase; variantes, categorías, imágenes y detalles existentes |
| Usuarios | Clerk y allowlist de administración | Supabase Auth y carrito por usuario; API verifica el token |
| Pago | Checkout alojado, precios desde servidor, compuertas comerciales | Integrado en código con API propia, checkout en MXN y compuertas; pendiente configurar cuenta y webhook |
| Inventario | Saldo maestro por producto y reservas compartidas por presentación | Stock por variante según contrato actual de ChewyLab; reservas transaccionales, snapshots y finalización idempotente |
| Pedidos | Ventas, estados, historial, folio y tracking | Persistencia privada, confirmación por webhook y consulta autenticada por sesión; sin panel administrativo |
| Envíos | Cotización por CP/ZMG/nacional y umbral gratuito | Dirección MX y tarifa nacional plana configurable; falta decisión comercial y logística |
| Correos | Resend, comprador/admin e idempotencia | No implementado; SMTP de Auth es independiente de los avisos de venta |
| Reembolsos | Eventos de devolución y estado de pago | Manual en Stripe; sincronización pendiente |
| Backoffice | CRUD de productos/imágenes, inventario y ventas | No implementado; la operación inicial depende de Supabase/Stripe |
| Legal | Cinco páginas, identidad del vendedor, versiones/evidencia | Gate de activación y aceptación en Stripe; políticas y datos reales pendientes |
| SEO/producción | Prerender, metadatos, caché y despliegue documentado | Desde 2026-11-20: HTML por producto/ruta, canonical, Open Graph/Twitter, JSON-LD, robots, sitemap y llms; hosting unificado para Coolify |
| Verificación | Pruebas frontend/API/E2E existentes | Build con TypeScript, lint reparado, pruebas HTTP y SQL; pendiente E2E contra cuentas propias |

## Hallazgos que impiden considerarlo listo para cobrar

1. Supabase reactivado y consultado correctamente el 2026-11-19: 3 productos activos y 9 variantes activas con stock; catálogo y columnas de carrito compatibles. Las tablas de pedidos/reservas nuevas aún no aparecen en REST (`404 PGRST205`); falta aplicar/verificar la migración. RLS y aislamiento entre cuentas siguen pendientes de auditoría con acceso adecuado.
2. Falta `SUPABASE_SERVICE_ROLE_KEY` en API. La clave `VITE_SUPABASE_ANON_KEY` sólo sirve para el navegador y no debe usarse para procesar pagos.
3. Cuenta propia de Stripe, claves test/live, destino de webhook y compra de aceptación pendientes.
4. Dominio ya definido, pero hosting, DNS y SSL no verificados ni modificados.
5. Faltan políticas públicas, contacto real, tarifas/plazos y revisión del contenido alimentario. Se retiraron del footer los enlaces y datos de contacto de muestra; no se inventaron sustitutos.
6. Newsletter sin persistencia fue retirada del sitio visible; su código queda disponible para una integración futura.

## Prioridad sugerida

Para abrir una primera tienda operable: agregar credenciales privadas de API, aplicar migración, confirmar datos e inventario del catálogo existente, publicar API y frontend, completar políticas/contacto/envío, crear Stripe y probar el ciclo completo. Después incorporar correos automáticos y una vista de operación de pedidos, o establecer explícitamente una operación manual usando Supabase y Stripe. Para alcanzar la funcionalidad de Uji, añadir backoffice, cotización/seguimiento y reembolsos sincronizados.

Esta entrega conserva el trabajo previo de checkout y añade pagos; no replica reglas, tablas, identidades ni credenciales de Uji.
