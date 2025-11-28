/**
 * Kanban Proxy Service - Newton CRM
 * Service for kanban API calls using local proxies to avoid CORS
 */

import type {
  KanbanConfig,
  Stage,
  StageCreate,
  StageUpdate,
  BoardData,
  BoardUser,
  ApiError,
  KanbanFilters,
  LeadKanban,
} from "$lib/types/kanban";

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
  console.log("[KANBAN PROXY] Calling:", url);
  console.log("[KANBAN PROXY] Method:", options.method || "GET");
  console.log("[KANBAN PROXY] Token preview:", token.substring(0, 30) + "...");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  console.log("[KANBAN PROXY] Request headers:", {
    ...headers,
    Authorization: `Bearer ${token.substring(0, 20)}...`,
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log("[KANBAN PROXY] Response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("[KANBAN PROXY] API Error:", response.status, error);
      throw error;
    }

    const data = await response.json();
    console.log(
      "[KANBAN PROXY] Success - Response data:",
      JSON.stringify(data, null, 2),
    );
    return data;
  } catch (error) {
    console.error("[KANBAN PROXY] Request failed:", error);
    throw error;
  }
}

interface BoardApiResponse {
  stages?: Record<string, LeadKanban[]>;
  kanban_data?: Record<string, LeadKanban[]>;
  configuration?: KanbanConfig | null;
  user?: BoardUser | null;
  [key: string]: unknown;
}

type BoardResponseLike = Partial<BoardData> & BoardApiResponse;

function normalizeBoardResponse(
  data: BoardResponseLike | null | undefined,
): BoardData {
  const source = (data ?? {}) as BoardResponseLike;
  const stages = source.stages ?? source.kanban_data ?? {};

  return {
    stages,
    configuration: source.configuration ?? null,
    user: source.user ?? null,
  };
}

// ==================== KANBAN CONFIGURATION ====================

/**
 * Get active kanban configuration for current tenant
 * Uses local proxy: GET /api/kanban/config
 */
export async function getKanbanConfig(token: string): Promise<KanbanConfig> {
  try {
    console.log("[KANBAN SERVICE] Getting config via proxy");
    return await authenticatedFetch("/api/v1/kanban/", token);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Get all stages for current tenant
 * Uses local proxy: GET /api/v1/kanban/stages
 */
export async function getStages(token: string): Promise<Stage[]> {
  try {
    console.log("[KANBAN SERVICE] Getting stages via proxy");
    return await authenticatedFetch("/api/v1/kanban/stages", token);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Get kanban board with all leads
 * Uses local proxy: GET /api/kanban/board
 */
export async function getBoard(
  token: string,
  filters?: KanbanFilters,
): Promise<BoardData> {
  try {
    console.log("[KANBAN SERVICE] Getting board via proxy");
    console.log("[KANBAN SERVICE] Filters:", filters);
    const params = filters
      ? new URLSearchParams(filters as any).toString()
      : "";
    const url = params ? `/api/v1/kanban/board?${params}` : "/api/v1/kanban/board";
    console.log("[KANBAN SERVICE] Board URL:", url);
    const rawBoardData = (await authenticatedFetch(
      url,
      token,
    )) as BoardResponseLike;
    const boardData = normalizeBoardResponse(rawBoardData);

    // Log board data structure
    const stageKeys = Object.keys(boardData.stages);
    if (stageKeys.length === 0) {
      console.warn("[KANBAN SERVICE] Board has no stages in response");
    } else {
      console.log("[KANBAN SERVICE] Board has stages:", stageKeys);
      stageKeys.forEach((stageId) => {
        const leads = boardData.stages[stageId];
        console.log(`[KANBAN SERVICE] Stage ${stageId}: ${leads.length} leads`);
      });
    }

    return boardData;
  } catch (error) {
    console.error("[KANBAN SERVICE] Board fetch error:", error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Create new stage
 * Uses local proxy: POST /api/kanban/stages
 */
export async function createStage(
  token: string,
  stage: StageCreate,
): Promise<Stage> {
  try {
    return await authenticatedFetch("/api/v1/kanban/stages", token, {
      method: "POST",
      body: JSON.stringify(stage),
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Update stage
 * Uses local proxy: PUT /api/v1/kanban/stages/{stage_id}
 */
export async function updateStage(
  token: string,
  stageId: string,
  stage: StageUpdate,
): Promise<Stage> {
  try {
    return await authenticatedFetch(`/api/v1/kanban/stages/${stageId}`, token, {
      method: "PUT",
      body: JSON.stringify(stage),
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Delete stage (admin only)
 * Uses local proxy: DELETE /api/v1/kanban/stages/{stage_id}
 */
export async function deleteStage(
  token: string,
  stageId: string,
): Promise<void> {
  try {
    await authenticatedFetch(`/api/v1/kanban/stages/${stageId}`, token, {
      method: "DELETE",
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Create default pipeline configuration
 * Uses local proxy: POST /api/v1/kanban/config/default
 */
export async function createDefaultConfig(
  token: string,
): Promise<KanbanConfig> {
  try {
    console.log("[KANBAN SERVICE] Creating default config via proxy");
    return await authenticatedFetch("/api/v1/kanban/config/default", token, {
      method: "POST",
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Move lead to different stage
 * Direct API call (not using proxy for now)
 */
export async function moveLeadToStage(
  token: string,
  leadId: string,
  data: { stage: string; notes?: string },
): Promise<void> {
  try {
    // TODO: Create proxy for this endpoint
    console.log("[KANBAN SERVICE] Moving lead to stage - NOT IMPLEMENTED");
    // For now, just log the request
    console.log("Lead ID:", leadId, "Target stage:", data.stage);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
