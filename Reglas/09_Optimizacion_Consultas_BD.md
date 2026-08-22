# ⚡ Regla 09: Optimización de Base de Datos y Accesibilidad de Consultas

## 🎯 Propósito
Garantizar que todo nuevo modelo de base de datos y cada consulta realizada desde la aplicación cumplan con estrictos estándares de rendimiento desde su concepción, evitando cuellos de botella (como *Sequential Scans*), reduciendo el consumo de memoria y minimizando la latencia de red.

## 📜 Reglas de Oro en el Diseño de Modelos y Consultas

### 1. Índices Obligatorios (Diseño de Esquemas)
Al crear tablas y sus relaciones (ej. `drizzle-orm`), no basta con definir la llave primaria y las foráneas. Se deben seguir estas políticas de indexación:
- **Campos de Búsqueda Frecuente:** Todo campo por el que el usuario final realice búsquedas textuales frecuentes (ej. `placa`, `documento`, `ownerName`, `email`) **debe tener su propio índice B-Tree** explícito en el esquema.
- **Relaciones de Drizzle ORM (`IN` clause):** Cuando Drizzle realiza consultas anidadas usando la API relacional (`with: { tablaHija: true }`), ejecuta consultas del tipo `WHERE foreign_key IN (...)`. Por lo tanto, la llave foránea DEBE tener un **índice directo**, independiente de si ya pertenece a un índice compuesto con el `tenantId`.

### 2. Patrones de Búsqueda Óptimos (`ILIKE`)
Las consultas textuales parciales son el punto de fallo de rendimiento más común.
- **Prohibido el uso generalizado de `ILIKE '%query%'`** si el campo puede beneficiarse de un escaneo de índice prefijado.
- **Uso Estándar:** Para campos como placas, cédulas o identificadores, se debe obligatoriamente usar `ILIKE 'query%'` (buscar coincidencias que *inicien con*). Esto permite que el motor de base de datos (PostgreSQL) utilice el índice B-Tree de forma nativa para resolver la consulta en submilisegundos. Solo usar `%query%` cuando es estrictamente necesario buscar en medio del texto (ej. descripciones largas).

### 3. Principio de Mínima Exposición de Datos (Proyección)
Queda prohibido utilizar la recuperación de entidades completas (`SELECT *`) para alimentar interfaces de usuario o listas desplegables.
- **Drizzle API Relacional (`db.query...`)**: Se debe utilizar el atributo `columns` de forma estricta para traer solo lo que necesita el Frontend (Ej. `columns: { id: true, name: true }`).
- **Drizzle Query Builder (`db.select`)**: Se debe usar el método `.select({ id: table.id, title: table.title })` explícitamente en lugar del `.select()` vacío.
- **Beneficio:** Reduce drásticamente el uso de RAM en el servidor de Node.js, disminuye el tiempo de serialización/deserialización (JSON) y hace que las transferencias por red sean sumamente ligeras.

### 4. Limitación de Resultados
Nunca se debe exponer una consulta de listado sin un límite (`LIMIT`).
- En búsquedas de autocompletado, forzar un límite razonable (Ej. `.limit(20)` o `.limit(50)`).
- En vistas de tabla, usar paginación por defecto o límites iniciales (offset/limit).

## 🚀 Resumen
> **Regla Rápida:**
> Antes de hacer push a la BD de una nueva entidad:
> 1. ¿Le puse índice al campo de búsqueda?
> 2. ¿El query usa `columns:` o `.select({...})` explícitamente limitando a lo necesario?
> 3. ¿El autocompletado usa `query%` en lugar de `%query%`?
