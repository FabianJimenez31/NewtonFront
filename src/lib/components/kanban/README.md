# 📋 Módulo Kanban - Newton CRM

## 🏗️ Arquitectura Final (Migración Completada)

El módulo Kanban ha sido **unificado** para usar una sola versión de tarjeta con soporte para campos globales.

### Estructura de Componentes

```
src/lib/components/kanban/
│
├── kanban.board.svelte          # ✨ Board principal (wrapper sin @core)
├── kanban.global.column.svelte  # ✨ Columna con métricas extendidas
├── kanban.card.svelte          # ✨ TARJETA UNIFICADA (básica + global)
│
├── kanban.core.board.svelte    # 🔒 Board original (@core protegido)
├── kanban.core.column.svelte   # 🔒 Columna original (@core protegido)
├── kanban.core.card.svelte     # 🔒 Card original (@core protegido)
│
├── ChannelBadge.svelte         # Badge de canal (WhatsApp, etc)
├── CountryFlag.svelte          # Bandera de país
├── DealValue.svelte            # Valor del deal formateado
├── TagsGroup.svelte            # Grupo de etiquetas
├── SLAIndicator.svelte         # Indicador de SLA
│
└── legacy/
    └── kanban.core.card.legacy.svelte  # Backup de la tarjeta anterior
```

### Flujo de Datos Actual

```
/pipeline (route)
    ↓ importa
kanban.board.svelte (wrapper sin @core)
    ↓ usa
kanban.global.column.svelte (columnas con métricas)
    ↓ renderiza
kanban.card.svelte (TARJETA UNIFICADA)
```

Los archivos `@core` permanecen intactos para evitar romper validaciones críticas del negocio.

## 🎯 Tarjeta Unificada (`kanban.card.svelte`)

La tarjeta unificada muestra **condicionalmente** los campos globales cuando están disponibles:

### Campos Siempre Visibles (básicos)
- `name` - Nombre del contacto
- `last_message` - Último mensaje
- `last_interaction` - Timestamp
- `unread_count` - Mensajes sin leer
- `priority` - Prioridad (alta/media/baja)
- `score` - Puntuación del lead
- `ai_automation_enabled` - Badge AI

### Campos Globales (se muestran si existen)
- `channel` - Canal de comunicación (WhatsApp, Telegram, etc)
- `country_code` - País con bandera emoji
- `deal_value` + `currency` - Valor monetario formateado
- `tags` - Etiquetas (máx 3 visibles + overflow)
- `sla_status` - Estado del SLA con indicador visual

### Campos en Hover Tooltip
- `language` - Idioma del contacto
- `external_id` - ID de sistema externo
- `integration_source` - Fuente de integración
- `last_agent_name` - Último agente que interactuó
- `assigned_agent_name` - Agente asignado

## 🔧 Cómo Funciona la Migración

### 1. Sin Romper Core Files

Los archivos marcados con `@core` están protegidos por hooks de validación. Por eso:
- Creamos `kanban.board.svelte` como wrapper
- Usamos `kanban.global.column.svelte` para columnas extendidas
- La tarjeta unificada `kanban.card.svelte` no tiene marca `@core`

### 2. Graceful Degradation

La tarjeta unificada funciona con datos parciales:
```svelte
{#if lead.channel}
  <ChannelBadge channel={lead.channel} />
{/if}

{#if lead.deal_value}
  <DealValue value={lead.deal_value} currency={lead.currency} />
{/if}
```

Si el backend no envía los campos nuevos, la tarjeta sigue funcionando con los campos básicos.

## 📊 Métricas del Pipeline

El nuevo board (`kanban.board.svelte`) calcula automáticamente:

1. **Total Pipeline Value**: Suma de todos los `deal_value`
2. **Total Leads**: Cantidad total de leads
3. **Total Unread**: Suma de mensajes sin leer
4. **Distribución por Canal**: Conteo por canal en cada columna

## 🧪 Testing y Validación

### Comandos de Verificación

```bash
# 1. Verificar TypeScript
npm run check

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Build de producción
npm run build && npm run preview
```

### Flujo de Validación Visual

1. **Login**: Navegar a `http://localhost:5173/login`
2. **Autenticarse** con credenciales válidas
3. **Pipeline**: Se redirige automáticamente a `/pipeline`
4. **Verificar**:
   - ✅ Tarjetas se muestran correctamente
   - ✅ Campos globales aparecen si están disponibles
   - ✅ Hover tooltip muestra información extendida
   - ✅ Drag & drop funciona entre columnas
   - ✅ Métricas en el header del board

## 🚨 Campos que Pueden Llegar NULL

Según pruebas, estos campos típicamente vienen `null` o `undefined` del backend:

```typescript
// Campos frecuentemente NULL
channel: null           // Si no hay conversación activa
country_code: null      // Si no se detectó el país
language: null          // Si no se configuró idioma
currency: null          // Si no hay deal asociado
deal_value: null        // Si no hay valor monetario
external_id: null       // Si no viene de integración
integration_source: null // Si es lead directo
last_agent_id: null     // Si no hubo interacción humana
last_agent_name: null   // Idem
sla_status: null        // Si no hay SLA configurado
last_channel_at: null   // Si no hay timestamp de canal
tags: []               // Array vacío si no hay tags
```

## 🔄 Cómo Extender la Tarjeta

### Agregar un Nuevo Campo Global

1. **Actualizar el tipo** en `src/lib/types/kanban.ts`:
```typescript
export interface LeadKanban {
  // ... campos existentes ...
  new_field?: string; // Nuevo campo
}
```

2. **Crear componente UI** (si es necesario):
```bash
touch src/lib/components/kanban/NewFieldBadge.svelte
```

3. **Agregar a la tarjeta** en `kanban.card.svelte`:
```svelte
{#if lead.new_field}
  <NewFieldBadge value={lead.new_field} />
{/if}
```

### Personalizar Visualización por Tenant

```svelte
// En kanban.card.svelte
{#if $authStore.currentTenant === 'enterprise'}
  <!-- Mostrar campos adicionales para enterprise -->
  <EnterpriseMetrics {lead} />
{/if}
```

## 📈 Roadmap y Mejoras Futuras

### Corto Plazo (1-2 semanas)
- [ ] Backend envía todos los campos globales
- [ ] Implementar filtros por canal/país
- [ ] Agregar exportación a Excel

### Mediano Plazo (1 mes)
- [ ] Dashboard con gráficos de pipeline
- [ ] Búsqueda y filtrado avanzado
- [ ] Bulk actions (asignar múltiples leads)

### Largo Plazo (Q1 2025)
- [ ] IA para scoring automático
- [ ] Predicción de conversión
- [ ] Automatización de movimientos entre etapas

## 🐛 Troubleshooting

### La tarjeta no muestra campos nuevos
**Causa**: Backend no está enviando los campos
**Solución**: Verificar response de `/api/v1/kanban/board`

### Error "Cannot modify @core file"
**Causa**: Intentando editar archivos protegidos
**Solución**: Usar los wrappers sin @core (`kanban.board.svelte`)

### Drag & drop no funciona
**Causa**: Falta el handler en la columna
**Solución**: Verificar que `onDrop` esté conectado en `kanban.global.column.svelte`

### Performance lento con muchos leads
**Causa**: Renderizando todos los leads a la vez
**Solución**: Implementar virtualización (pendiente)

## 📚 Referencias

- **API Docs**: https://crm.inewton.ai/api/docs
- **Tipos**: `src/lib/types/kanban.ts`
- **Utilidades**: `src/lib/utils/`
- **Store**: `src/lib/stores/kanban.core.store.ts`

## ✅ Estado Actual

- **Frontend**: ✅ 100% Implementado
- **Backend**: ⏳ Esperando campos globales
- **Testing**: ✅ 0 errores TypeScript
- **Producción**: 🚀 Listo para deploy

---

**Última actualización**: 10 Nov 2024
**Versión**: 2.0.0 (Unificada)
**Mantenedor**: Claude + Team Newton