/**
 * Kanban Stages Service
 * Handles stage CRUD operations
 * API Base: https://crm.inewton.ai/api/v1/kanban/stages
 */

import type {
  Stage,
  StageCreate,
  StageUpdate,
  ApiError,
} from "$lib/types/kanban";

const API_BASE = "https://crm.inewton.ai/api/v1/kanban";

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
 * Get all stages for current tenant
 * GET /api/v1/kanban/stages
 */
export async function getStages(token: string): Promise<Stage[]> {
  try {
    return await authenticatedFetch(`${API_BASE}/stages/`, token);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Get specific stage by ID
 * GET /api/v1/kanban/stages/{stage_id}
 */
export async function getStageById(
  token: string,
  stageId: string,
): Promise<Stage> {
  try {
    return await authenticatedFetch(`${API_BASE}/stages/${stageId}`, token);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Create new stage (admin only)
 * POST /api/v1/kanban/stages
 */
export async function createStage(
  token: string,
  stage: StageCreate,
): Promise<Stage> {
  try {
    return await authenticatedFetch(`${API_BASE}/stages/`, token, {
      method: "POST",
      body: JSON.stringify(stage),
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Update stage (admin only)
 * PUT /api/v1/kanban/stages/{stage_id}
 */
export async function updateStage(
  token: string,
  stageId: string,
  stage: StageUpdate,
): Promise<Stage> {
  try {
    return await authenticatedFetch(`${API_BASE}/stages/${stageId}`, token, {
      method: "PUT",
      body: JSON.stringify(stage),
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Delete stage (admin only)
 * DELETE /api/v1/kanban/stages/{stage_id}
 * Note: Will fail if stage has associated leads
 */
export async function deleteStage(
  token: string,
  stageId: string,
): Promise<{ message: string }> {
  try {
    return await authenticatedFetch(`${API_BASE}/stages/${stageId}`, token, {
      method: "DELETE",
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Get default stage configuration
 * GET /api/v1/kanban/stages/default
 */
export async function getDefaultStage(token: string): Promise<Stage> {
  try {
    return await authenticatedFetch(`${API_BASE}/stages/default`, token);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Reorder stages by updating their order field
 * Batch update multiple stages at once
 */
export async function reorderStages(
  token: string,
  stages: Array<{ id: string; order: number }>,
): Promise<Stage[]> {
  try {
    const updatePromises = stages.map((stage) =>
      updateStage(token, stage.id, { order: stage.order }),
    );
    return await Promise.all(updatePromises);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
