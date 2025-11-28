/**
 * Kanban Config Service
 * Handles kanban configuration management
 * API Base: /api/v1/kanban (proxied to https://crm.inewton.ai/api/v1/kanban)
 */

import type { KanbanConfig, ApiError } from "$lib/types/kanban";

const API_BASE = "/api/v1/kanban";

/**
 * Handles API errors and returns formatted error message
 */
function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "detail" in error) {
    return (error as ApiError).detail;
  }
  return "Error desconocido. Por favor intenta de nuevo.";
}

/**
 * Makes authenticated request with JWT token
 */
async function authenticatedFetch(
  url: string,
  token: string,
  options: RequestInit = {},
) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
}

/**
 * Get active kanban configuration for current tenant
 * GET /api/v1/kanban/
 */
export async function getKanbanConfig(token: string): Promise<KanbanConfig> {
  try {
    return await authenticatedFetch(`${API_BASE}`, token);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Create new kanban configuration (admin only)
 * POST /api/v1/kanban/
 */
export async function createKanbanConfig(
  token: string,
  config: Partial<KanbanConfig>,
): Promise<KanbanConfig> {
  try {
    return await authenticatedFetch(`${API_BASE}`, token, {
      method: "POST",
      body: JSON.stringify(config),
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Update kanban configuration (admin only)
 * PUT /api/v1/kanban/{config_id}
 */
export async function updateKanbanConfig(
  token: string,
  configId: string,
  config: Partial<KanbanConfig>,
): Promise<KanbanConfig> {
  try {
    return await authenticatedFetch(`${API_BASE}/${configId}`, token, {
      method: "PUT",
      body: JSON.stringify(config),
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Create default kanban configuration (admin only)
 * POST /api/v1/kanban/default
 * Creates: iniciado → exploración → interés_alto → calificado → ganado/perdido
 */
export async function createDefaultConfig(
  token: string,
): Promise<KanbanConfig> {
  try {
    return await authenticatedFetch(`${API_BASE}/default`, token, {
      method: "POST",
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
