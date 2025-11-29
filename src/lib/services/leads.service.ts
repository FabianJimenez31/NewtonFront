/**
 * Leads Service - Newton CRM
 * Handles lead operations for inbox
 * API Base: https://crm.inewton.ai/api/v1/leads
 */

import type { LeadDetail } from "$lib/types/inbox.types";
import {
  API_BASE_URL,
  authenticatedFetchJSON,
  handleApiError,
} from "./api.utils";

const LEADS_BASE = `${API_BASE_URL}/leads`;

/**
 * Get lead detail with conversation
 * @endpoint GET /api/v1/leads/{lead_id}/detail
 */
export async function getLeadDetail(
  token: string,
  leadId: string,
  since?: string,
): Promise<LeadDetail> {
  try {
    const url = since
      ? `${LEADS_BASE}/${leadId}/detail?since=${since}`
      : `${LEADS_BASE}/${leadId}/detail`;

    return await authenticatedFetchJSON<LeadDetail>(url, token, {
      timeout: 10000,
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Get lead basic info
 * @endpoint GET /api/v1/leads/{lead_id}
 */
export async function getLead(
  token: string,
  leadId: string,
): Promise<LeadDetail> {
  try {
    return await authenticatedFetchJSON<LeadDetail>(
      `${LEADS_BASE}/${leadId}`,
      token,
      { timeout: 5000 },
    );
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Assign lead to agent
 * @endpoint PATCH /api/v1/leads/{lead_id}/assign
 */
export async function assignLead(
  token: string,
  leadId: string,
  agentId: string | null,
): Promise<any> {
  try {
    return await authenticatedFetchJSON(
      `${LEADS_BASE}/${leadId}/assign`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify({ agent_id: agentId }),
        timeout: 5000,
      },
    );
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Move lead to different stage
 * @endpoint PATCH /api/v1/leads/{lead_id}/move
 */
export async function moveLead(
  token: string,
  leadId: string,
  stageId: string,
  notes?: string,
): Promise<any> {
  try {
    // User reported /move endpoint does not exist. Using standard PUT update.
    return await authenticatedFetchJSON(`${LEADS_BASE}/${leadId}`, token, {
      method: "PUT",
      body: JSON.stringify({ stage_id: stageId, notes }),
      timeout: 5000,
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Update lead information
 * @endpoint PUT /api/v1/leads/{lead_id}
 */
export async function updateLead(
  token: string,
  leadId: string,
  data: Partial<LeadDetail>,
): Promise<any> {
  try {
    return await authenticatedFetchJSON(`${LEADS_BASE}/${leadId}`, token, {
      method: "PUT",
      body: JSON.stringify(data),
      timeout: 5000,
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
