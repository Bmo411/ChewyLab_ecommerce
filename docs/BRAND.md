# Identidad y contenido de Chewy Lab

Revisión: 2026-11-25. Fuente entregada por el propietario: **Chewy Lab - Manual de Identidad de Marca.pdf**, 5 páginas. Se leyó el texto y se revisaron páginas renderizadas del sistema visual. El PDF original no se agrega al repositorio.

## Dirección digital confirmada por el propietario

Esta revisión conserva la estética dorada original del sitio. El propietario aclaró que el manual se entregó para entender la sátira, no para sustituir el diseño existente. Para la web, esta indicación prevalece sobre las restricciones de oro plano, tipografía única y ausencia de brillos del PDF. El PDF original permanece sin modificar; esta guía documenta la actualización de identidad digital.

## Criterios aplicados

- Voz: sátira elegante. El lenguaje de laboratorio se aplica al antojo sin afirmar beneficios médicos, certificaciones ni propiedades que no estén respaldadas por las fichas.
- Lema: «Más que una gomita, o eso queremos que creas.»
- Marca: **Chewy Lab**, descriptor **GOURMET GUMMY CO.**, origen Guadalajara, Jalisco, México. No se anuncia un local abierto al público.
- Color digital: se recuperan los valores originales del sitio en `Frontend/src/index.css`, con fondos oscuros y dorado en títulos, botones, bordes y detalles. Se mantienen los degradados de oro, los reflejos animados y las sombras doradas. Las páginas nuevas usan la misma estética oscura y dorada.
- Tipografía: Playfair Display para títulos y marca, Montserrat para lectura y controles, y Courier New para códigos, gramajes y valores nutrimentales.
- Efectos digitales: se conservan el brillo en textos dorados, el resplandor en controles y los detalles flotantes de la identidad anterior. Se respeta la preferencia de movimiento reducido del dispositivo. Se utiliza el isotipo disponible sin alterar su geometría ni inventar archivos maestros.

## Páginas completadas

| Ruta | Contenido | Indexación |
| --- | --- | --- |
| `/manifiesto` | Premisa de marca, diseño y claridad de producto | Pública |
| `/laboratorios` | Spicy, Sour, Botanical y Coconut como universo de sabor | Pública |
| `/ingredientes` | Cómo consultar fichas, etiqueta, conservación y restricciones | Pública |
| `/preguntas-frecuentes` | Presentaciones, cuenta, pago, pedido y disponibilidad | Pública |
| `/envios` | Dirección, resumen de compra, recepción y datos pendientes | Pública |
| `/contacto` | Correo/WhatsApp reales, contexto de consultas y origen | Pública |
| `/cookies` | Sesión, carrito e identificador de intento de pago | Pública |
| `/privacidad` | Explicación operativa de datos y proveedores; revisión pendiente | Noindex |
| `/terminos` | Funcionamiento del catálogo, importes y confirmación; revisión pendiente | Noindex |
| `/devoluciones` | Preparación de reportes; condiciones finales pendientes | Noindex |

Las tres páginas preliminares se renderizan y sirven con 200, pero quedan fuera del sitemap y llevan noindex tanto en HTML como en cabecera HTTP. El manifiesto SEO distingue rutas renderizadas de rutas indexables.

## Datos confirmados por el propietario

El 2026-11-25 se autorizó publicar:

- Correo: `oceguedaalejandro12@gmail.com`.
- WhatsApp: `+52 311 204 8692` (enlace `https://wa.me/523112048692`).
- Plazos de envío todavía no definidos. No se publica entrega exprés, fecha garantizada o envío gratuito.

Los canales confirmados tienen valores públicos predeterminados en `Frontend/src/lib/editorial.ts`. Overrides públicos de build: `VITE_CONTACT_EMAIL`, `VITE_CONTACT_WHATSAPP`, `VITE_INSTAGRAM_URL`, `VITE_TIKTOK_URL`. No se inventan perfiles de redes sociales. Un número mexicano de 10 dígitos se normaliza con código de país 52.

## Marca frente al catálogo operativo

El manual propone la bolsa de 500 g y el monopack Coconut de 60 g. El catálogo real mantiene DriedMix, LemonDosis y SweetChilli, con variantes de 250, 500 y 1,000 g. No se renombran productos, cambian ingredientes, precios, stock o gramajes en Supabase.

Spicy y Sour enlazan a los perfiles reales de Chile y Acido; se recortan espacios/saltos de línea de los nombres de categoría para que los filtros funcionen. Botanical y Coconut se describen como líneas del universo de marca sin venta activa. No se crea un configurador Lab Box ni una suscripción inexistentes.

## Pendientes comerciales

La identidad/domicilio del responsable y las condiciones finales de envío, cancelación, devolución y atención de datos necesitan confirmación y revisión. El texto operativo no pretende sustituir el aviso de privacidad integral. La activación comercial permanece protegida por la configuración existente; no se activaron pagos ni se modificó una base remota.

Validación de esta entrega: build y lint sin errores (persiste una advertencia previa del efecto de autenticación), 24 pruebas de API/SQL/hosting, 4 de HTML/SEO y 20 de navegador. Revisión visual de páginas de escritorio/móvil y comprobación de las diez rutas editoriales en el servidor de producción, sin desbordamientos ni errores de CSP/ejecución.

Referencias para esa revisión: [LFPDPPP vigente, Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf) y [LFPC vigente, Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf). El manual aporta dirección de diseño, no evidencia de cumplimiento del etiquetado físico.
