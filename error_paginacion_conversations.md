# Error de Paginación - Conversaciones Inbox

**Fecha:** 2025-11-16
**Estado:** En investigación - No resuelto

---

## 🔴 Problema Principal

El sistema de paginación del inbox sigue sin funcionar correctamente después de múltiples correcciones.

### Síntomas Observados

1. **Carga prematura de página 2:**
   - Se dispara `loadMore()` antes de completar la carga inicial
   - Logs muestran race condition entre carga inicial y scroll handler

2. **Orden de ejecución incorrecto:**
   ```
   [PAGINATION] Loading page 2 with limit 20          ← Se dispara primero
   [INBOX] Initial page loaded - 20 conversations     ← Luego carga página 1
   [INBOX] Viewport fill complete - 20 conversations
   [INBOX] Loaded 20 conversations (page 2/493)       ← Página 2 se carga igual
   ```

3. **Resultado:** Comportamiento impredecible de paginación

---

## ✅ Verificaciones Realizadas

### Backend (Funcionando correctamente)
- ✅ API retorna 20 conversaciones en `/conversations/inbox?page=1&limit=20`
- ✅ Metadata correcta: `has_more: true`, `total: 9849`, `pages: 493`
- ✅ Estructura de respuesta cumple con `InboxResponse`

### Frontend (Código implementado)
- ✅ Nuevo servicio `conversations.inbox.service.ts` con metadata
- ✅ Auto-fill de viewport en `inbox.init.ts`
- ✅ Guards en `handleScroll` para prevenir ejecución prematura
- ✅ Uso de `has_more` del API en lugar de heurística `data.length < limit`

---

## 🔧 Correcciones Aplicadas

### 1. Sistema de Paginación con Metadata del API
**Archivos:**
- `src/lib/types/inbox.types.ts` - Tipo `InboxResponse`
- `src/lib/services/conversations.inbox.service.ts` - Servicio nuevo
- `src/lib/stores/inbox.init.ts` - Auto-fill viewport
- `src/lib/stores/inbox.pagination.actions.ts` - Uso de `has_more`

### 2. Corrección de Loop Infinito (Selección de Conversación)
**Archivo:** `src/routes/conversaciones/+page.svelte`
- Usar `conversation.lead_id` en lugar de `conversation.id` para `loadConversation()`

### 3. Guard en handleScroll
**Archivo:** `src/lib/components/inbox/ConversationsList.svelte`
```typescript
if (conversations.length === 0) return;
```

---

## 🐛 Problema Persistente

### Race Condition en Carga Inicial

**Hipótesis:**
El `handleScroll` se está disparando de alguna forma incluso con el guard de `conversations.length === 0`.

**Posibles causas:**
1. **Timing del evento scroll:**
   - El evento scroll se dispara justo después de que se agregan conversaciones
   - Pero antes de que se complete el render completo

2. **Múltiples fuentes de disparo:**
   - ¿Hay algún `$effect` o `$derived` que esté llamando a `onLoadMore`?
   - ¿Algún observer o listener adicional?

3. **Problema de reactividad:**
   - El binding bidireccional podría estar causando renders múltiples
   - Cada render podría disparar el scroll handler

---

## 📋 Próximos Pasos a Investigar

### 1. Revisar todos los disparadores de `loadMore()`

**Buscar en codebase:**
```bash
grep -r "onLoadMore" src/
grep -r "loadMore" src/lib/components/inbox/
grep -r "paginationActions.loadMore" src/
```

**Verificar:**
- ¿Hay `$effect()` que llame a `loadMore`?
- ¿Hay otros event handlers que disparen `loadMore`?
- ¿Intersection Observer configurado incorrectamente?

### 2. Deshabilitar temporalmente el scroll handler

**Probar:**
```typescript
function handleScroll(event: Event) {
  console.log('[DEBUG] handleScroll triggered', {
    conversations: conversations.length,
    hasMore,
    isLoadingMore
  });
  return; // ← Deshabilitar completamente
}
```

**Verificar:**
- ¿Se sigue disparando `loadMore()` sin el handler?
- Si sí → hay otra fuente
- Si no → el problema está en el timing del scroll event

### 3. Agregar logging exhaustivo

**En `handleScroll`:**
```typescript
function handleScroll(event: Event) {
  console.log('[SCROLL] Event triggered', {
    conversations_length: conversations.length,
    hasMore,
    isLoadingMore,
    timestamp: new Date().toISOString()
  });

  if (!onLoadMore || !hasMore || isLoadingMore) {
    console.log('[SCROLL] Blocked by guard 1');
    return;
  }

  if (conversations.length === 0) {
    console.log('[SCROLL] Blocked by guard 2 (empty list)');
    return;
  }

  // ... resto del código
}
```

### 4. Revisar componente padre

**Archivo:** `src/routes/conversaciones/+page.svelte`

**Verificar:**
- Función `loadMore()` (línea 66-69)
- ¿Se está llamando desde otro lado?
- ¿Hay algún efecto reactivo que la dispare?

### 5. Revisar IntersectionObserver

**En ConversationsList.svelte:**
```typescript
let sentinel: HTMLDivElement | undefined = $state();
let observer: IntersectionObserver | null = null;
```

**Preguntas:**
- ¿Está configurado el observer?
- ¿Podría estar disparando `loadMore` también?
- ¿Hay conflicto entre scroll handler y observer?

### 6. Simplificar el flujo

**Opción temporal:**
Deshabilitar auto-fill y dejarlo manual:

```typescript
// En inbox.init.ts, comentar el while loop
// while (get(hasMore) && get(conversations).length < limit) {
//   await paginationActions.loadMore(token, priority);
// }

// Solo cargar página 1 y dejar que el usuario haga scroll
```

---

## 🔍 Comandos de Debugging

### Buscar todos los puntos donde se llama loadMore
```bash
cd /home/debian/newton
grep -rn "loadMore" src/lib/components/inbox/
grep -rn "loadMore" src/routes/conversaciones/
grep -rn "paginationActions" src/
```

### Ver estructura del componente ConversationsList
```bash
grep -A 30 "onMount\|effect" src/lib/components/inbox/ConversationsList.svelte
```

### Verificar bindings bidireccionales
```bash
grep "bind:" src/routes/conversaciones/+page.svelte
```

---

## 📊 Estado del Código

### Archivos Modificados (Última Sesión)
1. ✅ `src/lib/types/inbox.types.ts` - InboxResponse
2. ✅ `src/lib/services/conversations.inbox.service.ts` - Nuevo servicio
3. ✅ `src/lib/stores/inbox.init.ts` - Auto-fill viewport
4. ✅ `src/lib/stores/inbox.pagination.actions.ts` - has_more
5. ✅ `src/lib/stores/inbox.store.ts` - Modularizado
6. ✅ `src/lib/stores/inbox.mock.ts` - Mock data separado
7. ✅ `src/routes/conversaciones/+page.svelte` - lead_id fix
8. ✅ `src/lib/components/inbox/ConversationsList.svelte` - Guard added

### Compilación
- ✅ `npm run check` → 0 errores, 6 warnings (CSS)

---

## 💡 Teoría Actual

El problema NO es el guard en `handleScroll`, sino que **hay múltiples fuentes disparando `loadMore()`**:

1. ✅ Scroll handler (con guard)
2. ❓ Posible `$effect` desconocido
3. ❓ Intersection Observer
4. ❓ Reactividad del binding bidireccional
5. ❓ Otro event listener

**Acción recomendada:**
Hacer búsqueda exhaustiva de todos los lugares donde se invoca `loadMore` o `paginationActions.loadMore`.

---

## 📝 Notas Adicionales

- El backend está funcionando perfectamente (verificado con curl)
- El problema es exclusivamente del frontend
- Los logs muestran que el código nuevo está cargando
- La race condition persiste a pesar de los guards

**Último log observado:**
```
[PAGINATION] Loading page 2 with limit 20
[INBOX] Initial page loaded - 20 conversations, has_more: true, total: 9849
[INBOX] Viewport fill complete - 20 conversations loaded, has_more: true
[INBOX] Loaded 20 conversations (page 2/493, has_more: true)
[PAGINATION] Page 2 loaded - has_more: true
```

---

## 🎯 Objetivo para Mañana

1. Encontrar TODAS las fuentes que disparan `loadMore()`
2. Eliminar o condicionar las fuentes incorrectas
3. Asegurar que solo el scroll manual del usuario dispare paginación
4. Verificar que el auto-fill funcione sin race conditions

---

**Fin del reporte**
