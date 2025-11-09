/**
 * Auth Storage - Newton CRM
 * LocalStorage and Cookie management for authentication data
 */

import { browser } from "$app/environment";
import type { User, TenantInfo } from "$lib/types/auth";
import { setCookie, getCookie, deleteCookie } from "$lib/utils/cookies";

// Token Storage - save to both localStorage and cookies
export function saveToken(token: string): void {
  if (browser) {
    localStorage.setItem("auth_token", token);
    setCookie("auth_token", token, 7); // 7 days expiry
  }
}

export function getToken(): string | null {
  if (browser) {
    // Try localStorage first, then cookies
    return localStorage.getItem("auth_token") || getCookie("auth_token");
  }
  return null;
}

export function removeToken(): void {
  if (browser) {
    localStorage.removeItem("auth_token");
    deleteCookie("auth_token");
  }
}

// User Storage
export function saveUser(user: User): void {
  if (browser) {
    localStorage.setItem("auth_user", JSON.stringify(user));
  }
}

export function getUser(): User | null {
  if (browser) {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function removeUser(): void {
  if (browser) {
    localStorage.removeItem("auth_user");
  }
}

// Temp Token Storage (for multi-tenant)
export function saveTempToken(token: string): void {
  if (browser) {
    localStorage.setItem("temp_token", token);
  }
}

export function getTempToken(): string | null {
  if (browser) {
    return localStorage.getItem("temp_token");
  }
  return null;
}

export function removeTempToken(): void {
  if (browser) {
    localStorage.removeItem("temp_token");
  }
}

// Temp User Storage
export function saveTempUser(user: unknown): void {
  if (browser) {
    localStorage.setItem("temp_user", JSON.stringify(user));
  }
}

export function getTempUser(): unknown | null {
  if (browser) {
    const stored = localStorage.getItem("temp_user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function removeTempUser(): void {
  if (browser) {
    localStorage.removeItem("temp_user");
  }
}

// Available Tenants Storage
export function saveAvailableTenants(tenants: TenantInfo[]): void {
  if (browser) {
    localStorage.setItem("available_tenants", JSON.stringify(tenants));
  }
}

export function getAvailableTenants(): TenantInfo[] {
  if (browser) {
    const stored = localStorage.getItem("available_tenants");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
  }
  return [];
}

export function removeAvailableTenants(): void {
  if (browser) {
    localStorage.removeItem("available_tenants");
  }
}

// Clear All Auth Data
export function clearAllAuthData(): void {
  removeToken();
  removeUser();
  removeTempToken();
  removeTempUser();
  removeAvailableTenants();
}
