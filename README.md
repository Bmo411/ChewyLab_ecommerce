🍬 Chewy Lab | E-commerce Platform

## Estado técnico y despliegue (2026-11-25)

La integración Stripe ya está en el código: `api/` crea el Checkout alojado, valida la sesión Supabase y confirma pedidos por webhook; `supabase/` contiene el esquema para proyecto vacío y la migración aditiva de pagos. No está activada en producción.

Dominio previsto: **https://chewylab.blueberrieslab.com**, con Stripe y Supabase propios.

- [Comparación con Uji y pendientes](docs/COMPARISON.md)
- [Configuración y despliegue paso a paso](docs/DEPLOYMENT.md)
- [Despliegue en Coolify con Dockerfile](docs/COOLIFY.md)
- [SEO, sitemap y acceso de buscadores e IA](docs/SEO.md)
- [Identidad de marca y páginas informativas](docs/BRAND.md)
- [Cambios de esta revisión](docs/CHANGELOG.md)

Desde la raíz: `npm run install:all`, `npm run dev:api`, `npm run dev:web`. Validación: `npm run build`, `npm run lint`, `npm test`.

El build genera HTML por ruta y producto con el catálogo público de Supabase, metadatos y JSON-LD, `robots.txt`, `sitemap.xml` y `llms.txt`. Validaciones adicionales: `npm run test:seo` y `npm run test:e2e`. Reconstruir tras cambios del catálogo. La configuración de buscadores se describe en `docs/SEO.md`.

El `.env` actual contiene las variables públicas de Supabase; la API necesita su clave de servicio privada y las claves Stripe. Empezar con ambos indicadores de comercio en `false`. No copiar secretos a `VITE_*`.

<img width="1024" height="1024" alt="image" src="https://github.com/user-attachments/assets/7a03a0d7-5d82-481c-a193-6abcf45dffe2" />

🧪 El Concepto
Chewy Lab es una marca nativa digital (DTC) basada en Guadalajara, Jalisco, que redefine el consumo de dulces a granel. Nos especializamos en la curación y preparación de gomitas premium en formatos de 1 kilogramo, combinando técnicas de "alquimia de sabor" (mezclas ácidas, picantes y botánicas) con un empaque de lujo diseñado para la experiencia de unboxing perfecta.

🚀 Características del Proyecto
Modelo de Negocio: E-commerce 100% enfocado en paquetes de gran volumen (1kg).

Curación de Sabores: Preparación artesanal de mezclas exclusivas (Spicy, Sour, Botanical).

Identidad Visual: Branding minimalista y premium con empaques tipo Doypack mate y ediciones especiales en madera hexagonal.

Tech Stack: * Frontend reactivo para una navegación fluida.

Pasarela de pagos integrada para transacciones seguras.

Optimización de imágenes para resaltar la textura del producto (Hero Section).

🛠 Instalación y Desarrollo
Si deseas clonar este repositorio para fines de desarrollo o pruebas:

Bash

# Clonar el repositorio
git clone https://github.com/Bmo411/ChewyLab_ecommerce.git
cd ChewyLab_ecommerce

# Instalar dependencias
npm run install:all

# Iniciar servidor de desarrollo
npm run dev:api
# En otra terminal:
npm run dev:web
📦 Estrategia de Empaque (The Lab Box)
El repositorio incluye los assets de diseño para los tres niveles de empaque:

Primary: Doypack negro mate con ventana frontal.

Secondary: Caja de envío con branding interno.

Special Edition: Caja de madera hexagonal con logo pirograbado (quemado).

📍 Ubicación y Distribución
Operaciones centradas en Guadalajara, Jalisco, aprovechando la infraestructura logística y la tradición dulcera de la región para garantizar frescura y rapidez en envíos nacionales.
