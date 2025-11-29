# Estado de Integración WebSocket (Newton CRM)

**Fecha:** 21 de Noviembre, 2025
**Estado:** 🟡 Parcialmente Funcional (Conectado, pero **aún sin** recepción de mensajes de negocio)

## 1. Resumen de Situación
El frontend ha implementado exitosamente un servicio robusto de WebSocket (`WebSocketService`) que maneja la conexión, autenticación y mantenimiento de sesión (keep-alive). Sin embargo, aunque la conexión se establece y el servidor responde a los pings, **no están llegando los eventos `new_message`** cuando un cliente real escribe.

### ✅ Lo que funciona:
*   **Conexión:** Se conecta correctamente a `wss://crm.inewton.ai/ws/conversations/{tenant_id}`.
*   **Autenticación:** Se envía el token JWT en la query string (`?token=...`), evitando errores 401/403.
*   **Heartbeat:** El cliente envía `{"type": "ping"}` cada 30s y el servidor responde correctamente con `{"type": "pong"}` (verificado en logs).
*   **Integración UI:** El indicador visual en el header muestra el estado "Conectado" (punto verde).

### ❌ Lo que falla:
*   **Recepción de Mensajes:** Al enviar un mensaje desde un celular real al número conectado, el servidor **no emite** el evento `new_message` hacia este socket.
*   **Intento de Suscripción Fallido:** Se envió un mensaje de suscripción explícito (`{"type": "subscribe", "channels": ["messages"]}`) desde el frontend, pero no se recibieron eventos `new_message`. Solo se observan mensajes `pong`.
*   **Logs:** Solo se observan mensajes de sistema (`connection_established`, `pong`), pero nada relacionado con leads o conversaciones.

## 2. Hipótesis y Próximos Pasos

Dado que la conexión técnica es estable, el problema es casi seguramente de **lógica de negocio o configuración de canales** en el backend.

### Posibles Causas:
1.  **Falta de Suscripción o Payload Incorrecto:** Se intentó enviar un mensaje de suscripción explícito (`{"type": "subscribe", "channels": ["messages"]}`) desde el frontend, pero no resultó en la recepción de eventos `new_message`. Es posible que el socket requiera un mensaje con un payload diferente para "suscribirse" a los eventos, o que el backend no procese esta suscripción como se esperaba.
2.  **Tenant ID Incorrecto:** El socket se conecta a `celucambio_main`. Si el mensaje entra por un webhook asociado a otro tenant (o uno interno de prueba), el evento no se enrutará a este socket.
3.  **Backend no publicando:** El endpoint del webhook que recibe el mensaje de WhatsApp podría no estar publicando el evento al canal de Redis/WebSocket correspondiente.

### Tareas Urgentes (Requiere Colaboración Backend):
1.  **Consultar Suscripción con Backend:** Preguntar al equipo de backend:
    *   ¿Se requiere un payload específico para que el socket "suscriba" a los eventos de `new_message`? Si es así, ¿cuál es el formato exacto?
    *   ¿Estos eventos deberían ser recibidos automáticamente por un cliente autenticado para un `tenant_id` específico, sin necesidad de una suscripción explícita?
2.  **Revisar Tenant:** Confirmar que el número `573014165044` está mapeado 100% al tenant `celucambio_main` en la configuración de Evolution/Backend.
3.  **Prueba Cruzada:** Si otra aplicación funciona, capturar el tráfico de red de esa app para ver:
    *   ¿A qué URL exacta se conecta?
    *   ¿Envía algún mensaje apenas se conecta?
    *   ¿Cuál es el formato de los mensajes de negocio que recibe?

## 3. Referencia Técnica

**Servicio:** `src/lib/services/websocket.service.ts`

**Logs para monitorear (F12):**
```javascript
[WebSocket] Connecting to ...
[WebSocket] Connected
[WebSocket] 📨 Raw incoming data: ... // Aquí deben aparecer los mensajes
```

**Estructura esperada del mensaje (que NO está llegando):**
```json
{
  "type": "new_message",
  "tenant_id": "celucambio_main",
  "lead_id": "...",
  "message": {
    "content": "Hola...",
    "sender": "lead",
    "phone": "+57..."
  }
}
```
