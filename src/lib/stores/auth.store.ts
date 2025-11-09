/**
 * Auth Store - Newton CRM
 * Global authentication state management
 */

import { writable } from "svelte/store";
import { browser } from "$app/environment";
import type {
  AuthState,
  LoginRequest,
  LoginMultiTenantRequest,
  SelectTenantRequest,
  SwitchTenantRequest,
  User,
} from "$lib/types/auth";
import * as authService from "$lib/services/auth.service";
import * as storage from "./auth.storage";
import * as multiTenant from "./auth.multitenant";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tempToken: null,
  availableTenants: [],
  needsTenantSelection: false,
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  // Initialize from localStorage
  if (browser) {
    console.log("🔄 [AUTH STORE] Initializing auth store...");
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();
    const storedTempToken = storage.getTempToken();
    const storedTempUser = storage.getTempUser();
    const storedTenants = storage.getAvailableTenants();

    console.log("📦 [AUTH STORE] Stored data found:", {
      hasToken: !!storedToken,
      hasUser: !!storedUser,
      hasTempToken: !!storedTempToken,
      hasTempUser: !!storedTempUser,
      tenantsCount: storedTenants?.length || 0,
      currentPath: window.location.pathname,
    });

    if (storedToken && storedUser) {
      update((state) => ({
        ...state,
        token: storedToken,
        user: storedUser,
        isAuthenticated: true,
        isLoading: false,
      }));

      // OPTIMIZATION: Skip automatic token validation on every page load
      // This was causing 10-second delays on each navigation
      // Token will be validated when making actual API calls
      // Uncomment only if you need strict token validation on every page load
      /*
      authService
        .getCurrentUser(storedToken)
        .then((freshUser) => {
          update((state) => ({ ...state, user: freshUser }));
        })
        .catch((error) => {
          console.error("Token validation failed - logging out:", error);
          storage.clearAllAuthData();
          update((state) => ({
            ...initialState,
            isLoading: false,
          }));
          if (browser && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        });
      */
    } else {
      // No stored credentials
      update((state) => ({ ...state, isLoading: false }));
    }
  }

  return {
    subscribe,

    // Traditional login
    login: async (credentials: LoginRequest) => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await authService.login(credentials);

        storage.saveToken(response.access_token);
        storage.saveUser(response.user);

        update((state) => ({
          ...state,
          user: response.user,
          token: response.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));

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
    },

    // Multi-tenant login
    loginMultiTenant: async (credentials: LoginMultiTenantRequest) => {
      return multiTenant.handleLoginMultiTenant(credentials, update);
    },

    // Select tenant
    selectTenant: async (request: SelectTenantRequest) => {
      let tempToken: string | null = null;
      update((state) => {
        tempToken = state.tempToken;
        return state;
      });

      return multiTenant.handleSelectTenant(request, tempToken, update);
    },

    // Switch tenant
    switchTenant: async (request: SwitchTenantRequest) => {
      let currentToken: string | null = null;
      update((state) => {
        currentToken = state.token;
        return state;
      });

      return multiTenant.handleSwitchTenant(request, currentToken, update);
    },

    // Logout
    logout: async () => {
      let token: string | null = null;

      update((state) => {
        token = state.token;
        return state;
      });

      if (token) {
        try {
          await authService.logout(token);
        } catch (error) {
          console.error("Error during logout:", error);
        }
      }

      storage.clearAllAuthData();
      set(initialState);
    },

    // Update user
    updateUser: (user: User) => {
      update((state) => ({ ...state, user }));
      storage.saveUser(user);
    },

    // Clear error
    clearError: () => {
      update((state) => ({ ...state, error: null }));
    },

    // Refresh token
    refreshToken: async () => {
      let currentToken: string | null = null;

      update((state) => {
        currentToken = state.token;
        return state;
      });

      if (!currentToken) {
        throw new Error("No token to refresh");
      }

      try {
        const response = await authService.refreshToken(currentToken);
        storage.saveToken(response.access_token);
        update((state) => ({ ...state, token: response.access_token }));
        return response;
      } catch (error) {
        storage.clearAllAuthData();
        set(initialState);
        throw error;
      }
    },
  };
}

export const authStore = createAuthStore();
