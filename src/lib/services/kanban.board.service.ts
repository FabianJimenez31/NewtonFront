/**
 * Kanban Board Service
 * Handles board operations and lead movements
 * API Base: /api/v1/kanban (proxied to https://crm.inewton.ai/api/v1/kanban)
 */

import type {
  BoardData,
  TransitionValidationRequest,
  TransitionValidationResponse,
  LeadMoveRequest,
  KanbanFilters,
  ApiError,
} from "$lib/types/kanban";

const API_BASE = "/api/v1/kanban";
const LEADS_API_BASE = "/api/v1/leads";

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
