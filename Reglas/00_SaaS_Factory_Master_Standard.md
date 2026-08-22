# 🏛️ Regla 00: Arquitectura Maestra, SaaS Factory y ADN Móvil

## 🎯 Propósito
Este archivo es la "Constitución" y única fuente de verdad del proyecto. Define la jerarquía, el aislamiento de datos Multi-tenant y las restricciones técnicas para garantizar software escalable tanto en Web como en aplicaciones nativas (APK/Android).

## 🏗️ 1. Estándar SaaS Factory (Multi-tenant)
Todo proyecto nace con la capacidad de soportar múltiples clientes independientes (Tenants) de forma nativa:
1. **Identidad Universal (Zero-Leak)**: Toda tabla operativa DEBE poseer una columna `tenant_id` (UUID v4) vinculada a la tabla maestra de clientes con la restricción `onDelete: "cascade"`.
2. **Seguridad Mandatoria**: Queda prohibido realizar cualquier consulta SQL (SELECT, UPDATE, DELETE) que no incluya un filtro explícito `.where(eq(schema.tenantId, session.tenantId))`.
3. **Configuración Dinámica**: Parámetros que varíen por cliente (impuestos, branding, horarios) deben manejarse mediante campos `JSONB` en la tabla `tenants` para evitar cambios de esquema físico.

## 📱 2. ADN Mobile-First (Optimización APK)
Para garantizar que la aplicación no se vea "apeñuzcada" en dispositivos móviles:
1. **Responsividad Nativa**: Se prohíben anchos fijos (ej. `w-[400px]`). Todo diseño debe ser fluido (`w-full`) y usar `flex-col` en móviles.
2. **Touch Targets**: Los elementos interactivos (botones, inputs) deben tener un área de toque mínima de **44x44px** para usabilidad táctil.
3. **Safe Areas**: Es obligatorio respetar los bordes físicos (notches y barras) mediante el uso de `env(safe-area-inset-*)` en el CSS.

## 📂 3. Estructura de Carpetas y Capas
Toda generación de archivos debe seguir este mapa:
- `src/app/`: [VIEW] UI en Español (Server Components por defecto).
- `src/actions/`: [CONTROLLER] Server Actions (Validación Zod).
- `src/services/`: [SERVICE] Lógica de negocio pura y aislamiento.
- `src/db/schema/`: [MODEL] Esquemas de Drizzle (Aislamiento por `tenant_id`).

## 📜 4. Protocolo de Inicio de Tarea (Jerarquía)
Antes de escribir código, Antigravity debe seguir este orden:
1. **Tenant Context**: Verificar la relación con el `tenant_id`.
2. **Model**: Definir esquema y validaciones Zod.
3. **Service**: Escribir lógica pura y filtrado de aislamiento.
4. **Controller**: Crear Server Action estandarizada.
5. **View**: Implementar interfaz Mobile-First en español.

---
Fin de la Regla 00 - El ADN SaaS y Móvil son la base de la Factory.