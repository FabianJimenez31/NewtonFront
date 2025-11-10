# Repository Guidelines

## Project Structure & Module Organization
Routes live in `src/routes` (e.g., `login/+page.svelte`, `pipeline/+page.svelte`), while reusable UI, stores, services, and types sit in `src/lib/**`. API adapters such as `src/lib/services/auth.service.ts` centralize traffic to `https://crm.inewton.ai/api/v1/auth` and the `/api/auth/*` proxy. Global styling belongs to `src/app.css` and `tailwind.config.js`, and static assets ship from `static/`. Operational files (`dev-server.sh`, `ecosystem.config.cjs`, `newton-dev.service`) orchestrate the pm2 dev daemon from the repo root.

## Build, Test, and Development Commands
- `npm install` – one-time dependency install.
- `npm run dev` – Vite dev server with hot reload.
- `npm run dev:start|stop|restart|status|logs` – wrapper around `dev-server.sh` for the managed instance.
- `npm run build` – production SvelteKit/Vite build with type safety.
- `npm run preview` – serves the build for manual QA.
- `npm run check` / `npm run check:watch` – runs `svelte-kit sync` and `svelte-check` for types, accessibility, and dead exports.

## Coding Style & Naming Conventions
Write TypeScript-first modules and keep nullable state explicit (`auth.store.ts` is the template). Svelte files use `<script lang="ts">`, tab-aligned markup, and Tailwind utility classes inline; reach for `app.css` only for global tokens. Components and stores use PascalCase filenames, helpers use camelCase, and Svelte route directories remain kebab-case. Console statements follow the existing emoji + `[CHANNEL]` pattern for searchable logs.

## Testing Guidelines
`npm run check` is mandatory before raising a PR. Functional tests should live under `src/lib/test` once Vitest/@testing-library-svelte are introduced; name specs `FeatureName.spec.ts`. Cover login, tenant selection/switching, token refresh, and new store side effects. Until automated suites exist, run `npm run preview` and walk `/login → /pipeline`, then record any untested area in the PR body.

## Commit & Pull Request Guidelines
Commits mirror the current history: optional emoji prefix plus a concise, imperative summary (e.g., `🚀 Improve tenant selector loading`). Stay under 72 characters and scope to a single concern. PRs should include a short narrative, linked issue, UI screenshots when visuals change, and confirmation that `npm run check` and `npm run build` passed. Call out API adjustments or new environment requirements so the dev-server and pm2 configs stay in sync.

## Security & Configuration Tips
Only expose environment variables prefixed with `PUBLIC_`; anything secret remains server-side or injected at deploy time. Updating the auth endpoint requires synchronizing `auth.service.ts` and the reverse proxy entries to avoid CORS drift. Remove JWTs or tenant IDs from logs before committing, and persist auth tokens solely through the patterns already defined in `auth.store.ts`.
