# 🆔 Regla 04: Gestión de Identidad y Control de Acceso (IAM)

## 🎯 Propósito
Garantizar que toda aplicación implemente un sistema de seguridad basado en la identidad del usuario, protegiendo los recursos según el principio de "mínimo privilegio".

## 🛠️ Principios de Seguridad
1. **Server-Side Truth:** La sesión y los permisos residen exclusivamente en el servidor (Cookies httpOnly). Jamás se confía en el LocalStorage para definir roles.
2. **RBAC (Role-Based Access Control):** Cada entidad (Usuario) debe estar vinculada a un rol definido mediante un ENUM nativo de la base de datos.
3. **Validación en Cascada:**
   - **Nivel 1 (Middleware):** Bloqueo de rutas geográficas (ej. `/admin/**`).
   - **Nivel 2 (Server Actions):** Validación de permisos antes de ejecutar cualquier mutación (Create/Update/Delete).
   - **Nivel 3 (UI):** Renderizado condicional para ocultar elementos que el usuario no tiene permiso de usar.
4. **Límites de Cuota y Control de Capacidad (Quota Management)**
   - **Restricciones de Rol:** El sistema debe validar la cantidad de recursos creados antes de permitir una nueva inserción.
   - **Hard Limits:** Por estándar de la Factory, un SuperAdmin solo puede crear un máximo de 2 usuarios con rol Admin. Intentos excedentes deben ser bloqueados por el Server Action con un mensaje de error controlado.
   - **Visibilidad Condicional:** El acceso a módulos de reportes financieros y cierres de caja queda restringido exclusivamente al rol SuperAdmin.

## 📜 Reglas de Implementación
- **Zero Trust:** Cada vez que una Server Action se invoque, debe verificar la sesión actual antes de tocar la base de datos.
- **Separación de Lógica:** El `AuthService` gestiona la autenticación, mientras que los middlewares gestionan la autorización.
- **Audit Logs:** Toda acción crítica (cambio de precios, eliminación de registros) debe registrar el ID del usuario que la realizó.