/**
 * AI Service - Newton CRM
 * Handles AI automation controls for leads
 * API Base: https://crm.inewton.ai/api/v1/ai
 */

import type { AIStatus } from "$lib/types/inbox.types";
import {
  API_BASE_URL,
  authenticatedFetchJSON,
  handleApiError,
} from "./api.utils";

const AI_BASE = `${API_BASE_URL}/ai`;

/**
 * Toggle AI automation for lead
 * @endpoint POST /api/v1/ai/leads/{lead_id}/toggle
 */
export async function toggleAI(
  token: string,
  leadId: string,
  enable: boolean,
  reason?: string,
): Promise<AIStatus> {
  try {
    return await authenticatedFetchJSON(
      `${AI_BASE}/leads/${leadId}/toggle`,
      token,
      {
        method: "POST",
        body: JSON.stringify({ enable_ai: enable, reason }),
        timeout: 5000,
      },
    );
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Get AI status for lead
 * @endpoint GET /api/v1/ai/leads/{lead_id}/status
 */
export async function getAIStatus(
  token: string,
  leadId: string,
): Promise<AIStatus> {
  try {
    return await authenticatedFetchJSON(
      `${AI_BASE}/leads/${leadId}/status`,
      token,
      { timeout: 5000 },
    );
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Pause AI automation
 * @endpoint POST /api/v1/ai/leads/{lead_id}/pause-ai
 */
export async function pauseAI(
  token: string,
  leadId: string,
  reason?: string,
): Promise<AIStatus> {
  try {
    const url = reason
      ? `${AI_BASE}/leads/${leadId}/pause-ai?reason=${encodeURIComponent(reason)}`
      : `${AI_BASE}/leads/${leadId}/pause-ai`;

    return await authenticatedFetchJSON(url, token, {
      method: "POST",
      timeout: 5000,
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Resume AI automation
 * @endpoint POST /api/v1/ai/leads/{lead_id}/resume-ai
 */
export async function resumeAI(
  token: string,
  leadId: string,
): Promise<AIStatus> {
  try {
    return await authenticatedFetchJSON(
      `${AI_BASE}/leads/${leadId}/resume-ai`,
      token,
      { method: "POST", timeout: 5000 },
    );
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
