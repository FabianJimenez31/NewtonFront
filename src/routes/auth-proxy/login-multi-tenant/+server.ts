/**
 * API Proxy - Login Multi-Tenant
 * Proxies requests to avoid CORS issues
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const API_BASE = "https://crm.inewton.ai/api/v1/auth";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("[LOGIN PROXY] Received request:", { email: body.email });

    console.log(
      "[LOGIN PROXY] Forwarding to:",
      `${API_BASE}/login-multi-tenant`,
    );
    const response = await fetch(`${API_BASE}/login-multi-tenant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("[LOGIN PROXY] Response status:", response.status);

    if (!response.ok) {
      console.log("[LOGIN PROXY] Error response:", data);
      return json(data, { status: response.status });
    }

    console.log("[LOGIN PROXY] Success, tenants count:", data.tenants?.length);
    return json(data);
  } catch (error) {
    console.error("[LOGIN PROXY] Proxy error:", error);
    return json(
      { detail: "Error connecting to authentication service" },
      { status: 500 },
    );
  }
};
