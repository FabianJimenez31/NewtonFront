/**
 * API Proxy - Kanban Default Configuration
 * Creates a default pipeline configuration
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const API_BASE = "https://crm.inewton.ai/api/v1/kanban/default";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      console.log("[KANBAN DEFAULT PROXY] No authorization header");
      return json({ detail: "Authorization header required" }, { status: 401 });
    }

    console.log("[KANBAN DEFAULT PROXY] Creating default pipeline");
    console.log(
      "[KANBAN DEFAULT PROXY] Auth header:",
      authHeader?.substring(0, 20) + "...",
    );

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    console.log("[KANBAN DEFAULT PROXY] Response status:", response.status);

    if (!response.ok) {
      console.error("[KANBAN DEFAULT PROXY] Error:", data);
      return json(data, { status: response.status });
    }

    console.log("[KANBAN DEFAULT PROXY] Success, default pipeline created");
    return json(data);
  } catch (error) {
    console.error("[KANBAN DEFAULT PROXY] Proxy error:", error);
    return json(
      { detail: "Error connecting to kanban service" },
      { status: 500 },
    );
  }
};
