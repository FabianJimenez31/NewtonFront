/**
 * API Proxy - Kanban Board
 * Proxies requests to avoid CORS issues
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const API_BASE = "https://crm.inewton.ai/api/v1/kanban/board";

export const GET: RequestHandler = async ({ request, url }) => {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return json({ detail: "Authorization header required" }, { status: 401 });
    }

    // Build query params if any
    const queryParams = url.searchParams.toString();
    const apiUrl = queryParams ? `${API_BASE}?${queryParams}` : API_BASE;

    console.log("[KANBAN BOARD PROXY] Fetching board data");

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    console.log("[KANBAN BOARD PROXY] Response status:", response.status);

    if (!response.ok) {
      console.error("[KANBAN BOARD PROXY] Error:", data);
      return json(data, { status: response.status });
    }

    // Log board data structure for debugging
    if (data && data.stages) {
      const stageKeys = Object.keys(data.stages);
      console.log("[KANBAN BOARD PROXY] Board structure:", {
        hasStages: stageKeys.length > 0,
        stageCount: stageKeys.length,
        stageIds: stageKeys,
        leadCounts: stageKeys.reduce(
          (acc, stageId) => {
            acc[stageId] = data.stages[stageId]?.length || 0;
            return acc;
          },
          {} as Record<string, number>,
        ),
        totalLeads: stageKeys.reduce(
          (sum, stageId) => sum + (data.stages[stageId]?.length || 0),
          0,
        ),
      });

      // Log first lead of first stage for structure inspection
      if (stageKeys.length > 0 && data.stages[stageKeys[0]]?.length > 0) {
        const firstLead = data.stages[stageKeys[0]][0];
        console.log("[KANBAN BOARD PROXY] Sample lead structure:", {
          hasGlobalFields: !!(
            firstLead.channel ||
            firstLead.country_code ||
            firstLead.deal_value
          ),
          fields: Object.keys(firstLead),
        });
      }
    } else {
      console.warn("[KANBAN BOARD PROXY] Unexpected data structure:", data);
    }

    console.log("[KANBAN BOARD PROXY] Success");
    return json(data);
  } catch (error) {
    console.error("[KANBAN BOARD PROXY] Proxy error:", error);
    return json(
      { detail: "Error connecting to kanban service" },
      { status: 500 },
    );
  }
};
