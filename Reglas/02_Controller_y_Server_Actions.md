# 🎮 Regla 02: Controller y Server Actions (La Capa de Orquestación)

## 🎯 Propósito
Definir cómo se comunican la Vista (React) y el Modelo (Base de Datos). Los Server Actions actúan como controladores: reciben peticiones, validan permisos, ejecutan servicios y devuelven respuestas predecibles.

## 🛠️ Estándares de Control
- **Framework:** Next.js 15 Server Actions (`'use server'`).
- **Validación:** Zod (Uso obligatorio de los esquemas definidos en `db/schema/`).
- **Respuesta:** Objeto JSON serializable estandarizado.

## 📜 Reglas de Oro del Controlador
1. **Dumb Controllers:** El Server Action NO contiene lógica de negocio. Su única misión es:
   - Validar el input con Zod.
   - Verificar la sesión/permisos del usuario.
   - Llamar al Servicio correspondiente en `src/services/`.
   - Retornar el resultado al cliente.
2. **Respuesta Estandarizada:** Todas las acciones deben retornar el tipo `ActionResponse<T>`:
   ```typescript
   type ActionResponse<T> = {
     success: boolean;
     data?: T;
     error?: string;
     validationErrors?: Record<string, string[]>;
   };

3. **Manejo de Errores:** Nunca debe "explotar" el servidor. Todo error debe ser capturado (try-catch) y devuelto como un mensaje amigable en Español para la UI.

4. **Seguridad Nativa:** Cada acción que modifique datos (POST, PUT, DELETE) debe verificar la identidad del usuario antes de llamar al servicio.

## 💻 Patrón de Código Requerido (Ejemplo)
Antigravity debe seguir esta estructura para cada acción en src/actions:

"use server";

import { insertUserSchema } from "@/db/schema/users";
import { createUser } from "@/services/user-service"; // Llamada al Servicio
import { revalidatePath } from "next/cache";

export async function createUserController(formData: unknown) {
  // 1. Validación de Entrada
  const result = insertUserSchema.safeParse(formData);
  
  if (!result.success) {
    return {
      success: false,
      validationErrors: result.error.flatten().fieldErrors,
      error: "Datos de formulario inválidos.",
    };
  }

  try {
    // 2. Ejecución de Lógica (vía Servicio)
    const newUser = await createUser(result.data);

    // 3. Revalidación de Caché (Next.js)
    revalidatePath("/usuarios");

    return { success: true, data: newUser };
  } catch (e) {
    // 4. Manejo de Errores
    return { 
      success: false, 
      error: "No se pudo crear el usuario. Inténtelo de nuevo." 
    };
  }
}

## 🔒 Reglas de Seguridad y UX
1. **Optimistic Updates:** El controlador debe estar diseñado para ser compatible con useOptimistic de React 19.

2. **Rate Limiting:** Para acciones sensibles (Login, Registro), Antigravity debe sugerir la implementación de un limitador de intentos por IP.

3. **No filtrado de Sensitive Data:** El controlador debe asegurarse de que el objeto data devuelto no contenga hashes de contraseñas o tokens privados.

## 🧠 Protocolo de Acción
Cuando el usuario pida "funcionalidad de guardado/proceso", Antigravity debe:

1. **Crear el archivo en src/actions/.

2. **Importar el esquema de Zod del Modelo.

3. **Importar (o crear) el servicio en src/services/.

4. **Implementar el try-catch con la respuesta estandarizada.