/**
 * Auth Service - Newton CRM
 * Service module for authentication API calls
 * API Base: https://crm.inewton.ai/api/v1/auth
 */

import type {
  LoginRequest,
  LoginResponse,
  LoginMultiTenantRequest,
  LoginMultiTenantResponse,
  SelectTenantRequest,
  SwitchTenantRequest,
  User,
  WhatsAppLoginRequest,
  WhatsAppCodeValidationRequest,
  RegisterRequest,
  ApiError,
} from "$lib/types/auth";

import {
  handleApiError,
  authenticatedFetch,
  authenticatedFetchJSON,
  API_BASE_URL,
} from "$lib/services/api.utils";

const API_BASE = `${API_BASE_URL}/auth`;

/**
 * Login with email and password (Traditional Single-Tenant)
 * POST /api/v1/auth/login
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    console.log("[AUTH SERVICE] Attempting traditional login");
    console.log("[AUTH SERVICE] Using endpoint:", `${API_BASE}/login`);

    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[AUTH SERVICE] Traditional login failed:", error);
      throw error;
    }

    const data = await response.json();
    console.log("[AUTH SERVICE] Traditional login successful");
    console.log("[AUTH SERVICE] Has access_token:", !!data.access_token);

    return data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Request WhatsApp verification code
 * POST /api/v1/auth/whatsapp/request-code
 */
export async function requestWhatsAppCode(
  data: WhatsAppLoginRequest,
): Promise<{ code_id: string }> {
  try {
    const response = await fetch(`${API_BASE}/whatsapp/request-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Validate WhatsApp code and complete login
 * POST /api/v1/auth/whatsapp/validate-code
 */
export async function validateWhatsAppCode(
  data: WhatsAppCodeValidationRequest,
): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE}/whatsapp/validate-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Refresh JWT token
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(
  token: string,
): Promise<{ access_token: string }> {
  try {
    return await authenticatedFetchJSON(`${API_BASE}/refresh`, token, {
      method: "POST",
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Get current user information
 * GET /api/v1/auth/me
 */
export async function getCurrentUser(token: string): Promise<User> {
  try {
    return await authenticatedFetchJSON(`${API_BASE}/me`, token);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Logout current user
 * POST /api/v1/auth/logout
 */
export async function logout(token: string): Promise<void> {
  try {
    await authenticatedFetchJSON(`${API_BASE}/logout`, token, {
      method: "POST",
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Get available tenants (system_admin only)
 * GET /api/v1/auth/tenants
 */
export async function getTenants(token: string): Promise<unknown[]> {
  try {
    return await authenticatedFetchJSON(`${API_BASE}/tenants`, token);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Multi-Tenant Login (Step 1) - Login without tenant_id
 * POST /api/v1/auth/login-multi-tenant
 */
export async function loginMultiTenant(
  credentials: LoginMultiTenantRequest,
): Promise<LoginMultiTenantResponse> {
  try {
    const response = await fetch(`${API_BASE}/login-multi-tenant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Select Tenant (Step 2) - Complete login by selecting a tenant
 * POST /api/v1/auth/select-tenant
 */
export async function selectTenant(
  request: SelectTenantRequest,
  tempToken: string,
): Promise<LoginResponse> {
  try {
    return await authenticatedFetchJSON(`${API_BASE}/select-tenant`, tempToken, {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Switch Tenant - Change tenant without re-authentication
 * POST /api/v1/auth/switch-tenant
 */
export async function switchTenant(
  request: SwitchTenantRequest,
  token: string,
): Promise<LoginResponse> {
  try {
    return await authenticatedFetchJSON(`${API_BASE}/switch-tenant`, token, {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
