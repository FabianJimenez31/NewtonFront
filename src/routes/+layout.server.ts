/**
 * Layout Server Load Function
 * Validates authentication server-side before rendering pages
 */

import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url, cookies }) => {
  const pathname = url.pathname;

  // Skip validation for static assets and API routes
  const skipPaths = [
    "/api",
    "/favicon",
    "/_app",
    "/node_modules",
    "/@",
    "/src",
    ".png",
    ".jpg",
    ".svg",
    ".css",
    ".js",
    ".ico",
  ];

  const shouldSkip = skipPaths.some((path) => pathname.includes(path));

  if (shouldSkip) {
    return {};
  }

  // Routes that don't require authentication
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Get auth token from cookies
  const authToken = cookies.get("auth_token");

  // If accessing protected route without auth, redirect to login
  if (!isPublicRoute && !authToken) {
    console.log(
      `[LAYOUT SERVER] No auth for ${pathname}, redirecting to /login`,
    );
    throw redirect(303, "/login");
  }

  // If accessing login while already authenticated, redirect to pipeline
  if (pathname === "/login" && authToken) {
    console.log(
      `[LAYOUT SERVER] Already authenticated, redirecting to /pipeline`,
    );
    throw redirect(303, "/pipeline");
  }

  return {
    isAuthenticated: !!authToken,
  };
};
