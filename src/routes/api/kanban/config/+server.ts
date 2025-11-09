/**
 * API Proxy - Kanban Configuration
 * Proxies requests to avoid CORS issues
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const API_BASE = "https://crm.inewton.ai/api/v1/kanban";

export const GET: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      console.log("[KANBAN CONFIG PROXY] No authorization header provided");
      return json({ detail: "Authorization header required" }, { status: 401 });
    }

    console.log("[KANBAN CONFIG PROXY] Fetching kanban config");
    console.log(
      "[KANBAN CONFIG PROXY] Auth header:",
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

    console.log("[KANBAN CONFIG PROXY] Response status:", response.status);

    if (!response.ok) {
      console.error("[KANBAN CONFIG PROXY] Error:", data);
      return json(data, { status: response.status });
    }

    console.log("[KANBAN CONFIG PROXY] Success");
    return json(data);
  } catch (error) {
    console.error("[KANBAN CONFIG PROXY] Proxy error:", error);
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
      return json({ detail: "Authorization header required" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return json(data, { status: response.status });
    }

    return json(data);
  } catch (error) {
    console.error("[KANBAN CONFIG PROXY] Proxy error:", error);
    return json(
      { detail: "Error connecting to kanban service" },
      { status: 500 },
    );
  }
};
