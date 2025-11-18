# Card Implementation Plan – Kanban Global Card (Core CRM UI)

## Context & Goals

La tarjeta es el corazón del pipeline: muestra cada conversación/lead, permite abrir el chat en tiempo real con Evolution API (WebSocket) y da el contexto global (canal, país, valor del deal, SLA, tags, agente, etc.). Mañana nos enfocamos en:

1. **Diseño global completo** – Mostrar los 12 campos extendidos (channel, country, language, currency, deal_value, external_id, integration_source, last_agent\_*, sla\_status, last\_channel\_at, tags) con jerarquía visual clara.
2. **Interacciones** – Hover tooltips y acciones rápidas (abrir chat, mover, marcar como leído) sin saturar la UI.
3. **Accesibilidad** – Roles ARIA, soporte teclado, contrastes adecuados.
4. **Integración crítica** – La card es la puerta al chat Evolution WebSocket: necesitamos asegurar que el servicio y los handlers sigan funcionando cuando abramos la conversación desde la tarjeta global.

## Archivos Clave

| Path | Descripción |
| --- | --- |
| `src/lib/components/kanban/kanban.card.svelte` | Tarjeta unificada (básica + global). Aquí ensamblaremos los campos nuevos, hovers, tooltips. |
| `src/lib/components/kanban/ChannelBadge.svelte`, `CountryFlag.svelte`, `DealValue.svelte`, `TagsGroup.svelte`, `SLAIndicator.svelte` | Sub-componentes para cada atributo global. Revisar props y estados para asegurar consistencia. |
| `src/lib/components/kanban/kanban.global.column.svelte` | Contenedor actual de las tarjetas; podría requerir ajustes para nuevas acciones (menú contextual, tooltips). |
| `src/lib/utils/*` (currency, countries, channel-icons, dates, formatters, sla) | Utilidades que formatean la data; validar edge cases y locales. |
| `src/lib/services/kanban-proxy.service.ts` | Garantiza que la tarjeta reciba todos los campos. Ya normaliza `kanban_data` → `stages`. |
| **Chat/Evolution**: revisar dónde se maneja el WebSocket (posiblemente `src/lib/services/conversation.service.ts` o similar; si no existe aquí, mapear la integración en backend). Este servicio se invoca desde la card/board para abrir conversaciones. |
| `src/lib/stores/kanban.core.store.ts` + `auth.store.ts` | Proveen token, data y acciones (mover lead, refrescar). Cualquier acción desde la card debe pasar por estos stores. |

## Funcionalidades Esperadas en la Card

1. **Header**: nombre + iconos de canal (color), bandera/país, badge de unread, indicador de prioridad/score.
2. **Body**: último mensaje (truncado), resumen de deal value/currency, tags visibles (máx 3) + overflow.
3. **Footer**: timestamp relativo (última interacción), SLA indicator, badges AI/manual, agente asignado/último agente.
4. **Hover/Tooltip**: detalle extendido (language, external ID, integration source, todos los tags) y acciones rápidas (abrir chat, mover a etapa, asignar).
5. **Accesibilidad**: `role="button"`, `tabindex`, `aria-label` con resumen del lead, soporte para Enter/Espacio.
6. **Chat Integration**: al hacer clic, debe abrir la vista de conversación conectada al WebSocket de Evolution API (servicio crítico). Necesitamos identificar dónde se establece la conexión (posible hook en `routes/pipeline/+page.svelte` → `handleLeadClick`) y asegurarnos de pasar el `lead.id` + metadata apropiada.

## Riesgos & Consideraciones

- **Performance**: tarjetas ricas en datos pueden impactar el scroll; considerar memoización o virtualización si >200 leads.
- **WebSocket**: la card es la entrada al chat; cualquier cambio debe asegurar que seguimos enviando los parámetros esperados al servicio Evolution (tenant, channel, lead id, token). Documentar el endpoint/servicio exacto cuando lo ubiquemos.
- **Estado sin datos**: varios campos llegan `null`; la UI debe degradar elegantemente (mostrar placeholders o esconder secciones).
- **Internacionalización**: timestamps y formatos deben usar helpers (`dates.ts`, `currency.ts`) para respetar locales.

## Próximos pasos

1. Auditar `kanban.card.svelte` actual y comparar con el diseño objetivo.
2. Mapear el flujo `onLeadClick` → servicio de chat/websocket para asegurarnos de no romperlo.
3. Diseñar layout final (wireframe rápido) y distribuir componentes.
4. Implementar, testear (`npm run check`, `npm run preview`) y validar con datos reales en `/pipeline`.
5. Documentar comportamiento (README del módulo Kanban) y cualquier requisito del WebSocket/chat.

Con este plan tendremos claridad para enfocarnos mañana en terminar la tarjeta global y garantizar que el CRM mantenga su núcleo (chat Evolution) funcionando sin fricciones.
