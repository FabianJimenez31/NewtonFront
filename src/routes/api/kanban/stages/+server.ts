/**
 * API Proxy - Kanban Stages
 * Proxies requests to avoid CORS issues
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const API_BASE = "https://crm.inewton.ai/api/v1/kanban/stages";

export const GET: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      console.log("[KANBAN STAGES PROXY] No authorization header provided");
      return json({ detail: "Authorization header required" }, { status: 401 });
    }

    console.log("[KANBAN STAGES PROXY] Fetching stages");
    console.log(
      "[KANBAN STAGES PROXY] Auth header:",
      authHeader?.substring(0, 20) + "...",
    );

    const response = await fetch(`${API_BASE}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    console.log("[KANBAN STAGES PROXY] Response status:", response.status);

    if (!response.ok) {
      console.error("[KANBAN STAGES PROXY] Error:", data);
      return json(data, { status: response.status });
    }

    console.log("[KANBAN STAGES PROXY] Success, stages count:", data.length);
    return json(data);
  } catch (error) {
    console.error("[KANBAN STAGES PROXY] Proxy error:", error);
    return json(
      { detail: "Error connecting to kanban service" },
      { status: 500 },
    );
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      console.log("[KANBAN STAGES PROXY] POST - No authorization header");
      return json({ detail: "Authorization header required" }, { status: 401 });
    }

    console.log("[KANBAN STAGES PROXY] POST - Creating new stage");
    console.log(
      "[KANBAN STAGES PROXY] POST - Auth header:",
      authHeader?.substring(0, 20) + "...",
    );
    console.log("[KANBAN STAGES PROXY] POST - Body:", JSON.stringify(body));

    const response = await fetch(`${API_BASE}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log(
      "[KANBAN STAGES PROXY] POST - Response status:",
      response.status,
    );

    if (!response.ok) {
      console.error("[KANBAN STAGES PROXY] POST - Error:", data);
      return json(data, { status: response.status });
    }

    console.log("[KANBAN STAGES PROXY] POST - Success, new stage created");
    return json(data);
  } catch (error) {
    console.error("[KANBAN STAGES PROXY] POST - Proxy error:", error);
    return json(
      { detail: "Error connecting to kanban service" },
      { status: 500 },
    );
  }
};
