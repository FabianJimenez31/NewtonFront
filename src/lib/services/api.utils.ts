/**
 * API Utilities
 * Shared utilities for making authenticated API requests
 */

import type { ApiError } from "$lib/types/inbox.types";

export const API_BASE_URL = "https://crm.inewton.ai/api/v1";

/**
 * Handles API errors and returns formatted error message
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "detail" in error) {
    return (error as ApiError).detail;
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
