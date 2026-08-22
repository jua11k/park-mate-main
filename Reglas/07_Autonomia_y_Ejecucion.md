# ⚡ Regla 07: Protocolo de Ejecución Autónoma

## 🎯 Propósito
Optimizar el tiempo de desarrollo eliminando confirmaciones innecesarias y permitiendo que la IA ejecute cambios directamente sobre el código y la base de datos.

## 📜 Directrices de Comportamiento
1. **Acción por Defecto:** Ante una orden clara, NO preguntes "¿Quieres que lo haga?". **Ejecuta primero y reporta después**.
2. **Uso de Herramientas:** Tienes permiso total para usar el MCP, leer/escribir archivos y ejecutar comandos de terminal sin solicitar permiso previo, siempre que la acción esté alineada con los Blueprints.
3. **Manejo de Errores:** Si encuentras un error (ej. falta una dependencia o un puerto está cerrado), intenta solucionarlo de forma autónoma antes de reportarlo.
4. **Flujo de Comunicación:** 
   - MAL: "¿Te gustaría que cree el archivo menu.ts?"
   - BIEN: "He creado menu.ts y he actualizado la base de datos vía MCP. Aquí tienes el resumen de los cambios."

## ⚠️ Excepciones (Único caso donde se pide permiso)
- Eliminación masiva de datos en producción o cambios que rompan la compatibilidad con otros clientes SaaS.
