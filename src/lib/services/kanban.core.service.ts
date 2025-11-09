// @core
/**
 * Kanban Core Service - Newton CRM
 * Business-critical service for pipeline and stage management
 * API Base: https://crm.inewton.ai/api/v1/kanban
 */

import type {
  KanbanConfig,
  Stage,
  StageCreate,
  StageUpdate,
  BoardData,
  TransitionValidationRequest,
  TransitionValidationResponse,
  LeadMoveRequest,
  ApiError,
  KanbanFilters,
} from "$lib/types/kanban";

const API_BASE = "https://crm.inewton.ai/api/v1/kanban";
const LEADS_API_BASE = "https://crm.inewton.ai/api/v1/leads";

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

// ==================== KANBAN CONFIGURATION ====================

/**
 * Get active kanban configuration for current tenant
 * GET /api/v1/kanban/
 */
export async function getKanbanConfig(token: string): Promise<KanbanConfig> {
  try {
    return await authenticatedFetch(`${API_BASE}/`, token);
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
    return await authenticatedFetch(`${API_BASE}/`, token, {
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

// ==================== STAGE MANAGEMENT ====================

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

// ==================== BOARD AND LEADS ====================

/**
 * Get complete kanban board with leads grouped by stage
 * GET /api/v1/kanban/board
 */
export async function getBoard(
  token: string,
  filters?: KanbanFilters,
): Promise<BoardData> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.days) params.append("days", filters.days.toString());
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.assigned_agent_id)
        params.append("assigned_agent_id", filters.assigned_agent_id);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.min_score !== undefined)
        params.append("min_score", filters.min_score.toString());
    }

    const url = params.toString()
      ? `${API_BASE}/board?${params}`
      : `${API_BASE}/board`;
    return await authenticatedFetch(url, token);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Validate if a transition between stages is allowed
 * POST /api/v1/kanban/validate-transition
 */
export async function validateTransition(
  token: string,
  request: TransitionValidationRequest,
): Promise<TransitionValidationResponse> {
  try {
    return await authenticatedFetch(`${API_BASE}/validate-transition`, token, {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Move lead to different stage
 * PATCH /api/v1/leads/{lead_id}/move
 */
export async function moveLeadToStage(
  token: string,
  leadId: string,
  request: LeadMoveRequest,
): Promise<{ message: string; lead: any }> {
  try {
    return await authenticatedFetch(`${LEADS_API_BASE}/${leadId}/move`, token, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
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
