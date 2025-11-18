# NEWTON CRM - Quick Reference Guide
## Guía Rápida para Claude Code Assistant

**Última actualización:** 2025-11-15

---

## 🎯 OBJETIVO DEL PROYECTO

Construir el frontend completo de **Newton CRM**, una plataforma de Customer Conversation Management con 10 módulos, consumiendo una API REST ya implementada al 95%.

---

## 📊 ESTADO ACTUAL (2025-11-15)

```
Backend:  ████████████████░░  95% ✅
Frontend: ███░░░░░░░░░░░░░░  15% ⚠️
Total:    ████████░░░░░░░░░░  55%
```

### ✅ Ya Implementado

- Autenticación multi-tenant completa
- Kanban Pipeline con drag & drop
- Configuración básica de stages
- Sidebar + UI base components (shadcn-svelte)
- Design system coherente (Tailwind v4 + paleta #71276f)

### ❌ Pendiente (85%)

- Inbox (0%) - CRÍTICO
- Contacts (0%) - ALTA
- AI Agents (0%) - ALTA
- Dashboard (0%) - ALTA
- Settings completo (30%) - MEDIA
- Reports, Broadcasts, Workflows (0%) - BAJA

---

## 🚨 PROBLEMAS CRÍTICOS

### Violaciones de 300 Líneas (RESOLVER PRIMERO)

| Archivo | Líneas | Acción |
|---------|--------|--------|
| `kanban.board.svelte` | 339 | Extraer composables + subcomponentes |
| `ConfigStageForm.svelte` | 329 | Extraer ColorPicker + validators |
| `kanban.core.service.ts` | 311 | Dividir en 3 servicios |

**REGLA:** Ningún archivo puede exceder 300 líneas.

---

## 📋 ROADMAP SIMPLIFICADO

### Fase 0: Refactoring (3-4 días) 🔴 AHORA
- Resolver 3 violaciones de 300 líneas
- Crear composables y utilidades
- **Entregable:** Todos los archivos < 300 líneas

### Fase 1: Inbox (10 días) 🔴 CRÍTICO
- 3 paneles: ConversationsList + MessagingConsole + ContactDetails
- Envío de mensajes (text, audio, files)
- Polling real-time
- **Entregable:** Ruta `/conversaciones` funcional completa

### Fase 2: Lifecycle (5 días) 🟡 ALTA
- CRUD de etapas de lifecycle
- Cambio de etapa desde inbox
- Timeline de cambios
- **Entregable:** Gestión completa de stages

### Fase 3: Contacts + Dashboard (7-10 días) 🟡 ALTA
- Tabla de contactos con filtros
- Dashboard con métricas
- Embudo de conversión
- **Entregable:** Rutas `/contactos` y `/dashboard`

### Fase 4: AI Agents (10 días) 🟡 ALTA
- Wizard de creación de agentes
- Upload de knowledge base (RAG)
- Chat de prueba
- **Entregable:** Ruta `/ai-agents` funcional

### Fase 5-8: Settings, Reports, Broadcasts, Workflows (30 días) 🟢 MEDIA/BAJA
- Completar módulos restantes
- **Entregable:** Plataforma completa

**Total: ~12 semanas (~3 meses)**

---

## 🗂️ ARQUITECTURA DE CARPETAS

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/              # shadcn-svelte (button, input, etc.)
│   │   ├── inbox/           # Componentes del inbox (FASE 1)
│   │   ├── kanban/          # Kanban existente
│   │   ├── config/          # Configuración
│   │   ├── contacts/        # Contactos (FASE 3)
│   │   ├── dashboard/       # Dashboard (FASE 3)
│   │   ├── ai-agents/       # AI Agents (FASE 4)
│   │   └── settings/        # Settings (FASE 5)
│   ├── services/
│   │   ├── auth.service.ts          # ✅ Existente
│   │   ├── kanban.*.service.ts      # ✅ Existente (refactorizar)
│   │   ├── conversations.service.ts # ❌ CREAR (FASE 1)
│   │   ├── leads.service.ts         # ❌ CREAR (FASE 1)
│   │   ├── ai.service.ts            # ❌ CREAR (FASE 1)
│   │   └── ... (más servicios)
│   ├── stores/
│   │   ├── auth.store.ts            # ✅ Existente
│   │   ├── kanban.core.store.ts     # ✅ Existente
│   │   ├── inbox.store.ts           # ❌ CREAR (FASE 1)
│   │   ├── messaging.store.ts       # ❌ CREAR (FASE 1)
│   │   └── ... (más stores)
│   ├── types/
│   │   ├── inbox.types.ts           # ❌ CREAR (FASE 1)
│   │   └── ... (más tipos)
│   └── utils/
│       ├── cn.ts                    # ✅ Existente
│       ├── date.utils.ts            # ❌ CREAR (FASE 1)
│       └── color.utils.ts           # ❌ CREAR (FASE 0)
├── routes/
│   ├── login/+page.svelte           # ✅ Existente
│   ├── pipeline/+page.svelte        # ✅ Existente
│   ├── configuracion/+page.svelte   # ✅ Existente
│   ├── conversaciones/+page.svelte  # ❌ CREAR (FASE 1)
│   ├── contactos/+page.svelte       # ❌ CREAR (FASE 3)
│   ├── dashboard/+page.svelte       # ❌ CREAR (FASE 3)
│   └── ... (más rutas)
```

---

## 🔌 API ENDPOINTS CLAVE

### Conversaciones (Inbox - FASE 1)
```
GET  /api/v1/conversations/inbox              # Lista conversaciones
GET  /api/v1/conversations/{id}               # Conversación completa
POST /api/v1/conversations/{id}/messages      # Enviar mensaje
POST /api/v1/conversations/send-audio         # Enviar audio
POST /api/v1/conversations/send-file          # Enviar archivo
POST /api/v1/conversations/poll/messages      # Polling
```

### Leads (Contactos - FASE 1/3)
```
GET   /api/v1/leads/                  # Lista leads
GET   /api/v1/leads/{id}/detail       # Detalle completo
PATCH /api/v1/leads/{id}/move         # Cambiar etapa
PATCH /api/v1/leads/{id}/assign       # Asignar agente
PUT   /api/v1/leads/{id}              # Actualizar
```

### AI (FASE 1/4)
```
POST /api/v1/ai/leads/{id}/toggle     # Toggle AI/Manual
GET  /api/v1/ai/leads/{id}/status     # Estado AI
POST /api/v1/ai/leads/{id}/pause-ai   # Pausar AI
POST /api/v1/ai/leads/{id}/resume-ai  # Reanudar AI
```

### Specialists (AI Agents - FASE 4)
```
GET  /api/v1/specialists/list                 # Lista especialistas
POST /api/v1/specialists/create               # Crear
POST /api/v1/specialists/{id}/documents       # Upload docs RAG
POST /api/v1/specialists/{id}/test            # Test
POST /api/v1/specialists/{id}/publish         # Publicar
```

### Kanban (Lifecycle - FASE 2)
```
GET    /api/v1/kanban/stages/          # Lista etapas
POST   /api/v1/kanban/stages/          # Crear etapa
PUT    /api/v1/kanban/stages/{id}      # Actualizar
DELETE /api/v1/kanban/stages/{id}      # Eliminar
POST   /api/v1/kanban/validate-transition  # Validar transición
```

**Total API Endpoints Disponibles: ~113**

---

## 🎨 DESIGN SYSTEM

### Paleta de Colores

```css
/* Primary Colors */
--color-primary: #71276f;      /* Morado principal */
--color-secondary: #571d54;
--color-tertiary: #3d1438;
--color-dark: #090000;

/* Semantic Colors */
--background: 0 0% 100%;        /* white */
--foreground: 0 100% 4%;        /* #090000 */
--primary: 302 47% 30%;         /* #71276f */
--muted: 0 0% 96%;
--border: 0 0% 90%;
```

### Tipografía

- **Font:** Montserrat (300, 400, 500, 600, 700)
- **H1:** 32px / 2rem, weight 700
- **H2:** 18px / 1.125rem, weight 600
- **Body:** 14px / 0.875rem, weight 400
- **Small:** 12px / 0.75rem, weight 400

### Componentes UI (shadcn-svelte)

**Existentes:**
- Button, Input, Badge, Label, Separator, Dialog

**A Crear (FASE 1):**
- Tabs, Avatar, ScrollArea, Textarea, Toggle, DropdownMenu

### Uso

```svelte
<script>
  import { Button } from '$lib/components/ui/button'
  import { cn } from '$lib/utils'
</script>

<Button variant="default" size="default">Click me</Button>
<div class={cn('base-class', condition && 'conditional-class')}>
```

---

## 📐 PATRONES DE CÓDIGO

### Svelte 5 Runes Mode (OBLIGATORIO)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    variant?: 'default' | 'primary'
    class?: string
    children?: Snippet
  }

  // ✅ CORRECTO: Usar $props()
  let { variant = 'default', class: className, children }: Props = $props()

  // ✅ CORRECTO: Usar $state()
  let count = $state(0)

  // ✅ CORRECTO: Usar $derived()
  let doubled = $derived(count * 2)

  // ✅ CORRECTO: Usar $effect()
  $effect(() => {
    console.log('Count changed:', count)
  })
</script>

<div class={cn('base', className)}>
  {#if children}
    {@render children()}
  {/if}
</div>
```

### Servicios API

```typescript
// src/lib/services/example.service.ts
import { handleApiError, authenticatedFetch } from './api.utils'
import type { Response } from '$lib/types'

const BASE_URL = '/api/v1/example'

export const exampleService = {
  /**
   * Get items
   * @endpoint GET /api/v1/example/
   */
  async getItems(): Promise<Response[]> {
    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/`,
        { timeout: 10000 }
      )
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
```

### Stores Reactivos

```typescript
// src/lib/stores/example.store.ts
import { writable, derived } from 'svelte/store'

// State
export const items = writable<Item[]>([])
export const isLoading = writable(false)

// Derived
export const itemCount = derived(
  items,
  ($items) => $items.length
)

// Actions
export const exampleActions = {
  async loadItems() {
    isLoading.set(true)
    try {
      const data = await exampleService.getItems()
      items.set(data)
    } finally {
      isLoading.set(false)
    }
  }
}
```

---

## ✅ CHECKLIST DE CALIDAD

Antes de considerar un componente/servicio completo:

### Por Archivo
- [ ] Líneas < 300 (CRÍTICO)
- [ ] TypeScript tipado 100%
- [ ] JSDoc en funciones públicas
- [ ] Manejo de errores robusto
- [ ] Loading states
- [ ] Empty states
- [ ] Error states

### Por Componente
- [ ] Props tipados con interface
- [ ] Usa design system (cn, colors, spacing)
- [ ] Responsive design
- [ ] Accessibility (ARIA, keyboard)
- [ ] Performance optimizado

### Por Feature
- [ ] Integrado con API real
- [ ] Store reactivo funcionando
- [ ] Real-time updates (si aplica)
- [ ] Tests unitarios (archivos core)
- [ ] Documentación actualizada

---

## 🚀 COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Verificación
npm run check            # TypeScript check
npm run lint             # ESLint
npm run format           # Prettier

# Testing
npm run test             # Ejecuta tests
npm run test:coverage    # Coverage report

# Build
npm run build            # Build producción
npm run preview          # Preview build

# Git
git status               # Ver cambios
git add .                # Agregar todos
git commit -m "message"  # Commit
git push                 # Push a remote
```

---

## 📚 DOCUMENTOS CLAVE

1. **IMPLEMENTATION_ROADMAP.md** (este documento completo)
   - Fases detalladas día por día
   - Componentes, servicios, stores
   - Código de ejemplo

2. **rq.md** (especificaciones de negocio)
   - Módulos funcionales
   - Reglas de negocio
   - Flujos de usuario

3. **CLAUDE.md** (guía de desarrollo)
   - Design system
   - Arquitectura general
   - Convenciones de código

4. **card_implementation.md** (implementación de cards)
   - Detalles de tarjetas Kanban

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### HOY (Día 1)

1. **Resolver violaciones de 300 líneas** (Fase 0)
   - Refactorizar `kanban.board.svelte`
   - Refactorizar `ConfigStageForm.svelte`
   - Dividir `kanban.core.service.ts`

2. **Preparar Fase 1**
   - Leer sección completa de Fase 1 en IMPLEMENTATION_ROADMAP.md
   - Crear branch: `git checkout -b feature/fase-1-inbox`

### ESTA SEMANA

3. **Fase 1 - Día 1-2: Fundamentos**
   - Crear `inbox.types.ts`
   - Implementar `conversations.service.ts`
   - Implementar `leads.service.ts`
   - Implementar `ai.service.ts`
   - Crear `inbox.store.ts`
   - Crear `messaging.store.ts`

4. **Fase 1 - Día 3-4: UI Components**
   - Crear componentes shadcn faltantes
   - Tabs, Avatar, ScrollArea, Textarea, Toggle, DropdownMenu

### PRÓXIMAS 2 SEMANAS

5. **Completar Fase 1: Inbox**
   - Layout 3 paneles
   - Lista de conversaciones
   - Mensajería completa
   - Panel de contacto
   - Polling real-time
   - Ruta `/conversaciones`

---

## 💡 TIPS PARA CLAUDE CODE ASSISTANT

### Al Empezar una Sesión

1. Lee **QUICK_REFERENCE.md** (este archivo)
2. Lee la sección de la **fase actual** en IMPLEMENTATION_ROADMAP.md
3. Verifica el **estado actual** con `git status`
4. Revisa los **archivos recientes** modificados

### Durante el Desarrollo

1. **Respetar límite de 300 líneas** siempre
2. **Usar TypeScript** en todo
3. **Seguir patrones de código** documentados
4. **Documentar con JSDoc** funciones públicas
5. **Commits frecuentes** y descriptivos

### Al Terminar una Tarea

1. **Verificar calidad** con checklist
2. **Ejecutar** `npm run check`
3. **Commit** con mensaje claro
4. **Actualizar** IMPLEMENTATION_ROADMAP.md con progreso

### Cuando te Pierdas

1. Vuelve a leer **QUICK_REFERENCE.md**
2. Consulta la **fase actual** en IMPLEMENTATION_ROADMAP.md
3. Revisa **rq.md** para especificaciones de negocio
4. Consulta **CLAUDE.md** para design system

---

## 📞 REFERENCIA RÁPIDA DE CONTEXTO

### Cuando el usuario pregunta...

**"¿En qué estamos?"**
→ Consultar "ESTADO ACTUAL" en este documento

**"¿Qué sigue?"**
→ Consultar "PRÓXIMOS PASOS INMEDIATOS"

**"¿Cómo está el proyecto?"**
→ Mostrar métricas de progreso de IMPLEMENTATION_ROADMAP.md

**"¿Qué API tenemos?"**
→ Consultar "API ENDPOINTS CLAVE" en este documento

**"¿Cómo hago X componente?"**
→ Consultar "PATRONES DE CÓDIGO" + sección de fase en ROADMAP

**"¿Cuánto falta?"**
→ Consultar "ROADMAP SIMPLIFICADO" - Total: ~12 semanas

---

## 🎨 EJEMPLO VISUAL DEL INBOX (Objetivo FASE 1)

```
┌─────────────────────────────────────────────────────────┐
│  Navbar                                                 │
├────┬─────────────┬─────────────────┬───────────────────┤
│Nav │Conversations│   Messaging     │   Contact Details │
│Bar │   List      │    Console      │                   │
│    │(280px)      │   (flex-1)      │     (320px)       │
│💬  │             │                 │                   │
│📊  │Tabs:        │Header:          │Info:              │
│👥  │• All (24)   │• María G. 🟢    │• 👤 Avatar       │
│🎯  │• Mine (12)  │• [Actions]      │• 📧 Email        │
│⚙️  │• Unassig(5) │                 │• 📞 Phone        │
│    │             │History:         │• 🏢 Country      │
│    │🔍 Search... │[Messages]       │                   │
│    │             │                 │Lead:              │
│    │Filters      │Reply:           │• Stage: Explo    │
│    │             │💬 [Text box]    │• Score: 75       │
│    │◉ María G.   │🎤 📎 😊        │• Priority: High  │
│    │  Hola...    │                 │                   │
│    │  5m 🔴      │                 │AI: ○ Enabled     │
│    │             │                 │                   │
│    │○ Juan P.    │                 │Activity:         │
│    │  Gracias... │                 │[Timeline]        │
└────┴─────────────┴─────────────────┴───────────────────┘
```

---

**FIN DE QUICK REFERENCE**

Para detalles completos de implementación, consultar **IMPLEMENTATION_ROADMAP.md**
