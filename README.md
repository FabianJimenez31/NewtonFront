# Newton CRM

Sistema de gestión de relaciones con clientes (CRM) con frontend en Svelte que consume la API oficial en `https://crm.inewton.ai/api/docs`.

## 🚀 Tecnologías

- **SvelteKit** - Framework de aplicación completo
- **TypeScript** - Tipado estático
- **Lucide Svelte** - Librería de iconos
- **API First Architecture** - Todas las funcionalidades consumen endpoints de la API

## 📁 Estructura del Proyecto

```
src/
├── lib/
│   ├── components/      # Componentes Svelte reutilizables
│   │   ├── Login.svelte         # Formulario de login
│   │   ├── TenantSelector.svelte # Selector de tenant post-login
│   │   └── TenantSwitcher.svelte # Dropdown cambio de tenant
│   ├── services/        # Servicios para llamadas a la API
│   │   └── auth.service.ts      # Servicios de autenticación
│   ├── stores/          # Stores de Svelte para manejo de estado
│   │   └── auth.store.ts        # Store global de autenticación
│   └── types/           # Tipos e interfaces de TypeScript
│       └── auth.ts              # Tipos de autenticación
├── routes/              # Rutas de SvelteKit
│   ├── +page.svelte     # Página de inicio (redirección)
│   ├── +layout.svelte   # Layout principal
│   ├── login/           # Ruta de login
│   │   └── +page.svelte
│   └── pipeline/        # Ruta de pipeline (protegida)
│       └── +page.svelte
└── app.css              # Estilos globales y design system
```

## 🎨 Design System

### Paleta de Colores

- **Primary**: `#71276f` - Color principal (headers de columnas)
- **Secondary**: `#571d54`
- **Tertiary**: `#3d1438`
- **Quaternary**: `#230a1c`
- **Dark**: `#090000`

### Tipografía

- **Fuente**: Montserrat (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Vista previa de producción
npm preview
```

## ✅ Tests

- `npm run check` – Tipos, a11y y exports muertos con `svelte-check`.
- `npm run test:e2e` – Ejecuta Playwright contra `npm run dev` (el servidor se inicia automáticamente). En la primera ejecución corre `npx playwright install --with-deps` para instalar los navegadores.

### Variables para E2E autenticados

Algunos escenarios (por ejemplo `/conversaciones`) requieren un usuario real:

```bash
export PLAYWRIGHT_ADMIN_EMAIL="admin@celucambio.com"
export PLAYWRIGHT_ADMIN_PASSWORD="••••••"
# Opcional si cambia el nombre del tenant visible en la UI
export PLAYWRIGHT_TENANT_NAME="Celucambio Producción"
npm run test:e2e
```

## 🔐 Sistema de Autenticación Multi-Tenant

### Funcionalidades Implementadas

- ✅ **Login Multi-Tenant** - Sin necesidad de ingresar tenant_id
- ✅ **Selección de Tenant** - Selector visual después del login
- ✅ **Cambio de Tenant** - Switch entre organizaciones sin re-login
- ✅ Gestión de tokens JWT (temp_token y access_token)
- ✅ Persistencia de sesión en localStorage
- ✅ Protección de rutas
- ✅ Auto-refresh de token
- ✅ Logout

### Flujo de Autenticación

#### Paso 1: Login (sin tenant_id)
Usuario ingresa solo **email y password**

#### Paso 2: Selección de Tenant
Sistema muestra lista de tenants disponibles con:
- Nombre de la organización
- Rol del usuario en cada tenant
- Diseño visual intuitivo

#### Paso 3: Acceso Completo
Usuario accede al CRM con el tenant seleccionado

### Endpoints Utilizados

**Nuevos Endpoints Multi-Tenant:**
- `POST /api/v1/auth/login-multi-tenant` - Login sin tenant_id (Paso 1)
- `POST /api/v1/auth/select-tenant` - Seleccionar tenant (Paso 2)
- `POST /api/v1/auth/switch-tenant` - Cambiar tenant sin re-login

**Endpoints Legacy (compatibilidad):**
- `POST /api/v1/auth/login` - Autenticación tradicional con tenant_id
- `POST /api/v1/auth/logout` - Cerrar sesión
- `POST /api/v1/auth/refresh` - Renovar token
- `GET /api/v1/auth/me` - Información del usuario actual

### Componentes Implementados

1. **Login.svelte** - Formulario de login (email + password)
2. **TenantSelector.svelte** - Selector visual de tenants
3. **TenantSwitcher.svelte** - Dropdown para cambiar de tenant en navbar

### Uso del Auth Store

```typescript
import { authStore } from '$lib/stores/auth.store';

// Login Multi-Tenant (Paso 1)
await authStore.loginMultiTenant({
  email: 'user@example.com',
  password: 'password'
});
// Retorna temp_token y lista de tenants

// Seleccionar Tenant (Paso 2)
await authStore.selectTenant({
  tenant_id: 'tenant-123'
});
// Retorna access_token final

// Cambiar de Tenant (sin re-login)
await authStore.switchTenant({
  tenant_id: 'otro-tenant'
});

// Logout
await authStore.logout();

// Acceder al estado
$authStore.isAuthenticated
$authStore.user
$authStore.token
$authStore.availableTenants
$authStore.needsTenantSelection
```

## 🛣️ Rutas

- `/` - Redirección automática a `/login` o `/pipeline` según autenticación
- `/login` - Página de inicio de sesión
- `/pipeline` - Dashboard principal (requiere autenticación)

## 📝 Próximos Pasos

- [ ] Implementar Sidebar con navegación
- [ ] Crear KanbanBoard para pipeline de ventas
- [ ] Integrar módulo de Conversaciones
- [ ] Agregar gestión de Contactos
- [ ] Sistema de Objetivos
- [ ] Módulo de Reportes

## 🔒 Seguridad

- Tokens JWT almacenados en localStorage
- Validación automática de token al cargar la aplicación
- Redirección automática a login si el token expira
- Headers de autorización en todas las peticiones protegidas

## 📖 Documentación

Para más detalles sobre el design system y guías de desarrollo, consulta `CLAUDE.md`.

## 🌐 API

Documentación completa de la API disponible en:
https://crm.inewton.ai/api/docs
