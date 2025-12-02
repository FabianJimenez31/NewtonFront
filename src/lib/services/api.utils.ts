/**
 * API Utilities
 * Shared utilities for making authenticated API requests
 */

import type { ApiError } from "$lib/types/inbox.types";

// Use relative URL to leverage Vite proxy configuration
// This prevents CORS errors and ensures all requests go through the dev server
export const API_BASE_URL = "/api/v1";
export const BACKEND_URL = "https://crm.inewton.ai";

/**
 * Normalizes media URL to ensure it's absolute
 */
export function normalizeMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${BACKEND_URL}${url}`;
  return `${BACKEND_URL}/${url}`;
}

/**
 * Handles API errors and returns formatted error message
 */
export function handleApiError(error: unknown): string {
  console.error("[API Error Detail]:", error);
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "detail" in error) {
    const detail = (error as ApiError).detail;
    if (typeof detail === "object") {
      return JSON.stringify(detail);
    }
    return String(detail);
  }
  return "Error desconocido. Por favor intenta de nuevo.";
}

/**
 * Makes authenticated request with JWT token
 */
export async function authenticatedFetch(
  url: string,
  token: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw error;
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }

    throw error;
  }
}

/**
 * Makes authenticated fetch and returns JSON
 */
export async function authenticatedFetchJSON<T>(
  url: string,
  token: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<T> {
  const response = await authenticatedFetch(url, token, options);
  return response.json();
}

/**
 * Build URL with query parameters
 */
export function buildURL(base: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return base;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
}
