# 🛡️ Regla 01: Model y Data Safety (Drizzle + Zod)

## 🎯 Propósito
Garantizar la integridad, seguridad y sincronización total de los datos. Este archivo dicta cómo se deben definir las entidades y cómo se protegen los datos antes de tocar la base de datos.

## 🛠️ Herramientas de Integridad
- **ORM:** Drizzle ORM.
- **Validación:** Zod + `drizzle-zod` (Para inferencia automática).
- **Identificadores:** UUID v4 o NanoID (Evitar IDs incrementales para seguridad por oscuridad).

## 📂 Organización en `src/db/schema/`
Cada entidad principal debe tener su propio archivo (ej. `users.ts`, `orders.ts`). No se permiten archivos de esquema gigantes.

## 📜 Reglas de Construcción de Modelos
1. **Single Source of Truth:** Cada tabla definida en Drizzle debe exportar obligatoriamente tres elementos:
   - La tabla física (`pgTable` o `sqliteTable`).
   - El esquema de Zod para Inserción (`createSelectSchema`).
   - El tipo de TypeScript inferido para uso en el Frontend.
2. **Relaciones Explícitas:** Se deben usar las APIs de `relations` de Drizzle para que las consultas complejas sean Type-safe.
3. **Auditoría Básica:** Toda tabla debe incluir campos de control: `created_at`, `updated_at` y `deleted_at` (Soft delete por defecto).
4. **Validación de Negocio:** Zod no solo debe validar tipos (string, number), sino reglas: `.email()`, `.min(3)`, `.max(255)`.
5. **Ciclo de Vida y Estados de Activación (Soft Provisioning)**
   - **Estado Inicial:** Toda entidad de nivel "Tenant" o "User" debe nacer con un estado PENDING o INACTIVE por defecto.
   - **Trazabilidad de Acciones Destructivas:** No existe el DELETE físico para registros operativos. Se debe implementar Soft Delete capturando obligatoriamente el motivo de la acción en una columna `cancellation_reason` o similar, vinculada a una tabla de motivos configurables.
6. **Estándar de Validación Condicional**
   - **Lógica de Validación:** Se debe usar .optional().or(z.literal('')) encadenado con la validación de formato. Esto permite que el campo esté vacío, pero si se escribe al menos un carácter, debe cumplir con el esquema estrictamente.
   - **Mensajes Obligatorios:** Queda prohibido usar los mensajes por defecto de Zod. Cada validador debe incluir un objeto de mensaje en español: z.string().email("El formato del correo es inválido").
   - **Sanitización Previa:** Es obligatorio el uso de .trim() en todos los campos de texto para evitar errores por espacios accidentales al inicio o final. 


## 💻 Patrón de Código Requerido (Ejemplo)
Antigravity debe seguir este formato exacto para cada modelo:

```typescript
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Esquemas de Validación (Zod)
export const insertUserSchema = createInsertSchema(users).extend({
  email: z.string().email("Correo electrónico inválido"),
  name: z.string().min(2, "El nombre es muy corto"),
});

// Tipos Inferidos
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;

## 🔒 Reglas de Seguridad de Datos
1. **Sanitización Automática:** No se permiten queries de SQL "puro" (raw) a menos que sea estrictamente necesario y bajo revisión. Usa la API de Drizzle.

2. **Fail-Safe:** Si una validación de Zod falla, el sistema debe lanzar una excepción controlada que el Controller (actions/) pueda capturar y traducir al usuario en español.

3. **No Secretos:** Jamás incluir campos sensibles (passwords, tokens) en los esquemas de Select por defecto.

## 🚀 Performance y Escalabilidad (High Volume Standard)
Para garantizar que el sistema soporte 100+ restaurantes/barberías con miles de registros:

1. **Estrategia de Indexación Obligatoria**:
   - **Multi-tenant Indexing**: Toda tabla de nivel operativo (pedidos, citas, clientes) debe tener un índice compuesto que empiece por `tenant_id`.
   - **Consultas de Rango**: Las columnas de fecha (`startTime`, `createdAt`) que se usen en Dashboards deben estar indexadas junto al `tenant_id` (ej. `index(tenant_id, start_time)`).
   - **Búsquedas Críticas**: Campos de búsqueda frecuente (teléfono, whatsapp, slug) deben tener índices únicos o compuestos para evitar escaneos de tabla completa.

2. **Estándar de Consultas de Alta Eficiencia**:
   - **No Regex en SQL**: Queda prohibido el uso de `regexp_replace` o similares dentro de la cláusula `where`. La normalización de datos (ej. quitar espacios de un teléfono) debe ocurrir en la aplicación antes de la consulta para permitir el uso de Index Scans.
   - **Select Proyectado**: En Server Actions, evitar `db.select()` sin parámetros. Especificar siempre las columnas necesarias para reducir el ancho de banda entre la VPS y la DB.
   - **Optimización en Memoria ($O(1)$)**: En lógica de negocio compleja (ej. calcular disponibilidad), se debe usar el patrón `Map` para indexar datos en memoria y evitar bucles anidados que degraden el CPU.

3. **Guardrails de Datos Masivos**:
   - **Paginación Mandatoria**: Toda lista de clientes o historial debe implementar `limit` y `offset`.
   - **Límites Preventivos**: Consultas de analítica o exportación deben tener un `limit` máximo (ej. 5000 registros) para evitar bloqueos de la base de datos o agotamiento de la memoria RAM.

## 🧠 Protocolo de Acción
Cuando el usuario pida "crear una entidad X", Antigravity debe:

1. **Diseñar la tabla con tipos correctos.

2. **Crear el esquema de Zod con mensajes de error amigables en Español.

Exportar los tipos de TypeScript para que el resto de la app los reconozca.