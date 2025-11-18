# IMPLEMENTATION ROADMAP - Newton CRM
## Guía Detallada de Implementación Frontend por Fases

**Fecha de inicio:** 2025-11-15
**Versión:** 1.0
**Referencia:** Este documento complementa `rq.md` con la implementación técnica detallada

---

## 📊 Estado Actual del Proyecto

### Backend API: ✅ 95% Completo

| Módulo | Endpoints | Estado | Notas |
|--------|-----------|--------|-------|
| **Auth** | 15 endpoints | ✅ 100% | Multi-tenant, WhatsApp login, JWT refresh |
| **Users** | 12 endpoints | ✅ 100% | CRUD, roles, agents list |
| **Conversations** | 14 endpoints | ✅ 95% | Inbox, messaging, audio/file, polling, WebSocket |
| **Leads** | 15 endpoints | ✅ 90% | CRUD, detail, move, assign, classify, metrics |
| **Kanban** | 12 endpoints | ✅ 100% | Config, stages, board, transitions |
| **AI** | 10 endpoints | ✅ 90% | Toggle, status, pause/resume, global config |
| **AI Config** | 8 endpoints | ✅ 85% | Tenant config, bot, catalog, RAG |
| **Specialists** | 10 endpoints | ✅ 90% | Create, documents, test, publish |
| **Evolution** | 5 endpoints | ✅ 100% | Webhooks, verify, health, WebSocket stats |
| **Settings/Wizard** | 12 endpoints | ✅ 80% | Navigation, steps, business info, catalog |
| **Broadcasts** | 0 endpoints | ❌ 0% | **FALTA IMPLEMENTAR BACKEND** |
| **Workflows** | 0 endpoints | ⚠️ 30% | Lógica implícita, sin builder API |

**Total Endpoints Disponibles:** ~113 endpoints

---

### Frontend: ⚠️ 15% Completo

#### ✅ Implementado (4 rutas, 28 componentes)

**Rutas:**
- `/login` - Autenticación multi-tenant completa
- `/` - Home (redirect a pipeline)
- `/pipeline` - Kanban Board completo
- `/configuracion` - Config básica de stages

**Servicios (4 archivos):**
- `auth.service.ts` - ✅ 305 líneas (completo)
- `kanban.core.service.ts` - ⚠️ 311 líneas (**EXCEDE LÍMITE 300**)
- `kanban-proxy.service.ts` - ✅ 252 líneas
- `kanban.validators.ts` - ✅ 67 líneas

**Stores (4 archivos):**
- `auth.store.ts` - ✅ 89 líneas
- `auth.multitenant.ts` - ✅ 156 líneas
- `auth.storage.ts` - ✅ 51 líneas
- `kanban.core.store.ts` - ✅ 250 líneas

**Componentes UI Base (8 archivos):**
- `button.svelte`, `input.svelte`, `badge.svelte`, `label.svelte`
- `separator.svelte`, `dialog.svelte`
- `thinking-loader.svelte` - ⚠️ 294 líneas (98% del límite)

**Componentes Kanban (10 archivos):**
- `kanban.board.svelte` - ⚠️ 339 líneas (**EXCEDE LÍMITE 300**)
- `kanban.core.board.svelte` - ✅ 286 líneas (95% del límite)
- `kanban.core.column.svelte` - ✅ 160 líneas
- `kanban.core.card.svelte` - ✅ 184 líneas
- `kanban.card.svelte` - ✅ 127 líneas
- `kanban.global.column.svelte` - ✅ 72 líneas
- `ChannelBadge.svelte`, `CountryFlag.svelte`, `DealValue.svelte`
- `TagsGroup.svelte`, `SLAIndicator.svelte`

**Componentes Config (2 archivos):**
- `ConfigStageForm.svelte` - ⚠️ 329 líneas (**EXCEDE LÍMITE 300**)
- `ConfigPipelineList.svelte` - ✅ 142 líneas

**Componentes Sidebar (3 archivos):**
- `Sidebar.svelte` - ✅ 242 líneas
- `SidebarNav.svelte` - ✅ 114 líneas
- `SidebarUser.svelte` - ✅ 98 líneas

**Componentes Auth (4 archivos):**
- `Login.svelte`, `LoginForm.svelte`, `BrandPanel.svelte`
- `TenantSelector.svelte`, `TenantSwitcher.svelte`

#### ❌ Pendiente de Implementar (85%)

**Módulos Faltantes:**
1. Inbox (0%)
2. Contacts (0%)
3. AI Agents (0%)
4. Dashboard (0%)
5. Settings Completo (30% implementado)
6. Reports (0%)
7. Broadcasts (0% frontend + 0% backend)
8. Workflows (0% frontend)

---

## 🚨 Problemas Críticos a Resolver PRIMERO

### Violaciones del Límite de 300 Líneas (3 archivos)

**REGLA CRÍTICA:** Ningún archivo debe exceder 300 líneas.

| Archivo | Líneas | Exceso | Prioridad | Acción Requerida |
|---------|--------|--------|-----------|------------------|
| `kanban.board.svelte` | 339 | +39 | 🔴 ALTA | Extraer `usePipelineMetrics()`, `BoardHeader.svelte`, `BoardEmptyState.svelte` |
| `ConfigStageForm.svelte` | 329 | +29 | 🔴 ALTA | Extraer `ColorPicker.svelte`, `useStageValidation()`, `normalizeColor()` |
| `kanban.core.service.ts` | 311 | +11 | 🟡 MEDIA | Dividir en `kanban.config.service.ts`, `kanban.stages.service.ts`, `kanban.board.service.ts` |

**Criterio de Éxito:** Todos los archivos < 300 líneas antes de continuar con nuevos módulos.

---

## 📋 FASES DE IMPLEMENTACIÓN

---

## 🔴 FASE 0: REFACTORING OBLIGATORIO (Semana 0)
**Duración:** 3-4 días
**Objetivo:** Resolver violaciones de 300 líneas antes de continuar

### Tareas

#### 0.1 Refactorizar `kanban.board.svelte` (339 → ~250 líneas)
- [ ] Crear `src/lib/composables/usePipelineMetrics.ts`
  - Extraer lógica de cálculo de total value
  - Extraer cálculo de currency formatting
  - Extraer cálculo de lead counts
- [ ] Crear `src/lib/components/kanban/BoardHeader.svelte`
  - Header con título "Pipeline de Ventas"
  - Estadísticas de valor total y currency
  - Filtros y controles
- [ ] Crear `src/lib/components/kanban/BoardEmptyState.svelte`
  - Estado vacío cuando no hay leads
  - Ilustración y mensaje motivacional
- [ ] Actualizar `kanban.board.svelte` para usar nuevos componentes
- [ ] **Verificar:** Archivo < 300 líneas

#### 0.2 Refactorizar `ConfigStageForm.svelte` (329 → ~200 líneas)
- [ ] Crear `src/lib/components/config/ColorPicker.svelte`
  - Input de color con preview
  - Paleta de colores predefinidos
  - Validación de hex color
- [ ] Crear `src/lib/composables/useStageValidation.ts`
  - Validación de nombre de stage
  - Validación de orden
  - Validación de color
  - Validación de transiciones
- [ ] Crear `src/lib/utils/color.utils.ts`
  - `normalizeColor(color: string): string`
  - `validateHexColor(color: string): boolean`
  - `getContrastColor(bgColor: string): string`
- [ ] Actualizar `ConfigStageForm.svelte` para usar nuevos modules
- [ ] **Verificar:** Archivo < 300 líneas

#### 0.3 Refactorizar `kanban.core.service.ts` (311 → ~200 líneas/archivo)
- [ ] Crear `src/lib/services/kanban.config.service.ts` (~100 líneas)
  - `getConfig()`
  - `createConfig()`
  - `updateConfig()`
  - `createDefaultConfig()`
- [ ] Crear `src/lib/services/kanban.stages.service.ts` (~120 líneas)
  - `getStages()`
  - `getStage(id)`
  - `createStage()`
  - `updateStage()`
  - `deleteStage()`
  - `getDefaultStage()`
- [ ] Crear `src/lib/services/kanban.board.service.ts` (~150 líneas)
  - `getBoard(filters)`
  - `validateTransition()`
  - `moveLeadToStage()`
- [ ] Actualizar imports en componentes que usan estos servicios
- [ ] **Verificar:** Cada archivo < 300 líneas

#### 0.4 Prevención de Archivos Cercanos al Límite
- [ ] Revisar `thinking-loader.svelte` (294 líneas) - considerar optimización
- [ ] Revisar `kanban.core.board.svelte` (286 líneas) - monitorear crecimiento
- [ ] Documentar en CLAUDE.md la política de modularización proactiva

### Criterios de Éxito Fase 0
- ✅ TODOS los archivos < 300 líneas
- ✅ Tests unitarios pasan después del refactoring
- ✅ Kanban board funciona igual que antes
- ✅ Config de stages funciona igual que antes
- ✅ No hay regresiones en funcionalidad

### Entregables
- 3 archivos refactorizados
- 8 nuevos archivos modulares
- Documentación de cambios en commit

---

## 🔴 FASE 1: INBOX - MÓDULO CRÍTICO (Semanas 1-2)
**Duración:** 10 días hábiles
**Objetivo:** Implementar inbox completo estilo Respond.io

### Arquitectura del Inbox

```
┌──────────────────────────────────────────────────────────┐
│  Navbar: Logo | Search | Notifications | User Menu       │
├─────┬──────────────────┬──────────────────┬──────────────┤
│ Nav │  Conversations   │    Messaging     │   Contact    │
│ Bar │      List        │     Console      │   Details    │
│     │  (280px)         │   (flex-1)       │   (320px)    │
│ 💬  │                  │                  │              │
│ 📊  │ Tabs:            │ Header:          │ Info:        │
│ 👥  │ • All (24)       │ • Contact name   │ • Avatar     │
│ 🎯  │ • Mine (12)      │ • Status 🟢      │ • Email      │
│ ⚙️  │ • Unassigned (5) │ • Actions        │ • Phone      │
│     │                  │                  │ • Country    │
│     │ Filters:         │ History:         │              │
│     │ • Search         │ • Messages       │ Lead:        │
│     │ • Stage          │ • Internal notes │ • Stage      │
│     │ • Priority       │ • Events         │ • Score      │
│     │                  │                  │ • Priority   │
│     │ List:            │ Reply:           │              │
│     │ ◉ María G.       │ • Text editor    │ AI:          │
│     │   Hola...        │ • 🎤 📎 😊     │ • Toggle     │
│     │   5 min 🔴       │ • Quick replies  │ • Status     │
│     │   [Agent: Juan]  │ • AI Assist      │              │
│     │                  │                  │ Activity:    │
│     │ ○ Juan P.        │                  │ • Timeline   │
│     │   Gracias...     │                  │ • Notes      │
│     │   2h             │                  │              │
└─────┴──────────────────┴──────────────────┴──────────────┘
```

### Día 1-2: Fundamentos y Tipos

#### 1.1 Tipos TypeScript
**Archivo:** `src/lib/types/inbox.types.ts` (~200 líneas)

```typescript
// Interfaces principales
export interface Conversation {
  id: string
  lead_id: string
  contact_name: string
  contact_email?: string
  contact_phone: string
  contact_avatar?: string
  last_message: string
  last_message_time: string
  last_message_sender: 'agent' | 'contact' | 'system'
  unread_count: number
  status: 'open' | 'closed' | 'snoozed'
  assigned_agent?: Agent
  channel: Channel
  priority?: Priority
  stage?: string
  stage_id?: string
  score?: number
  tags?: string[]
  metadata?: ConversationMetadata
}

export interface Message {
  id: string
  conversation_id: string
  sender: MessageSender
  sender_id?: string
  sender_name?: string
  content: string
  timestamp: string
  read: boolean
  type: MessageType
  metadata?: MessageMetadata
  internal?: boolean // Internal notes
}

export interface LeadDetail {
  id: string
  name: string
  phone: string
  email?: string
  country?: string
  language?: string
  stage: string
  stage_id: string
  score: number
  priority: Priority
  assigned_agent?: Agent
  created_at: string
  updated_at: string
  last_contact: string
  messages: Message[]
  ai_enabled: boolean
  ai_paused_reason?: string
  tags?: string[]
  custom_fields?: Record<string, any>
}

export interface Agent {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  is_online?: boolean
}

export type Channel = 'whatsapp' | 'email' | 'sms' | 'web' | 'instagram' | 'facebook'
export type Priority = 'high' | 'medium' | 'low'
export type MessageSender = 'agent' | 'contact' | 'system' | 'ai'
export type MessageType = 'text' | 'audio' | 'file' | 'image' | 'video' | 'event'
export type InboxTab = 'all' | 'mine' | 'unassigned'

export interface InboxFilters {
  search?: string
  status?: 'open' | 'closed'
  priority?: Priority
  agent?: string
  stage?: string
  tags?: string[]
}

export interface InboxParams extends InboxFilters {
  page?: number
  limit?: number
}

// ... más tipos según API
```

**Tareas:**
- [ ] Crear archivo con interfaces completas
- [ ] Documentar cada tipo con JSDoc
- [ ] Exportar desde `src/lib/types/index.ts`
- [ ] **Verificar:** TypeScript compila sin errores

#### 1.2 Servicio de Conversaciones
**Archivo:** `src/lib/services/conversations.service.ts` (~250 líneas)

```typescript
import { handleApiError, authenticatedFetch } from './api.utils'
import type {
  Conversation,
  ConversationDetail,
  Message,
  InboxParams
} from '$lib/types/inbox.types'

const BASE_URL = '/api/v1/conversations'

export const conversationsService = {
  /**
   * Get conversations inbox with filters
   * @endpoint GET /api/v1/conversations/inbox
   */
  async getInbox(params: InboxParams = {}): Promise<Conversation[]> {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.set('search', params.search)
    if (params.status) queryParams.set('status', params.status)
    if (params.agent) queryParams.set('agent', params.agent)
    if (params.page) queryParams.set('page', params.page.toString())
    if (params.limit) queryParams.set('limit', params.limit.toString())

    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/inbox?${queryParams}`,
        { timeout: 10000 }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get priority inbox
   * @endpoint GET /api/v1/conversations/priority-inbox
   */
  async getPriorityInbox(params: InboxParams = {}): Promise<Conversation[]> {
    // Similar a getInbox pero endpoint diferente
  },

  /**
   * Get full conversation with messages
   * @endpoint GET /api/v1/conversations/{conversation_id}
   */
  async getConversation(conversationId: string): Promise<ConversationDetail> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/${conversationId}`,
        { timeout: 10000 }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Send text message
   * @endpoint POST /api/v1/conversations/{conversation_id}/messages
   */
  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<Message> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/${conversationId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ content }),
          timeout: 10000
        }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Send audio message
   * @endpoint POST /api/v1/conversations/send-audio
   */
  async sendAudio(
    conversationId: string,
    audioFile: File
  ): Promise<Message> {
    const formData = new FormData()
    formData.append('conversation_id', conversationId)
    formData.append('audio', audioFile)

    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/send-audio`,
        {
          method: 'POST',
          body: formData,
          headers: {}, // Let browser set Content-Type for FormData
          timeout: 30000
        }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Send file attachment
   * @endpoint POST /api/v1/conversations/send-file
   */
  async sendFile(
    conversationId: string,
    file: File
  ): Promise<Message> {
    const formData = new FormData()
    formData.append('conversation_id', conversationId)
    formData.append('file', file)

    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/send-file`,
        {
          method: 'POST',
          body: formData,
          headers: {},
          timeout: 60000 // 60s for large files
        }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Poll for new messages
   * @endpoint POST /api/v1/conversations/poll/messages
   */
  async pollMessages(): Promise<Message[]> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/poll/messages`,
        { method: 'POST', timeout: 5000 }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get polling status
   * @endpoint GET /api/v1/conversations/poll/status
   */
  async getPollingStatus(): Promise<any> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/poll/status`,
        { timeout: 5000 }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Toggle AI mode for conversation
   * @endpoint PATCH /api/v1/conversations/{conversation_id}/toggle-ai
   */
  async toggleAI(
    conversationId: string,
    enabled: boolean
  ): Promise<any> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/${conversationId}/toggle-ai?ai_enabled=${enabled}`,
        { method: 'PATCH', timeout: 5000 }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get agents list for filters
   * @endpoint GET /api/v1/conversations/agents
   */
  async getAgents(): Promise<Agent[]> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/agents`,
        { timeout: 5000 }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
```

**Tareas:**
- [ ] Crear servicio con todos los métodos
- [ ] Implementar manejo de errores robusto
- [ ] Agregar JSDoc a cada método
- [ ] Crear `api.utils.ts` con `authenticatedFetch()` y `handleApiError()`
- [ ] **Verificar:** < 300 líneas

#### 1.3 Servicio de Leads
**Archivo:** `src/lib/services/leads.service.ts` (~200 líneas)

```typescript
import { handleApiError, authenticatedFetch } from './api.utils'
import type { LeadDetail, Lead, LeadUpdate } from '$lib/types/inbox.types'

const BASE_URL = '/api/v1/leads'

export const leadsService = {
  /**
   * Get lead detail with conversation
   * @endpoint GET /api/v1/leads/{lead_id}/detail
   */
  async getLeadDetail(
    leadId: string,
    since?: string
  ): Promise<LeadDetail> {
    const url = since
      ? `${BASE_URL}/${leadId}/detail?since=${since}`
      : `${BASE_URL}/${leadId}/detail`

    try {
      const response = await authenticatedFetch(url, { timeout: 10000 })
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Assign lead to agent
   * @endpoint PATCH /api/v1/leads/{lead_id}/assign
   */
  async assignLead(leadId: string, agentId: string | null): Promise<Lead> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/${leadId}/assign`,
        {
          method: 'PATCH',
          body: JSON.stringify({ agent_id: agentId }),
          timeout: 5000
        }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Move lead to different stage
   * @endpoint PATCH /api/v1/leads/{lead_id}/move
   */
  async moveLead(
    leadId: string,
    stageId: string,
    notes?: string
  ): Promise<Lead> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/${leadId}/move`,
        {
          method: 'PATCH',
          body: JSON.stringify({ stage_id: stageId, notes }),
          timeout: 5000
        }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update lead information
   * @endpoint PUT /api/v1/leads/{lead_id}
   */
  async updateLead(leadId: string, data: LeadUpdate): Promise<Lead> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/${leadId}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
          timeout: 5000
        }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
```

**Tareas:**
- [ ] Crear servicio de leads
- [ ] Implementar métodos principales
- [ ] **Verificar:** < 300 líneas

#### 1.4 Servicio de AI
**Archivo:** `src/lib/services/ai.service.ts` (~120 líneas)

```typescript
import { handleApiError, authenticatedFetch } from './api.utils'
import type { AIStatus } from '$lib/types/inbox.types'

const BASE_URL = '/api/v1/ai'

export const aiService = {
  /**
   * Toggle AI automation for lead
   * @endpoint POST /api/v1/ai/leads/{lead_id}/toggle
   */
  async toggleAI(
    leadId: string,
    enable: boolean,
    reason?: string
  ): Promise<AIStatus> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/leads/${leadId}/toggle`,
        {
          method: 'POST',
          body: JSON.stringify({ enable_ai: enable, reason }),
          timeout: 5000
        }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get AI status for lead
   * @endpoint GET /api/v1/ai/leads/{lead_id}/status
   */
  async getAIStatus(leadId: string): Promise<AIStatus> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/leads/${leadId}/status`,
        { timeout: 5000 }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Pause AI automation
   * @endpoint POST /api/v1/ai/leads/{lead_id}/pause-ai
   */
  async pauseAI(leadId: string, reason?: string): Promise<AIStatus> {
    try {
      const url = reason
        ? `${BASE_URL}/leads/${leadId}/pause-ai?reason=${encodeURIComponent(reason)}`
        : `${BASE_URL}/leads/${leadId}/pause-ai`

      const response = await authenticatedFetch(url, {
        method: 'POST',
        timeout: 5000
      })
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Resume AI automation
   * @endpoint POST /api/v1/ai/leads/{lead_id}/resume-ai
   */
  async resumeAI(leadId: string): Promise<AIStatus> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/leads/${leadId}/resume-ai`,
        { method: 'POST', timeout: 5000 }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
```

**Tareas:**
- [ ] Crear servicio AI
- [ ] Implementar métodos de control
- [ ] **Verificar:** < 300 líneas

#### 1.5 Stores Reactivos
**Archivo:** `src/lib/stores/inbox.store.ts` (~200 líneas)

```typescript
import { writable, derived, get } from 'svelte/store'
import { conversationsService } from '$lib/services/conversations.service'
import type {
  Conversation,
  InboxTab,
  InboxFilters
} from '$lib/types/inbox.types'

// State
export const conversations = writable<Conversation[]>([])
export const selectedConversationId = writable<string | null>(null)
export const activeTab = writable<InboxTab>('all')
export const filters = writable<InboxFilters>({})
export const isLoading = writable(false)
export const error = writable<string | null>(null)

// Derived stores
export const selectedConversation = derived(
  [conversations, selectedConversationId],
  ([$conversations, $selectedId]) => {
    if (!$selectedId) return null
    return $conversations.find(c => c.id === $selectedId) || null
  }
)

export const filteredConversations = derived(
  [conversations, filters, activeTab],
  ([$conversations, $filters, $activeTab]) => {
    let filtered = [...$conversations]

    // Filter by tab
    if ($activeTab === 'mine') {
      // TODO: Filter by current user's assigned conversations
      filtered = filtered.filter(c => c.assigned_agent?.id === 'CURRENT_USER_ID')
    } else if ($activeTab === 'unassigned') {
      filtered = filtered.filter(c => !c.assigned_agent)
    }

    // Apply search filter
    if ($filters.search) {
      const search = $filters.search.toLowerCase()
      filtered = filtered.filter(c =>
        c.contact_name.toLowerCase().includes(search) ||
        c.last_message.toLowerCase().includes(search) ||
        c.contact_phone.includes(search) ||
        c.contact_email?.toLowerCase().includes(search)
      )
    }

    // Apply status filter
    if ($filters.status) {
      filtered = filtered.filter(c => c.status === $filters.status)
    }

    // Apply priority filter
    if ($filters.priority) {
      filtered = filtered.filter(c => c.priority === $filters.priority)
    }

    // Apply stage filter
    if ($filters.stage) {
      filtered = filtered.filter(c => c.stage === $filters.stage)
    }

    // Apply agent filter
    if ($filters.agent) {
      filtered = filtered.filter(c => c.assigned_agent?.id === $filters.agent)
    }

    // Sort by last message time (most recent first)
    filtered.sort((a, b) =>
      new Date(b.last_message_time).getTime() -
      new Date(a.last_message_time).getTime()
    )

    return filtered
  }
)

export const unreadCount = derived(
  conversations,
  ($conversations) => $conversations.reduce((sum, c) => sum + c.unread_count, 0)
)

export const unreadByTab = derived(
  [conversations],
  ([$conversations]) => ({
    all: $conversations.reduce((sum, c) => sum + c.unread_count, 0),
    mine: $conversations
      .filter(c => c.assigned_agent?.id === 'CURRENT_USER_ID')
      .reduce((sum, c) => sum + c.unread_count, 0),
    unassigned: $conversations
      .filter(c => !c.assigned_agent)
      .reduce((sum, c) => sum + c.unread_count, 0)
  })
)

// Actions
export const inboxActions = {
  async loadInbox(tab: InboxTab = 'all') {
    isLoading.set(true)
    error.set(null)

    try {
      const params = {
        ...get(filters),
        limit: 100
      }

      const data = await conversationsService.getInbox(params)
      conversations.set(data)
      activeTab.set(tab)
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Error loading inbox')
      console.error('Failed to load inbox:', err)
    } finally {
      isLoading.set(false)
    }
  },

  selectConversation(conversationId: string | null) {
    selectedConversationId.set(conversationId)
  },

  updateFilters(newFilters: Partial<InboxFilters>) {
    filters.update(current => ({ ...current, ...newFilters }))
  },

  clearFilters() {
    filters.set({})
  },

  async refreshInbox() {
    const currentTab = get(activeTab)
    await inboxActions.loadInbox(currentTab)
  }
}
```

**Tareas:**
- [ ] Crear store de inbox
- [ ] Implementar derived stores
- [ ] Implementar actions
- [ ] **Verificar:** < 300 líneas

**Archivo:** `src/lib/stores/messaging.store.ts` (~150 líneas)

```typescript
import { writable, derived, get } from 'svelte/store'
import { conversationsService } from '$lib/services/conversations.service'
import type { Message, ConversationDetail } from '$lib/types/inbox.types'

// State
export const currentConversation = writable<ConversationDetail | null>(null)
export const messages = writable<Message[]>([])
export const isLoadingMessages = writable(false)
export const isSending = writable(false)
export const error = writable<string | null>(null)

// Polling
let pollingInterval: number | null = null

// Derived
export const unreadMessages = derived(
  messages,
  ($messages) => $messages.filter(m => !m.read && m.sender === 'contact')
)

// Actions
export const messagingActions = {
  async loadConversation(conversationId: string) {
    isLoadingMessages.set(true)
    error.set(null)

    try {
      const conversation = await conversationsService.getConversation(conversationId)
      currentConversation.set(conversation)
      messages.set(conversation.messages || [])
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Error loading conversation')
      console.error('Failed to load conversation:', err)
    } finally {
      isLoadingMessages.set(false)
    }
  },

  async sendMessage(content: string) {
    const conversation = get(currentConversation)
    if (!conversation) {
      console.error('No active conversation')
      return
    }

    isSending.set(true)
    error.set(null)

    try {
      const newMessage = await conversationsService.sendMessage(
        conversation.id,
        content
      )

      // Optimistic update
      messages.update(msgs => [...msgs, newMessage])
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Error sending message')
      console.error('Failed to send message:', err)
      throw err
    } finally {
      isSending.set(false)
    }
  },

  async sendAudio(audioFile: File) {
    const conversation = get(currentConversation)
    if (!conversation) return

    isSending.set(true)
    try {
      const newMessage = await conversationsService.sendAudio(
        conversation.id,
        audioFile
      )
      messages.update(msgs => [...msgs, newMessage])
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Error sending audio')
      throw err
    } finally {
      isSending.set(false)
    }
  },

  async sendFile(file: File) {
    const conversation = get(currentConversation)
    if (!conversation) return

    isSending.set(true)
    try {
      const newMessage = await conversationsService.sendFile(
        conversation.id,
        file
      )
      messages.update(msgs => [...msgs, newMessage])
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Error sending file')
      throw err
    } finally {
      isSending.set(false)
    }
  },

  startPolling(intervalMs: number = 5000) {
    if (pollingInterval) return

    pollingInterval = window.setInterval(async () => {
      try {
        const newMessages = await conversationsService.pollMessages()
        if (newMessages.length > 0) {
          messages.update(msgs => [...msgs, ...newMessages])
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, intervalMs)
  },

  stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  },

  clearConversation() {
    currentConversation.set(null)
    messages.set([])
    messagingActions.stopPolling()
  }
}
```

**Tareas:**
- [ ] Crear store de messaging
- [ ] Implementar polling logic
- [ ] Implementar optimistic updates
- [ ] **Verificar:** < 300 líneas

### Criterios de Éxito Día 1-2
- ✅ Todos los tipos TypeScript definidos
- ✅ 3 servicios implementados (conversations, leads, ai)
- ✅ 2 stores reactivos (inbox, messaging)
- ✅ Todos los archivos < 300 líneas
- ✅ TypeScript compila sin errores
- ✅ Documentación JSDoc completa

---

### Día 3-4: Componentes shadcn Faltantes

#### 1.6 Componentes UI Necesarios

**Tareas:**
- [ ] Crear `src/lib/components/ui/tabs.svelte` (para inbox tabs)
- [ ] Crear `src/lib/components/ui/avatar.svelte` (para contactos/agentes)
- [ ] Crear `src/lib/components/ui/scroll-area.svelte` (para message history)
- [ ] Crear `src/lib/components/ui/textarea.svelte` (para reply box)
- [ ] Crear `src/lib/components/ui/toggle.svelte` (para AI control)
- [ ] Crear `src/lib/components/ui/dropdown-menu.svelte` (para acciones)
- [ ] Exportar todos desde `src/lib/components/ui/index.ts`
- [ ] **Verificar:** Cada componente < 200 líneas
- [ ] **Verificar:** Componentes funcionan con theme actual

### Criterios de Éxito Día 3-4
- ✅ 6 componentes UI shadcn nuevos
- ✅ Integración con design system existente
- ✅ Storybook examples (opcional)

---

### Día 5-7: Layout y Lista de Conversaciones

#### 1.7 Layout Principal del Inbox
**Archivo:** `src/lib/components/inbox/InboxLayout.svelte` (~150 líneas)

```svelte
<script lang="ts">
  import ConversationsList from './ConversationsList.svelte'
  import MessagingConsole from './MessagingConsole.svelte'
  import ContactDetailsPanel from './ContactDetailsPanel.svelte'
  import { selectedConversation } from '$lib/stores/inbox.store'
</script>

<div class="flex h-screen overflow-hidden bg-background">
  <!-- Panel 1: Conversations List (280px) -->
  <div class="w-[280px] border-r border-border flex-shrink-0">
    <ConversationsList />
  </div>

  <!-- Panel 2: Messaging Console (flex-1) -->
  <div class="flex-1 flex flex-col min-w-0">
    {#if $selectedConversation}
      <MessagingConsole />
    {:else}
      <div class="flex items-center justify-center h-full text-muted-foreground">
        <div class="text-center">
          <p class="text-lg font-medium">Selecciona una conversación</p>
          <p class="text-sm mt-2">Elige una conversación para empezar a chatear</p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Panel 3: Contact Details (320px) -->
  {#if $selectedConversation}
    <div class="w-[320px] border-l border-border flex-shrink-0">
      <ContactDetailsPanel />
    </div>
  {/if}
</div>
```

**Tareas:**
- [ ] Crear layout de 3 paneles
- [ ] Implementar responsive behavior
- [ ] Agregar empty state
- [ ] **Verificar:** < 200 líneas

#### 1.8 Lista de Conversaciones
**Archivo:** `src/lib/components/inbox/ConversationsList.svelte` (~250 líneas)

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs'
  import { Input } from '$lib/components/ui/input'
  import { Badge } from '$lib/components/ui/badge'
  import ConversationItem from './ConversationItem.svelte'
  import ConversationFilters from './ConversationFilters.svelte'
  import { Search } from 'lucide-svelte'
  import {
    filteredConversations,
    activeTab,
    unreadByTab,
    filters,
    isLoading,
    inboxActions
  } from '$lib/stores/inbox.store'
  import type { InboxTab } from '$lib/types/inbox.types'

  let searchQuery = ''

  onMount(() => {
    inboxActions.loadInbox('all')
  })

  function handleTabChange(tab: InboxTab) {
    inboxActions.loadInbox(tab)
  }

  function handleSearch(e: Event) {
    const target = e.target as HTMLInputElement
    searchQuery = target.value
    inboxActions.updateFilters({ search: searchQuery })
  }
</script>

<div class="flex flex-col h-full">
  <!-- Header -->
  <div class="p-4 border-b border-border">
    <h2 class="text-lg font-semibold mb-4">Conversaciones</h2>

    <!-- Tabs -->
    <Tabs value={$activeTab} onValueChange={handleTabChange}>
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="all">
          All
          {#if $unreadByTab.all > 0}
            <Badge variant="primary" class="ml-2">{$unreadByTab.all}</Badge>
          {/if}
        </TabsTrigger>
        <TabsTrigger value="mine">
          Mine
          {#if $unreadByTab.mine > 0}
            <Badge variant="primary" class="ml-2">{$unreadByTab.mine}</Badge>
          {/if}
        </TabsTrigger>
        <TabsTrigger value="unassigned">
          Unassigned
          {#if $unreadByTab.unassigned > 0}
            <Badge variant="primary" class="ml-2">{$unreadByTab.unassigned}</Badge>
          {/if}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <!-- Search -->
    <div class="relative mt-4">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar conversaciones..."
        class="pl-10"
        value={searchQuery}
        on:input={handleSearch}
      />
    </div>

    <!-- Filters -->
    <ConversationFilters />
  </div>

  <!-- Conversations List -->
  <div class="flex-1 overflow-y-auto">
    {#if $isLoading}
      <div class="p-4 text-center text-muted-foreground">
        <p>Cargando conversaciones...</p>
      </div>
    {:else if $filteredConversations.length === 0}
      <div class="p-4 text-center text-muted-foreground">
        <p>No hay conversaciones</p>
      </div>
    {:else}
      {#each $filteredConversations as conversation (conversation.id)}
        <ConversationItem {conversation} />
      {/each}
    {/if}
  </div>
</div>
```

**Tareas:**
- [ ] Crear componente de lista
- [ ] Implementar tabs (All/Mine/Unassigned)
- [ ] Implementar búsqueda
- [ ] Integrar filtros
- [ ] **Verificar:** < 300 líneas

#### 1.9 Item de Conversación
**Archivo:** `src/lib/components/inbox/ConversationItem.svelte` (~180 líneas)

```svelte
<script lang="ts">
  import { Avatar } from '$lib/components/ui/avatar'
  import { Badge } from '$lib/components/ui/badge'
  import { cn } from '$lib/utils'
  import {
    selectedConversationId,
    inboxActions,
    messagingActions
  } from '$lib/stores/inbox.store'
  import { formatRelativeTime } from '$lib/utils/date.utils'
  import ChannelBadge from '$lib/components/kanban/ChannelBadge.svelte'
  import type { Conversation } from '$lib/types/inbox.types'

  interface Props {
    conversation: Conversation
  }

  let { conversation }: Props = $props()

  const isSelected = $derived($selectedConversationId === conversation.id)
  const hasUnread = $derived(conversation.unread_count > 0)

  async function handleClick() {
    inboxActions.selectConversation(conversation.id)
    await messagingActions.loadConversation(conversation.id)
  }
</script>

<button
  type="button"
  class={cn(
    'w-full p-4 flex gap-3 border-b border-border hover:bg-accent transition-colors text-left',
    isSelected && 'bg-accent'
  )}
  on:click={handleClick}
>
  <!-- Avatar -->
  <Avatar
    src={conversation.contact_avatar}
    alt={conversation.contact_name}
    class="h-12 w-12 flex-shrink-0"
  />

  <!-- Content -->
  <div class="flex-1 min-w-0">
    <!-- Header -->
    <div class="flex items-start justify-between gap-2 mb-1">
      <h3 class={cn(
        'font-semibold text-sm truncate',
        hasUnread && 'text-primary'
      )}>
        {conversation.contact_name}
      </h3>
      <span class="text-xs text-muted-foreground flex-shrink-0">
        {formatRelativeTime(conversation.last_message_time)}
      </span>
    </div>

    <!-- Last Message -->
    <p class={cn(
      'text-sm text-muted-foreground truncate mb-2',
      hasUnread && 'font-medium text-foreground'
    )}>
      {conversation.last_message}
    </p>

    <!-- Footer -->
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Channel Badge -->
      <ChannelBadge channel={conversation.channel} />

      <!-- Unread Badge -->
      {#if hasUnread}
        <Badge variant="default" class="h-5">
          {conversation.unread_count}
        </Badge>
      {/if}

      <!-- Priority Badge -->
      {#if conversation.priority === 'high'}
        <Badge variant="destructive" class="h-5">
          Alta
        </Badge>
      {/if}

      <!-- Assigned Agent -->
      {#if conversation.assigned_agent}
        <div class="flex items-center gap-1">
          <Avatar
            src={conversation.assigned_agent.avatar}
            alt={conversation.assigned_agent.name}
            class="h-4 w-4"
          />
          <span class="text-xs text-muted-foreground">
            {conversation.assigned_agent.name}
          </span>
        </div>
      {/if}
    </div>
  </div>
</button>
```

**Tareas:**
- [ ] Crear item de conversación
- [ ] Implementar estados (selected, unread)
- [ ] Agregar avatars y badges
- [ ] Integrar con store
- [ ] **Verificar:** < 200 líneas

#### 1.10 Filtros de Conversaciones
**Archivo:** `src/lib/components/inbox/ConversationFilters.svelte` (~150 líneas)

```svelte
<script lang="ts">
  import { DropdownMenu } from '$lib/components/ui/dropdown-menu'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'
  import { Filter } from 'lucide-svelte'
  import { filters, inboxActions } from '$lib/stores/inbox.store'
  import { kanbanStages } from '$lib/stores/kanban.core.store'

  let showFilters = $state(false)

  function toggleFilter(key: string, value: string) {
    const current = $filters[key]
    if (current === value) {
      inboxActions.updateFilters({ [key]: undefined })
    } else {
      inboxActions.updateFilters({ [key]: value })
    }
  }

  const activeFiltersCount = $derived(
    Object.values($filters).filter(Boolean).length
  )
</script>

<div class="mt-4">
  <Button
    variant="outline"
    size="sm"
    class="w-full justify-start"
    on:click={() => showFilters = !showFilters}
  >
    <Filter class="h-4 w-4 mr-2" />
    Filtros
    {#if activeFiltersCount > 0}
      <Badge variant="primary" class="ml-auto">
        {activeFiltersCount}
      </Badge>
    {/if}
  </Button>

  {#if showFilters}
    <div class="mt-2 space-y-2 p-3 bg-muted rounded-md">
      <!-- Status Filter -->
      <div>
        <label class="text-xs font-medium mb-1 block">Estado</label>
        <div class="flex gap-2">
          <Button
            variant={$filters.status === 'open' ? 'default' : 'outline'}
            size="sm"
            on:click={() => toggleFilter('status', 'open')}
          >
            Abierto
          </Button>
          <Button
            variant={$filters.status === 'closed' ? 'default' : 'outline'}
            size="sm"
            on:click={() => toggleFilter('status', 'closed')}
          >
            Cerrado
          </Button>
        </div>
      </div>

      <!-- Priority Filter -->
      <div>
        <label class="text-xs font-medium mb-1 block">Prioridad</label>
        <div class="flex gap-2">
          <Button
            variant={$filters.priority === 'high' ? 'default' : 'outline'}
            size="sm"
            on:click={() => toggleFilter('priority', 'high')}
          >
            Alta
          </Button>
          <Button
            variant={$filters.priority === 'medium' ? 'default' : 'outline'}
            size="sm"
            on:click={() => toggleFilter('priority', 'medium')}
          >
            Media
          </Button>
          <Button
            variant={$filters.priority === 'low' ? 'default' : 'outline'}
            size="sm"
            on:click={() => toggleFilter('priority', 'low')}
          >
            Baja
          </Button>
        </div>
      </div>

      <!-- Stage Filter -->
      <div>
        <label class="text-xs font-medium mb-1 block">Etapa</label>
        <select
          class="w-full p-2 rounded-md border"
          value={$filters.stage || ''}
          on:change={(e) => {
            const value = e.currentTarget.value
            inboxActions.updateFilters({ stage: value || undefined })
          }}
        >
          <option value="">Todas las etapas</option>
          {#each $kanbanStages as stage}
            <option value={stage.id}>{stage.name}</option>
          {/each}
        </select>
      </div>

      <!-- Clear Filters -->
      {#if activeFiltersCount > 0}
        <Button
          variant="ghost"
          size="sm"
          class="w-full"
          on:click={() => inboxActions.clearFilters()}
        >
          Limpiar filtros
        </Button>
      {/if}
    </div>
  {/if}
</div>
```

**Tareas:**
- [ ] Crear componente de filtros
- [ ] Implementar filtros por status, priority, stage
- [ ] Agregar contador de filtros activos
- [ ] **Verificar:** < 200 líneas

### Criterios de Éxito Día 5-7
- ✅ InboxLayout funcionando con 3 paneles
- ✅ Lista de conversaciones con tabs
- ✅ Búsqueda funcional
- ✅ Filtros funcionando
- ✅ Selección de conversación integrada con store
- ✅ UI responsive

---

### Día 8-10: Consola de Mensajería

#### 1.11 Consola de Mensajería Principal
**Archivo:** `src/lib/components/inbox/MessagingConsole.svelte` (~200 líneas)

```svelte
<script lang="ts">
  import MessageHeader from './MessageHeader.svelte'
  import MessageHistory from './MessageHistory.svelte'
  import ReplyBox from './ReplyBox.svelte'
  import { currentConversation } from '$lib/stores/messaging.store'
</script>

<div class="flex flex-col h-full">
  <!-- Header -->
  {#if $currentConversation}
    <MessageHeader conversation={$currentConversation} />
  {/if}

  <!-- Messages History -->
  <div class="flex-1 overflow-hidden">
    <MessageHistory />
  </div>

  <!-- Reply Box -->
  <div class="border-t border-border">
    <ReplyBox />
  </div>
</div>
```

**Tareas:**
- [ ] Crear componente principal de messaging
- [ ] Integrar header, history, reply
- [ ] **Verificar:** < 250 líneas

#### 1.12 Header de Mensaje
**Archivo:** `src/lib/components/inbox/MessageHeader.svelte` (~150 líneas)

Contenido similar al diseño, con nombre del contacto, estado online/offline, y botones de acción.

#### 1.13 Historial de Mensajes
**Archivo:** `src/lib/components/inbox/MessageHistory.svelte` (~250 líneas)

Scroll infinito, burbujas de mensajes, notas internas, eventos del sistema.

#### 1.14 Burbuja de Mensaje
**Archivo:** `src/lib/components/inbox/MessageBubble.svelte` (~150 líneas)

Renderizado de mensajes según tipo (text, audio, file, image).

#### 1.15 Reply Box
**Archivo:** `src/lib/components/inbox/ReplyBox.svelte` (~200 líneas)

Editor de texto, botones de audio/file, emoji picker, envío de mensajes.

### Criterios de Éxito Día 8-10
- ✅ Consola de mensajería completa
- ✅ Envío de mensajes funcional
- ✅ Soporte para audio/archivos
- ✅ Scroll infinito en historial
- ✅ Indicadores de estado (enviando, enviado, leído)

---

### Día 11-12: Panel de Detalles de Contacto

#### 1.16 Panel de Detalles
**Archivo:** `src/lib/components/inbox/ContactDetailsPanel.svelte` (~250 líneas)

Secciones:
- Contact Info (editable)
- Lead Info (stage, score, priority)
- AI Toggle
- Activity Timeline
- Tags
- Custom Fields

#### 1.17 AI Toggle Component
**Archivo:** `src/lib/components/inbox/AIToggle.svelte` (~100 líneas)

Toggle para activar/desactivar AI con razón.

#### 1.18 Activity Timeline
**Archivo:** `src/lib/components/inbox/ActivityTimeline.svelte` (~180 líneas)

Timeline de eventos (cambios de etapa, asignaciones, notas).

### Criterios de Éxito Día 11-12
- ✅ Panel de contacto completo
- ✅ Información editable
- ✅ AI toggle funcionando
- ✅ Timeline de actividad

---

### Día 13-14: Real-time y Pulido

#### 1.19 Integración de Polling/WebSocket
- [ ] Implementar polling automático cada 5 segundos
- [ ] Notificaciones de nuevos mensajes
- [ ] Actualización de contador de no leídos
- [ ] Sonido de notificación (opcional)

#### 1.20 Ruta de SvelteKit
**Archivo:** `src/routes/conversaciones/+page.svelte`

```svelte
<script lang="ts">
  import InboxLayout from '$lib/components/inbox/InboxLayout.svelte'
</script>

<InboxLayout />
```

#### 1.21 Testing y Optimización
- [ ] Probar todos los flujos (envío, recepción, filtros)
- [ ] Optimizar performance (virtualized scroll)
- [ ] Agregar loading skeletons
- [ ] Manejo de errores robusto
- [ ] Accessibility (keyboard navigation, ARIA)

### Criterios de Éxito Día 13-14
- ✅ Polling funcionando
- ✅ Ruta `/conversaciones` operativa
- ✅ Performance optimizado
- ✅ Errores manejados correctamente
- ✅ Accessibility básico

---

### Entregables Finales Fase 1

#### Archivos Creados (Total: ~35 archivos)

**Tipos (1 archivo):**
- `src/lib/types/inbox.types.ts`

**Servicios (4 archivos):**
- `src/lib/services/conversations.service.ts`
- `src/lib/services/leads.service.ts`
- `src/lib/services/ai.service.ts`
- `src/lib/services/api.utils.ts`

**Stores (2 archivos):**
- `src/lib/stores/inbox.store.ts`
- `src/lib/stores/messaging.store.ts`

**Componentes UI (6 archivos):**
- `src/lib/components/ui/tabs.svelte`
- `src/lib/components/ui/avatar.svelte`
- `src/lib/components/ui/scroll-area.svelte`
- `src/lib/components/ui/textarea.svelte`
- `src/lib/components/ui/toggle.svelte`
- `src/lib/components/ui/dropdown-menu.svelte`

**Componentes Inbox (15 archivos):**
- `InboxLayout.svelte`
- `ConversationsList.svelte`
- `ConversationItem.svelte`
- `ConversationFilters.svelte`
- `MessagingConsole.svelte`
- `MessageHeader.svelte`
- `MessageHistory.svelte`
- `MessageBubble.svelte`
- `ReplyBox.svelte`
- `QuickActions.svelte`
- `ContactDetailsPanel.svelte`
- `ContactInfo.svelte`
- `LeadInfo.svelte`
- `AIToggle.svelte`
- `ActivityTimeline.svelte`

**Rutas (1 archivo):**
- `src/routes/conversaciones/+page.svelte`

**Utils (2 archivos):**
- `src/lib/utils/date.utils.ts`
- `src/lib/utils/color.utils.ts`

#### Funcionalidad Completa

✅ Inbox con 3 vistas (All, Mine, Unassigned)
✅ Búsqueda y filtros avanzados
✅ Lista de conversaciones con badges y estados
✅ Mensajería en tiempo real con polling
✅ Envío de texto, audio y archivos
✅ Panel de detalles de contacto
✅ Control de AI automation
✅ Timeline de actividad
✅ Responsive design
✅ Accessibility básico

#### Métricas de Calidad

- **Coverage de API:** 95% de endpoints de conversations/leads/ai
- **File Size Compliance:** 100% (todos < 300 líneas)
- **TypeScript:** 100% tipado
- **Accessibility:** 80% WCAG 2.1 AA
- **Performance:** < 2s load time, < 100ms interacciones

---

## 🟡 FASE 2: LIFECYCLE MANAGEMENT (Semana 3)
**Duración:** 5 días hábiles
**Objetivo:** Gestión completa de etapas de ciclo de vida

### Funcionalidades

1. **LifecycleSettings.svelte** - CRUD de etapas
   - Crear, editar, eliminar, reordenar etapas
   - Configurar colores, íconos, win probability
   - Definir transiciones permitidas
   - Marcar etapas como visibles/ocultas

2. **StageSelector.svelte** - Cambio de etapa desde inbox
   - Dropdown en panel de contacto
   - Validación de transiciones
   - Notas al cambiar etapa
   - Confirmación de cambios

3. **StageTimeline.svelte** - Historial de cambios
   - Timeline visual de movimientos
   - Quién cambió, cuándo, por qué
   - Duración en cada etapa

4. **Mejoras a ConfigStageForm.svelte**
   - Ya refactorizado en Fase 0
   - Agregar validación de transiciones
   - Agregar configuración de automatizaciones

### Entregables Fase 2

- 4 componentes nuevos
- Integración con `/configuracion` existente
- Validación de transiciones funcionando
- Timeline de cambios visible en contacto

### Criterios de Éxito

- ✅ Administradores pueden gestionar lifecycle stages
- ✅ Agentes pueden cambiar etapa desde inbox
- ✅ Transiciones validadas según reglas
- ✅ Historial completo de cambios

---

## 🟡 FASE 3: CONTACTS + DASHBOARD (Semanas 4-5)
**Duración:** 7-10 días
**Objetivo:** Vista completa de contactos y dashboard con métricas

### 3.1 Módulo Contacts

**Componentes:**
1. **ContactsTable.svelte** - Tabla principal (~250 líneas)
   - Listado con paginación
   - Filtros por etapa, segmento, tags
   - Ordenamiento
   - Búsqueda

2. **ContactDetailView.svelte** - Vista detallada (~200 líneas)
   - Información completa del contacto
   - Historial de conversaciones
   - Edición de campos
   - Tags management

3. **ContactImportExport.svelte** - Importar/Exportar (~150 líneas)
   - Upload CSV
   - Mapeo de campos
   - Validación
   - Export a CSV/Excel

**Ruta:**
- `src/routes/contactos/+page.svelte`

### 3.2 Módulo Dashboard

**Componentes:**
1. **DashboardLayout.svelte** - Layout principal (~150 líneas)

2. **LifecycleFunnel.svelte** - Embudo de conversión (~200 líneas)
   - Visualización de etapas
   - Porcentajes de conversión
   - Total de leads por etapa

3. **MetricsCards.svelte** - Tarjetas de métricas (~150 líneas)
   - Total contactos
   - Contactos abiertos/cerrados
   - Tasa de conversión
   - Valor del pipeline

4. **TeamPerformance.svelte** - Performance del equipo (~180 líneas)
   - Lista de agentes
   - Conversaciones asignadas
   - Estado (online/offline)
   - Métricas individuales

5. **RecentActivity.svelte** - Actividad reciente (~120 líneas)

**Ruta:**
- `src/routes/dashboard/+page.svelte`

### Entregables Fase 3

- 8 componentes nuevos
- 2 rutas nuevas (`/contactos`, `/dashboard`)
- Servicios: `contacts.service.ts`, `dashboard.service.ts`
- Stores: `contacts.store.ts`, `dashboard.store.ts`

### Criterios de Éxito

- ✅ Vista de contactos con tabla completa
- ✅ Edición de contactos funcionando
- ✅ Dashboard con métricas en tiempo real
- ✅ Embudo de lifecycle visual
- ✅ Team performance dashboard

---

## 🟡 FASE 4: AI AGENTS (Semanas 6-7)
**Duración:** 10 días
**Objetivo:** Gestión completa de especialistas IA

### Componentes

1. **AIAgentsManager.svelte** - Lista de agentes (~200 líneas)
2. **CreateAgentWizard.svelte** - Wizard de 3 pasos (~250 líneas)
3. **AgentTemplates.svelte** - Plantillas predefinidas (~150 líneas)
4. **KnowledgeBaseUpload.svelte** - Upload de documentos (~180 líneas)
5. **AgentTestChat.svelte** - Chat de prueba (~200 líneas)
6. **BotConfiguration.svelte** - Configuración del bot (~220 líneas)

**Servicios:**
- `specialists.service.ts`
- `ai-config.service.ts`

**Ruta:**
- `src/routes/ai-agents/+page.svelte`

### Criterios de Éxito

- ✅ Crear agente desde cero
- ✅ Usar plantillas predefinidas
- ✅ Upload de documentos RAG
- ✅ Test de agente antes de publicar
- ✅ Publicar y asignar a instancia Evolution

---

## 🟢 FASE 5: SETTINGS (Semana 8)
**Duración:** 7 días
**Objetivo:** Configuración completa de workspace

### Componentes

**Organization:**
1. OrganizationSettings.svelte
2. UsersManagement.svelte
3. RolesPermissions.svelte

**Workspace:**
4. WorkspaceSettings.svelte
5. ChannelsIntegrations.svelte
6. SnippetsManager.svelte
7. TagsManager.svelte

**Personal:**
8. PersonalSettings.svelte
9. NotificationPreferences.svelte

**Ruta:**
- `src/routes/settings/+page.svelte`

---

## 🟢 FASE 6: REPORTS (Semana 9)
**Duración:** 5 días
**Objetivo:** Reportes y analytics

### Componentes

1. ReportsLayout.svelte
2. LifecycleReport.svelte
3. ConversationsReport.svelte
4. AgentsLeaderboard.svelte
5. BroadcastsReport.svelte

**Ruta:**
- `src/routes/reportes/+page.svelte`

---

## 🟢 FASE 7: BROADCASTS (Semana 10)
**Duración:** 7 días
**Objetivo:** Mensajes masivos

**NOTA:** Requiere implementar backend API primero.

### Componentes

1. BroadcastsManager.svelte
2. CreateBroadcast.svelte
3. AudienceSelector.svelte
4. MessageEditor.svelte
5. SchedulingOptions.svelte

---

## 🟢 FASE 8: WORKFLOWS (Semanas 11-12)
**Duración:** 10 días
**Objetivo:** Builder visual de workflows

**NOTA:** Requiere implementar backend API primero.

### Componentes

1. WorkflowBuilder.svelte (visual flow editor)
2. WorkflowTemplates.svelte
3. ActionBlocks/ (carpeta de bloques)
4. ConditionBlocks/ (carpeta de bloques)
5. TriggerSelector.svelte

---

## 📊 RESUMEN GENERAL

### Timeline Total

| Fase | Duración | Semanas | Prioridad |
|------|----------|---------|-----------|
| **Fase 0: Refactoring** | 3-4 días | 0.5 | 🔴 CRÍTICO |
| **Fase 1: Inbox** | 10 días | 2 | 🔴 CRÍTICO |
| **Fase 2: Lifecycle** | 5 días | 1 | 🟡 ALTA |
| **Fase 3: Contacts + Dashboard** | 7-10 días | 1.5 | 🟡 ALTA |
| **Fase 4: AI Agents** | 10 días | 2 | 🟡 ALTA |
| **Fase 5: Settings** | 7 días | 1 | 🟢 MEDIA |
| **Fase 6: Reports** | 5 días | 1 | 🟢 BAJA |
| **Fase 7: Broadcasts** | 7 días | 1 | 🟢 BAJA |
| **Fase 8: Workflows** | 10 días | 2 | 🟢 BAJA |
| **Total** | **64-67 días** | **12 semanas** | |

### Esfuerzo por Tipo de Trabajo

| Actividad | Días | % |
|-----------|------|---|
| Componentes UI | 35 | 53% |
| Servicios y Stores | 15 | 23% |
| Refactoring y Optimización | 8 | 12% |
| Testing y QA | 8 | 12% |

### Archivos Totales a Crear

- **Componentes:** ~80 archivos
- **Servicios:** ~12 archivos
- **Stores:** ~10 archivos
- **Tipos:** ~8 archivos
- **Utils:** ~6 archivos
- **Rutas:** ~10 archivos

**Total:** ~126 archivos nuevos

---

## 🎯 CRITERIOS DE ÉXITO GLOBALES

### Por Fase

Cada fase debe cumplir:
- ✅ 100% de archivos < 300 líneas
- ✅ 100% TypeScript tipado
- ✅ 80% test coverage (core files)
- ✅ 0 errores de TypeScript
- ✅ 0 violaciones de accessibility críticas
- ✅ Performance: < 2s load time
- ✅ Documentación JSDoc completa

### Al Final del Proyecto

- ✅ 10/10 módulos implementados
- ✅ 95%+ de API coverage
- ✅ Lighthouse score > 90
- ✅ WCAG 2.1 AA compliant
- ✅ 0 archivos > 300 líneas
- ✅ Mobile responsive
- ✅ Real-time updates funcionando
- ✅ Multi-tenant completamente funcional

---

## 🔍 TRACKING Y MONITOREO

### Checklist Diario

Al final de cada día:
- [ ] Archivos creados < 300 líneas
- [ ] TypeScript compila sin errores
- [ ] Componentes funcionan correctamente
- [ ] Tests unitarios pasando
- [ ] Git commit con mensaje descriptivo
- [ ] Documentación actualizada

### Checklist Semanal

Al final de cada semana:
- [ ] Todos los criterios de éxito de la fase cumplidos
- [ ] Code review realizado
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Demo funcional de la fase
- [ ] Actualizar IMPLEMENTATION_ROADMAP.md con progreso

### Métricas de Progreso

```
Progreso Total: [################____] 80%

Fase 0: [####################] 100% ✅
Fase 1: [####################] 100% ✅
Fase 2: [####################] 100% ✅
Fase 3: [###########_________]  55% 🔄
Fase 4: [____________________]   0% ⏳
Fase 5: [____________________]   0% ⏳
```

---

## 📚 REFERENCIAS

### Documentos Relacionados

- `rq.md` - Especificaciones de módulos
- `CLAUDE.md` - Guía de desarrollo y design system
- `card_implementation.md` - Implementación de cards (si existe)
- `.claude/CORE_VALIDATION_README.txt` - Validación de archivos core

### APIs Documentadas

- OpenAPI Spec: `https://crm.inewton.ai/openapi.json`
- Swagger UI: `https://crm.inewton.ai/api/docs`

### Design System

- Tailwind CSS v4
- shadcn-svelte components
- Paleta: `#71276f` (primary)

---

## 🚀 QUICK START

Para empezar a trabajar en una fase:

1. **Leer la sección de la fase** en este documento
2. **Crear branch:** `git checkout -b feature/fase-X-nombre`
3. **Seguir el checklist** día por día
4. **Ejecutar validaciones:** `npm run check`, `npm run test`
5. **Commit frecuente:** commits pequeños y descriptivos
6. **Al terminar la fase:** merge a main después de QA

---

**Última actualización:** 2025-11-15
**Mantenido por:** Claude Code Assistant
**Estado:** En desarrollo activo
