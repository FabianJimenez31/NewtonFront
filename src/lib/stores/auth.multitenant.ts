/**
 * Auth Multi-Tenant Helpers - Newton CRM
 * Helper functions for multi-tenant authentication
 */

import type {
  LoginMultiTenantRequest,
  LoginMultiTenantResponse,
  SelectTenantRequest,
  SwitchTenantRequest,
  LoginResponse,
  AuthState,
} from "$lib/types/auth";
import * as authService from "$lib/services/auth.service";
import * as storage from "./auth.storage";

export async function handleLoginMultiTenant(
  credentials: LoginMultiTenantRequest,
  update: (fn: (state: AuthState) => AuthState) => void,
): Promise<LoginMultiTenantResponse> {
  console.log("🚀 [AUTH MT] Starting multi-tenant login", {
    email: credentials.email,
  });
  update((state) => ({
    ...state,
    isLoading: true,
    error: null,
  }));

  try {
    console.log("📡 [AUTH MT] Calling loginMultiTenant API...");
    const response = await authService.loginMultiTenant(credentials);
    console.log("✅ [AUTH MT] Login response received:", {
      hasTemp: !!response.temp_token,
      userEmail: response.user?.email,
      tenantsCount: response.tenants?.length,
    });

    // Store temp data
    console.log("💾 [AUTH MT] Saving temp data to localStorage...");
    storage.saveTempToken(response.temp_token);
    storage.saveTempUser(response.user);
    storage.saveAvailableTenants(response.tenants);
    console.log("✅ [AUTH MT] Temp data saved successfully");

    update((state) => ({
      ...state,
      tempToken: response.temp_token,
      availableTenants: response.tenants,
      needsTenantSelection: true,
      isLoading: false,
      error: null,
    }));

    console.log("🏢 [AUTH MT] Ready for tenant selection");
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al iniciar sesión";

    update((state) => ({
      ...state,
      isLoading: false,
      error: errorMessage,
    }));

    throw error;
  }
}

export async function handleSelectTenant(
  request: SelectTenantRequest,
  tempToken: string | null,
  update: (fn: (state: AuthState) => AuthState) => void,
): Promise<LoginResponse> {
  update((state) => ({
    ...state,
    isLoading: true,
    error: null,
  }));

  if (!tempToken) {
    throw new Error("No temp token available");
  }

  try {
    const response = await authService.selectTenant(request, tempToken);

    // Store final auth data
    storage.saveToken(response.access_token);
    storage.saveUser(response.user);

    // Clear temp data
    storage.removeTempToken();
    storage.removeTempUser();
    storage.removeAvailableTenants();

    update((state) => ({
      ...state,
      user: response.user,
      token: response.access_token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      tempToken: null,
      availableTenants: [],
      needsTenantSelection: false,
    }));

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al seleccionar tenant";

    update((state) => ({
      ...state,
      isLoading: false,
      error: errorMessage,
    }));

    throw error;
  }
}

export async function handleSwitchTenant(
  request: SwitchTenantRequest,
  currentToken: string | null,
  update: (fn: (state: AuthState) => AuthState) => void,
): Promise<LoginResponse> {
  update((state) => ({
    ...state,
    isLoading: true,
    error: null,
  }));

  if (!currentToken) {
    throw new Error("No token available");
  }

  try {
    const response = await authService.switchTenant(request, currentToken);

    // Update auth data
    storage.saveToken(response.access_token);
    storage.saveUser(response.user);

    update((state) => ({
      ...state,
      user: response.user,
      token: response.access_token,
      isLoading: false,
      error: null,
    }));

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al cambiar tenant";

    update((state) => ({
      ...state,
      isLoading: false,
      error: errorMessage,
    }));

    throw error;
  }
}
