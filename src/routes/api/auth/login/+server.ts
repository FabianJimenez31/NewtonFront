import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const API_BASE = "https://crm.inewton.ai/api/v1/auth/login";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();

    console.log("[LOGIN TRAD] Attempting traditional login");
    console.log("[LOGIN TRAD] Email:", body.email);
    console.log("[LOGIN TRAD] Tenant:", body.tenant_id || "not provided");

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log("[LOGIN TRAD] Response status:", response.status);

    if (!response.ok) {
      console.error("[LOGIN TRAD] Error:", data);
      return json(data, { status: response.status });
    }

    console.log("[LOGIN TRAD] Success! Has access_token:", !!data.access_token);

    return json(data);
  } catch (error) {
    console.error("[LOGIN TRAD] Proxy error:", error);
    return json(
      { detail: "Error connecting to auth service" },
      { status: 500 }
    );
  }
};
