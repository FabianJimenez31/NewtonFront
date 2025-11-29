# Gemini.md

This file provides guidance to Gemini when working with code in this repository.

---

## Project Overview

**Newton CRM** is a customer relationship management system with a Svelte-based frontend that consumes the official API at `https://crm.inewton.ai/api/docs`.

---

## 1. General Principles

* **Svelte is the single source of truth**. The entire frontend is developed from scratch in Svelte, with no dependencies on other frameworks or legacy code.
* **API First Architecture**: all system functionality is built by directly consuming API endpoints. No workflow should depend on local or simulated logic.
* **Component-based structure**: each functional API module will have its own set of Svelte components (view, store, service).
* **Incremental development**: the frontend is built progressively, API by API, until covering the complete spectrum of `https://crm.inewton.ai/api/docs`.
* **Strict typing and validation**: all endpoints must be documented with their response schemas (`zod` or `typescript interfaces`).

---

## 2. Design System

### Technology Stack

**Newton CRM uses a modern design system built with:**

* **Tailwind CSS v4** - Utility-first CSS framework
* **shadcn-svelte** - High-quality, accessible component library
* **bits-ui** - Headless component primitives
* **lucide-svelte** - Icon library

### Setup and Configuration

**Installed packages:**
```bash
npm install -D tailwindcss @tailwindcss/postcss autoprefixer
npm install -D @tailwindcss/typography clsx tailwind-merge tailwind-variants
npm install -D shadcn-svelte bits-ui
npm install lucide-svelte
```

**Configuration files:**
- `tailwind.config.js` - Tailwind configuration with theme extensions
- `postcss.config.js` - PostCSS with @tailwindcss/postcss plugin
- `src/app.css` - Global styles and CSS variables

### Color Palette

**CSS Variables (Legacy format for compatibility):**

```css
--color-primary: #71276f;    /* Primary color - column headers */
--color-secondary: #571d54;  /* Secondary color */
--color-tertiary: #3d1438;   /* Tertiary color */
--color-quaternary: #230a1c; /* Quaternary color */
--color-dark: #090000;       /* Darkest color */
--color-background: #ffffff; /* White background */
--color-text: #090000;       /* Primary text */
--color-text-muted: #71717A; /* Secondary text */
--color-border: #e5e5e5;     /* Borders */
```

**Shadcn Theme Variables (HSL format for shadcn components):**

```css
--background: 0 0% 100%;     /* white */
--foreground: 0 100% 4%;     /* #090000 */
--primary: 302 47% 30%;      /* #71276f */
--secondary: 302 53% 22%;    /* #571d54 */
--tertiary: 302 48% 16%;     /* #3d1438 */
--quaternary: 302 55% 10%;   /* #230a1c */
--dark: 0 100% 2%;           /* #090000 */
--muted: 0 0% 96%;
--accent: 0 0% 96%;
--border: 0 0% 90%;
--input: 0 0% 90%;
--ring: 302 47% 30%;
```

**Usage in Tailwind:**
```html
<!-- Use semantic color classes -->
<div class="bg-primary text-primary-foreground">Primary button</div>
<div class="bg-secondary text-secondary-foreground">Secondary button</div>
<div class="bg-background text-foreground">Content</div>
<div class="border border-border">Card with border</div>
```

### Typography

* **Primary Font:** Montserrat (Google Fonts)
* **Weights:** 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
* **Font loading:** Imported via Google Fonts in `src/app.css`

**Text Sizes:**

* Main title (h1): 32px / 2rem, weight 700
* Column title: 18px / 1.125rem, weight 600
* Contact name: 14px / 0.875rem, weight 600
* Message text: 14px / 0.875rem, weight 400
* Timestamp: 12px / 0.75rem, weight 400
* Sidebar menu: 14px / 0.875rem, weight 500

**Tailwind text utilities:**
```html
<h1 class="text-2xl font-bold">Main Title</h1>
<h2 class="text-lg font-semibold">Section Title</h2>
<p class="text-sm font-medium">Body text</p>
<small class="text-xs">Timestamp</small>
```

### Spacing

**CSS Variables:**
```css
--spacing-xs: 8px;
--spacing-sm: 12px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

**Tailwind spacing scale:**
* Card padding: `p-4` (16px)
* Gap between cards: `gap-3` (12px)
* Gap between columns: `gap-4` (16px)
* Sidebar padding: `p-4` (16px)
* Margin between sections: `mt-6` (24px)

### Borders and Shadows

**CSS Variables:**
```css
--radius: 0.5rem;
--radius-card: 8px;
--radius-button: 6px;
--shadow-card: 0 1px 3px rgba(0,0,0,0.1);
--shadow-card-hover: 0 4px 12px rgba(113,39,111,0.15);
```

**Tailwind utilities:**
```html
<div class="rounded-lg">Card (8px radius)</div>
<div class="rounded-md">Button (6px radius)</div>
<div class="shadow-sm">Card shadow</div>
```

### UI Components (shadcn-svelte)

**Location:** `src/lib/components/ui/`

**Available components:**

1. **Button** (`ui/button.svelte`)
   - Variants: `default`, `secondary`, `tertiary`, `ghost`, `link`
   - Sizes: `default`, `sm`, `lg`, `icon`
   - Usage:
   ```svelte
   <Button variant="default" size="default">Click me</Button>
   <Button variant="ghost" size="icon"><Icon /></Button>
   ```

2. **Separator** (`ui/separator.svelte`)
   - Orientations: `horizontal`, `vertical`
   - Usage:
   ```svelte
   <Separator orientation="horizontal" />
   ```

**Adding new shadcn components:**

All components should:
- Use the `cn()` utility for class merging from `$lib/utils`
- Follow Svelte 5 runes mode (use `$props()`, `$state()`, etc.)
- Use `Snippet` type for children props
- Be fully typed with TypeScript interfaces
- Support theming via CSS variables

**Example component structure:**
```svelte
<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'secondary';
    class?: string;
    children?: Snippet;
  }

  let { variant = 'default', class: className, children }: Props = $props();
</script>

<div class={cn('base-classes', variantClasses[variant], className)}>
  {#if children}
    {@render children()}
  {/if}
</div>
```

### Utility Functions

**`cn()` function** (`src/lib/utils/cn.ts`):
- Combines `clsx` and `tailwind-merge` for optimal class merging
- Usage: `cn('base-class', condition && 'conditional-class', className)`
- Automatically deduplicates and resolves Tailwind class conflicts

---

## 3. Components

### 1. Sidebar (Sidebar.svelte)

**Location:** `src/lib/components/Sidebar.svelte`

**Implementation:** Built with shadcn-svelte components (Button, Separator) and Tailwind CSS

**Structure:**

* Header with logo/title "Ventas CRM"
* Collapse/expand button (chevron icon) using `Button` component with `ghost` variant
* Menu list with icons from `lucide-svelte`:
  * Pipeline (`LayoutDashboard`)
  * Conversaciones (`MessageSquare`)
  * Contactos (`Users`)
  * Objetivos (`Target`)
  * Reportes (`BarChart`)
  * Configuración (`Settings`)
* Separator components between sections
* Footer with avatar and user data

**Props:**
```typescript
interface Props {
  activeItem?: string;  // Default: 'pipeline'
  class?: string;       // Additional CSS classes
}
```

**States:**

* Expanded: 256px width (w-64)
* Collapsed: 64px width (w-16)
* Active item: `bg-primary text-primary-foreground` classes
* Hover item: `hover:bg-accent hover:text-accent-foreground` classes
* Smooth transitions: `transition-all duration-300`

**Usage:**
```svelte
<Sidebar activeItem="pipeline" />
<Sidebar activeItem="conversaciones" class="custom-class" />
```

**Key Features:**
- Reactive state with `$state()` rune for expand/collapse
- Dynamic icon rendering using `{@const Icon = item.icon}`
- Conditional rendering based on `isExpanded` state
- Fully accessible with proper button semantics
- Integrates with SvelteKit routing

### 2. KanbanBoard (KanbanBoard.svelte)

**Structure:**

* Header with title and description
* Horizontal scrollable container with columns
* 5 columns with gradient colors from palette

### 3. KanbanColumn (KanbanColumn.svelte)

**Props:**

* `title`: string
* `color`: string (hex)
* `conversations`: array

**Structure:**

* Header with background color (from palette), centered white title, conversation counter
* Card container with vertical scroll
* Empty state: message "No hay conversaciones en esta etapa"

### 4. ConversationCard (ConversationCard.svelte)

**Props:**

* `contactName`: string
* `lastMessage`: string
* `timestamp`: string
* `unreadCount`: number (optional)

**Structure:**

* Header: user icon + contact name + unread badge (if > 0)
* Body: message icon + last message text (max 2 lines, truncated)
* Footer: clock icon + timestamp

**States:**

* Default: white background, light gray border
* Hover: elevated shadow, pointer cursor
* Unread badge: color-primary background, white text, full border-radius

---

## 4. Example Data

```javascript
{
  id: '1',
  contactName: 'María González',
  lastMessage: 'Hola, estoy interesada en conocer más sobre sus servicios...',
  timestamp: 'Hace 5 min',
  unreadCount: 2,
  stage: 'exploracion'
}
```

Example distribution:

* Exploración (#71276f): 3 conversations
* Calificado (#571d54): 2 conversations
* Propuesta Enviada (#3d1438): 2 conversations
* En Negociación (#230a1c): 1 conversation
* Cerrado (#090000): 1 conversation

---

## 5. Main Layout

### Visual Structure

```
┌─────────────────────────────────────────┐
│  Sidebar  │  Main Content Area          │
│           │  ┌─────────────────────┐    │
│  Logo     │  │ Pipeline de Ventas  │    │
│  [<]      │  │ Descripción         │    │
│           │  └─────────────────────┘    │
│  Pipeline │                             │
│  Conversa │  ┌───┬───┬───┬───┬───┐     │
│  Contacto │  │ 1 │ 2 │ 3 │ 4 │ 5 │     │
│  Objetivo │  │   │   │   │   │   │     │
│  Reportes │  │ □ │ □ │ □ │ □ │ □ │     │
│  Config   │  │ □ │   │ □ │   │   │     │
│           │  │ □ │   │ □ │   │   │     │
│  ─────    │  └───┴───┴───┴───┴───┘     │
│  [U]      │                             │
│  Usuario  │                             │
└─────────────────────────────────────────┘
```

### Layout Implementation

**Root Layout** (`src/routes/+layout.svelte`):

```svelte
<script lang="ts">
  import '../app.css';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { page } from '$app/stores';

  // Determine active menu item based on current route
  $: activeItem = $page.url.pathname.split('/')[1] || 'pipeline';

  // Check if we're on the login page
  $: isLoginPage = $page.url.pathname === '/login';
</script>

{#if isLoginPage}
  <!-- Login page without sidebar -->
  <slot />
{:else}
  <!-- Main app layout with sidebar -->
  <div class="flex h-screen overflow-hidden">
    <Sidebar {activeItem} />
    <main class="flex-1 overflow-y-auto bg-background">
      <slot />
    </main>
  </div>
{/if}
```

**Key Features:**
* Conditional rendering: Sidebar hidden on `/login` page
* Automatic active item detection from URL pathname
* Flex layout with fixed sidebar and scrollable main content
* Full viewport height (`h-screen`)
* Responsive by default (Sidebar handles its own collapse state)

**Responsive Behavior:**

* Desktop (>1024px): Expanded sidebar (256px)
* Tablet (768–1024px): User can toggle between expanded/collapsed
* Mobile (<768px): Collapsed sidebar (64px) by default
* Future: Implement overlay/drawer mode for mobile

**Icon Library:**

* **Current:** `lucide-svelte` (recommended and implemented)
* **Alternatives:** `svelte-icons`, `heroicons`

**Navigation Flow:**

1. User clicks menu item in Sidebar
2. SvelteKit handles client-side navigation
3. Layout detects route change via `$page` store
4. Active item automatically updates
5. Page content renders in `<slot />`

---

## 6. Development Requirements

* Clean and well-commented code
* Reusable components
* Typed props (TypeScript recommended)
* Smooth transitions (300ms ease-in-out)
* Basic accessibility (ARIA labels, keyboard navigation)
* Professional, clean, and polished design

---

## 7. Architecture Guidelines

### File Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/                      # shadcn-svelte base components
│   │   │   ├── button.svelte
│   │   │   ├── separator.svelte
│   │   │   └── index.ts
│   │   ├── Sidebar.svelte           # Main navigation sidebar
│   │   ├── KanbanBoard.svelte       # To be implemented
│   │   ├── KanbanColumn.svelte      # To be implemented
│   │   └── ConversationCard.svelte  # To be implemented
│   ├── utils/
│   │   ├── cn.ts                    # Class name utility (clsx + tailwind-merge)
│   │   └── index.ts
│   ├── stores/
│   │   └── [API module stores]
│   ├── services/
│   │   └── [API service modules]
│   └── types/
│       └── [TypeScript interfaces/types]
├── routes/
│   ├── +layout.svelte               # Main layout with Sidebar integration
│   └── [SvelteKit routes]
├── app.css                          # Global styles and CSS variables
├── tailwind.config.js               # Tailwind configuration
└── postcss.config.js                # PostCSS configuration
```

**Key directories:**

* `lib/components/ui/` - Reusable UI components from shadcn-svelte
* `lib/components/` - Application-specific components
* `lib/utils/` - Utility functions (cn, helpers, etc.)
* `routes/` - SvelteKit file-based routing

### API Integration

* All API calls must go through dedicated service modules in `src/lib/services/`
* Services should be organized by API domain (e.g., `conversations.service.ts`, `contacts.service.ts`)
* Use Svelte stores for state management when consuming API data
* Implement proper error handling and loading states for all API interactions

### Code Standards

* Use TypeScript for type safety
* Follow consistent naming conventions (PascalCase for components, camelCase for variables/functions)
* Keep components focused and single-purpose
* Extract reusable logic into utility functions or composables
* Document complex logic with inline comments

**Svelte 5 Runes Mode:**
* Use `$props()` for component props instead of `export let`
* Use `$state()` for reactive state instead of `let` with reactivity
* Use `$derived()` for computed values instead of `$:`
* Use `$effect()` for side effects instead of `$:` statements
* Use `Snippet` type for children props
* Use `{@render}` for rendering snippets
* Use `{@const}` for local constants inside `{#each}`, `{#if}`, etc.

**Tailwind CSS Best Practices:**
* Use the `cn()` utility for conditional and merged classes
* Prefer Tailwind utility classes over custom CSS when possible
* Use semantic color variables (`bg-primary`, `text-foreground`, etc.)
* Keep custom CSS in `app.css` for global styles only
* Use `@layer` directives for Tailwind customizations

**shadcn-svelte Component Guidelines:**
* Import UI components from `$lib/components/ui`
* Always pass the `class` prop for custom styling
* Use consistent prop patterns (variant, size, class)
* Maintain accessibility with proper ARIA attributes
* Support dark mode through CSS variables (future consideration)

### Core Files Naming Convention

**Critical files** (business-critical code requiring exhaustive validation) must be identified using one of these methods:

**Method 1 - File Naming Pattern:** Include `.core.` in the filename

```
✅ Valid examples:
kanban.core.stage.ts
auth.core.service.ts
payment.core.gateway.svelte
conversation.core.message.ts
user.core.store.ts

❌ Invalid examples:
kanban-core-stage.ts    (uses hyphens instead of dots)
kanbancore.stage.ts     (missing dot before "core")
core.kanban.ts          (core at beginning, not middle)
kanban_core_stage.ts    (uses underscores instead of dots)
```

**Method 2 - Code Marker:** Add `@core` or `@critical` comment at the beginning

```typescript
// @core
export class PaymentService { }
```

```typescript
/**
 * @critical
 * Business-critical authentication service
 */
export class AuthService { }
```

**Recommended Pattern:** `[module].core.[entity].[type]`

Examples for Newton CRM modules:
```
kanban.core.stage.ts
kanban.core.column.ts
conversation.core.message.ts
conversation.core.contact.ts
auth.core.service.ts
auth.core.store.ts
payment.core.gateway.ts
payment.core.processor.ts
```

**Validation:** Core files trigger automatic validation hooks (pre/post modification) to ensure business continuity:
- Pre-modification: Extract contract baseline, smoke test
- Post-modification: Validate compilation, compare contracts, block if errors
- See `.claude/CORE_VALIDATION_README.txt` for complete documentation

### File Size and Modularization

**CRITICAL RULE: 300 Line Maximum**

* **NO file should EVER exceed 300 lines of code**
* If a file reaches or exceeds 300 lines, it MUST be modularized immediately
* This rule applies to ALL file types: `.svelte`, `.ts`, `.js`, `.css`, etc.
* This rule is MANDATORY even if a hook blocks the creation or editing of files

**When to Modularize:**

1. **Components (`.svelte`)**: Split into smaller sub-components
   ```
   // BEFORE (400 lines)
   src/lib/components/Dashboard.svelte

   // AFTER (modularized)
   src/lib/components/Dashboard/
   ├── Dashboard.svelte (main, <150 lines)
   ├── DashboardHeader.svelte
   ├── DashboardStats.svelte
   └── DashboardCharts.svelte
   ```

2. **Services (`.ts`)**: Split by functionality or API domain
   ```
   // BEFORE (500 lines)
   src/lib/services/api.service.ts

   // AFTER (modularized)
   src/lib/services/
   ├── auth.service.ts
   ├── users.service.ts
   ├── conversations.service.ts
   └── contacts.service.ts
   ```

3. **Stores**: Split by feature or data domain
   ```
   // BEFORE (350 lines)
   src/lib/stores/app.store.ts

   // AFTER (modularized)
   src/lib/stores/
   ├── auth.store.ts
   ├── ui.store.ts
   └── data.store.ts
   ```

4. **Styles**: Use separate style files or CSS modules
   ```
   // Split large <style> blocks into:
   - Component-specific styles.css
   - Shared utility classes
   - Design system tokens
   ```

**Benefits of 300 Line Limit:**

* ✅ Better readability and maintainability
* ✅ Easier code reviews
* ✅ Reduced merge conflicts
* ✅ Better testability
* ✅ Clearer separation of concerns
* ✅ Faster development and debugging

**Enforcement:**

* Check file line count BEFORE creating or editing
* If editing would exceed 300 lines, refactor FIRST
* Use `wc -l filename` to check line count
* No exceptions - even for "just one more feature"

---

## 8. Design System Benefits and Best Practices

### Why shadcn-svelte + Tailwind CSS?

**Automatic Theme Inheritance:**
* All new components automatically inherit the Newton CRM color palette
* No need to manually add color variables to each component
* Change the theme in one place (`app.css`) and it updates everywhere

**Type Safety:**
* Full TypeScript support in all UI components
* Props are strongly typed with interfaces
* Catch errors at compile-time, not runtime

**Scalability:**
* Easy to add new shadcn-svelte components as needed
* Component library grows with your application
* Consistent API across all UI components

**Accessibility:**
* Built-in focus states, keyboard navigation
* ARIA attributes included by default
* Meets WCAG 2.1 AA standards

**Performance:**
* Tailwind purges unused CSS in production
* Components are lightweight and tree-shakeable
* No runtime CSS-in-JS overhead

### Best Practices for Maintaining the Design System

**1. Always use the `cn()` utility:**
```svelte
<!-- ✅ Correct -->
<div class={cn('base-class', isActive && 'active-class', className)}>

<!-- ❌ Incorrect -->
<div class="base-class {isActive ? 'active-class' : ''} {className}">
```

**2. Use semantic color classes:**
```svelte
<!-- ✅ Correct - theme-aware -->
<button class="bg-primary text-primary-foreground">

<!-- ❌ Incorrect - hardcoded color -->
<button class="bg-[#71276f] text-white">
```

**3. Follow the component pattern:**
```svelte
<!-- ✅ Correct - uses UI components -->
<Button variant="primary" size="default">Click me</Button>

<!-- ❌ Incorrect - custom button -->
<button class="px-4 py-2 bg-primary rounded">Click me</button>
```

**4. Extend, don't override:**
```svelte
<!-- ✅ Correct - extends Button with custom class -->
<Button class="w-full mt-4">Full Width</Button>

<!-- ❌ Incorrect - creates custom button -->
<button class="w-full mt-4 px-4 py-2 bg-primary">Full Width</button>
```

**5. Keep components under 300 lines:**
* If a component grows too large, split it into sub-components
* Extract reusable logic into utility functions
* Use composition over inheritance

### Adding New UI Components

When you need a new component (Card, Dialog, Dropdown, etc.):

1. **Create the component in `src/lib/components/ui/`:**
   ```bash
   src/lib/components/ui/card.svelte
   ```

2. **Follow the established pattern:**
   ```svelte
   <script lang="ts">
     import { cn } from '$lib/utils';
     import type { Snippet } from 'svelte';

     interface Props {
       variant?: 'default' | 'outlined';
       class?: string;
       children?: Snippet;
     }

     let { variant = 'default', class: className, children }: Props = $props();
   </script>

   <div class={cn('base-classes', variantClasses[variant], className)}>
     {#if children}
       {@render children()}
     {/if}
   </div>
   ```

3. **Export from `ui/index.ts`:**
   ```typescript
   export { default as Card } from './card.svelte';
   ```

4. **Document in this file (Gemini.md):**
   * Add to the UI Components section
   * Include usage examples
   * Document all props and variants

### Theme Customization

To modify the Newton CRM theme:

1. **Update colors in `src/app.css`:**
   ```css
   :root {
     --primary: 302 47% 30%;  /* Change HSL values */
   }
   ```

2. **Update Tailwind config if needed:**
   ```javascript
   // tailwind.config.js
   theme: {
     extend: {
       colors: {
         primary: 'hsl(var(--primary))'
       }
     }
   }
   ```

3. **Test across all components:**
   * Sidebar, Buttons, Cards, etc.
   * Check contrast ratios for accessibility
   * Verify dark mode support (future)

---

Following this standard ensures a modern, maintainable, and completely **API First** interface with a coherent, modular design system prepared to scale.

**Current Status:**
* ✅ Design system implemented with shadcn-svelte + Tailwind CSS
* ✅ Base UI components (Button, Separator)
* ✅ Sidebar component with theme integration
* ✅ Main layout with responsive behavior
* 🔄 KanbanBoard, KanbanColumn, ConversationCard (to be implemented)
* 🔄 Additional shadcn-svelte components as needed
