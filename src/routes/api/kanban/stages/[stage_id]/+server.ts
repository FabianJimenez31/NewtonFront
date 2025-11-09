/**
 * API Proxy - Kanban Stage Operations (PUT, DELETE)
 * Proxies requests to avoid CORS issues
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const API_BASE = "https://crm.inewton.ai/api/v1/kanban/stages";

export const PUT: RequestHandler = async ({ request, params }) => {
  try {
    const { stage_id } = params;
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      console.log("[KANBAN STAGE PROXY] PUT - No authorization header");
      return json({ detail: "Authorization header required" }, { status: 401 });
    }

    console.log(`[KANBAN STAGE PROXY] PUT - Updating stage ${stage_id}`);
    console.log(
      "[KANBAN STAGE PROXY] PUT - Auth header:",
      authHeader?.substring(0, 20) + "...",
    );
    console.log("[KANBAN STAGE PROXY] PUT - Body:", JSON.stringify(body));

    const response = await fetch(`${API_BASE}/${stage_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log("[KANBAN STAGE PROXY] PUT - Response status:", response.status);

    if (!response.ok) {
      console.error("[KANBAN STAGE PROXY] PUT - Error:", data);
      return json(data, { status: response.status });
    }

    console.log("[KANBAN STAGE PROXY] PUT - Success, stage updated");
    return json(data);
  } catch (error) {
    console.error("[KANBAN STAGE PROXY] PUT - Proxy error:", error);
    return json(
      { detail: "Error connecting to kanban service" },
      { status: 500 },
    );
  }
};

export const DELETE: RequestHandler = async ({ request, params }) => {
  try {
    const { stage_id } = params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      console.log("[KANBAN STAGE PROXY] DELETE - No authorization header");
      return json({ detail: "Authorization header required" }, { status: 401 });
    }

    console.log(`[KANBAN STAGE PROXY] DELETE - Deleting stage ${stage_id}`);
    console.log(
      "[KANBAN STAGE PROXY] DELETE - Auth header:",
      authHeader?.substring(0, 20) + "...",
    );

    const response = await fetch(`${API_BASE}/${stage_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    console.log(
      "[KANBAN STAGE PROXY] DELETE - Response status:",
      response.status,
    );

    if (!response.ok) {
      const data = await response.json();
      console.error("[KANBAN STAGE PROXY] DELETE - Error:", data);
      return json(data, { status: response.status });
    }

    console.log("[KANBAN STAGE PROXY] DELETE - Success, stage deleted");
    return json({ success: true });
  } catch (error) {
    console.error("[KANBAN STAGE PROXY] DELETE - Proxy error:", error);
    return json(
      { detail: "Error connecting to kanban service" },
      { status: 500 },
    );
  }
};
