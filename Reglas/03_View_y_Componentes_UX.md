# 🎨 Regla 03: View y Componentes UX (Edición Optimizada para Móviles)

## 🎯 Propósito
Definir los estándares de construcción de la interfaz para crear aplicaciones rápidas, accesibles y consistentes, optimizadas tanto para la web como para ser empaquetadas en APK (Android) vía Capacitor.

## 🛠️ Stack de Interfaz (Vanguardia 2026)
- **Framework**: Next.js 15+ (App Router).
- **Componentes**: Shadcn/UI (Tailwind CSS).
- **Hooks de Acción**: `useActionState`, `useFormStatus`, `useOptimistic` (React 19).
- **Feedback**: Sonner (Toasts) y Skeletons para estados de carga.

## 📜 Reglas de Oro de la Vista
1. **Server First**: Todas las páginas son Server Components por defecto.
2. **Hojas de Cliente**: El uso de `'use client'` se restringe a componentes interactivos específicos (formularios, botones).
3. **Validación en Cliente**: Los datos deben validarse con Zod antes de enviarse al servidor para ahorrar latencia.
4. **Feedback UX**: Todo proceso asíncrono debe mostrar un estado de carga y confirmaciones claras en **Español**.

## 📱 Consistencia Visual y Móvil (ADN Capacitor)
Para evitar que la app se vea comprimida o "apeñuzcada" en dispositivos físicos:
1. **Viewport Mobile-Ready**: En el `layout.tsx` raíz, es obligatorio exportar el objeto viewport:
   ```typescript
   export const viewport = { 
     width: 'device-width', 
     initialScale: 1, 
     maximumScale: 1, 
     userScalable: false,
     interactiveWidget: 'resizes-visual' 
   };**

2. **Soporte de Safe Areas**: El archivo globals.css debe incluir variables de entorno para respetar los bordes del celular:

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
} 

3. **Layout Fluido**: Usa grid-cols-1 para móviles y escala a más columnas solo con prefijos md: o lg:. Evita anchos fijos en píxeles.

4. **Accesibilidad Táctil**: Los botones e inputs deben tener una altura mínima de 44px (h-11) para facilitar el uso con el pulgar.

## 💻 Patrón de Formulario Estándar (React 19)
```typescript
"use client";
import { useActionState } from "react";
import { toast } from "sonner";

export function StandardForm({ action }) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full p-4">
      {/* Inputs con h-11 para Touch Target */}
      <input name="field" className="h-11 border rounded p-2" />
      <button type="submit" disabled={isPending} className="h-11 bg-primary text-white rounded">
        {isPending ? "Procesando..." : "Enviar"}
      </button>
    </form>
  ); 
} 

## 🧠 Protocolo de Acción
1. Identificar qué partes pueden ser Server Components (Lectura).
2. Identificar qué partes requieren 'use client' (Interacción).
3. Implementar estados de carga (loading.tsx o Skeletons).
4. Asegurar que todos los textos estén en Español.
🚫 5. Blindaje contra Mensajes Nativos del Navegador
Para garantizar una experiencia de marca consistente y premium, se deben seguir estas reglas en todos los formularios:

Supresión de Nativos: Todo tag <form> debe incluir el atributo noValidate. Esto evita que el navegador muestre sus propios globos de error y permite que nuestra lógica de React tome el control total.

Componentes de Error: Los mensajes de error deben renderizarse exclusivamente mediante componentes de UI controlados (como <FormMessage /> de shadcn/ui). Estos deben aparecer debajo del input afectado con una animación de entrada suave y color de alerta (text-destructive).

Estados Visuales: Un campo con error debe cambiar visualmente su estado (borde rojo, icono de advertencia) para que el usuario identifique el problema sin necesidad de leer el texto.

Prevención de Envío: El botón de envío debe mostrar un estado de "Deshabilitado" o un feedback visual claro si existen errores de validación activos en el cliente antes de intentar llegar al servidor.
