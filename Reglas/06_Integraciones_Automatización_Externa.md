# 🔗 Regla 06: Integraciones y Automatización Externa (n8n & Webhooks)

## 🎯 Propósito
Estandarizar la comunicación entre el núcleo del SaaS y servicios de automatización externos para garantizar que la lógica de negocio se extienda sin comprometer el rendimiento o la seguridad.

## 🛠️ Estándares de Conectividad
1. **Variables de Entorno Obligatorias**: Jamás se debe escribir una URL de Webhook directamente en el código. Toda integración debe usar una variable de entorno (ej. `process.env.N8N_NOTIFICATION_WEBHOOK`).
2. **Arquitectura Fire-and-Forget**: Las llamadas a Webhooks desde Server Actions no deben bloquear la respuesta al usuario. Se deben ejecutar de forma asíncrona tras asegurar la persistencia en la base de datos.
3. **Payload Estandarizado**: Todo envío a n8n debe incluir obligatoriamente el `tenant_id` y un `event_type` para que el flujo externo sepa qué lógica disparar.

## 📜 Reglas de Flujo (Outbound)
- **Seguridad**: Los datos sensibles (passwords, tokens) nunca se envían en un payload de webhook.
- **Fail-Soft**: Si el webhook falla, el sistema principal debe registrar el error en logs pero permitir que el usuario continúe su flujo (a menos que la integración sea crítica para la operación).