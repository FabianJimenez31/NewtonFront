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
