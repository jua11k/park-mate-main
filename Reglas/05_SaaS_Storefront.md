# 🛍️ Regla 05: Arquitectura de Portal Público (Storefront Multi-Tenant)

## 🎯 Propósito
Establecer el patrón estándar para la creación de "Vitrinas Públicas" o portales de cara al cliente final (Customer-Facing). Garantiza que cada cliente (Tenant) de nuestro SaaS tenga su propia URL personalizada, segura y optimizada para conversión.

## 🌐 1. Enrutamiento Dinámico (El Patrón Slug)
- **Estructura Base:** Toda vista pública de un Tenant debe vivir obligatoriamente bajo la ruta dinámica `src/app/[tenant_slug]/`.
- **Resolución de Identidad:** El primer paso de cualquier página o componente de servidor en esta ruta debe ser buscar el `slug` en la base de datos maestra (`tenants`) para obtener el `tenant_id` real. Si el slug no existe, debe retornar un error `404 notFound()`.

## 🛡️ 2. Seguridad Pública y Aislamiento (Zero-Leak)
- **Modo Lectura Aislada:** Cualquier consulta a la base de datos para mostrar el catálogo (servicios, productos, horarios, staff) en la vista pública DEBE filtrar estrictamente por el `tenant_id` resuelto. Nunca se deben exponer datos de un Tenant en el portal de otro.
- **Protección de Datos Personales:** Bajo ninguna circunstancia la vista pública debe enviar al cliente (navegador) IDs internos de otros clientes, historiales de citas ajenas o datos financieros.

## 🤝 3. Interacción y Adquisición de Datos (Inbound CRM)
- **Formularios Públicos:** Cuando un usuario final envía datos desde el Storefront (ej. agendar cita, enviar contacto, hacer pedido), el Server Action que recibe la petición debe:
  1. Validar estrictamente los campos con **Zod**.
  2. Inyectar automáticamente el `tenant_id` (basado en el slug de origen) en el registro antes de insertarlo en la base de datos.
  3. Si el sistema captura datos de contacto (Email, WhatsApp), debe registrar al usuario automáticamente en el CRM del Tenant.

## 📱 4. Estándar de UX Pública (Mobile-First)
- Dado que el 90% del tráfico público provendrá de redes sociales (Instagram, WhatsApp), el Storefront debe cumplir la **Regla 03**:
  - Diseños fluidos (`w-full`, `flex-col` en móviles).
  - Áreas de toque ergonómicas (`h-11` o 44px mínimo para botones y selectores).
  - Feedback visual inmediato (Toasts/Skeletons) al realizar acciones.

## 🎨 5. Identidad de Marca Personalizada (Branding)
- **Atributos Visuales:** Cada Tenant debe poder definir su `logo` y `background_image` a través de su panel administrativo.
- **Persistencia en JSONB:** Las URLs de estos archivos deben almacenarse en el objeto `config` de la tabla `tenants`.
- **Inyección Estilo:** El Portal Público (`/[tenant_slug]`) debe inyectar estas imágenes dinámicamente:
  - **Logo:** Priorizar el logo del Tenant sobre el logo genérico del SaaS.
  - **Background:** Aplicar la imagen personalizada como fondo del contenedor principal con `background-size: cover`.
- **Fallback:** Siempre debe existir un diseño "default" profesional por si el Tenant no ha cargado sus propias imágenes.