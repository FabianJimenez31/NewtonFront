/**
 * Inbox Search Store - Newton CRM
 * Reactive search handling with automatic backend calls
 */

import { derived, get } from "svelte/store";
import { filters, activeTab } from "./inbox.derived";
import { paginationActions } from "./inbox.pagination.actions";
import { loadInboxWithPagination } from "./inbox.init";

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const SEARCH_DEBOUNCE_MS = 500;
let lastSearchQuery = "";

/**
 * Subscribe to search filter changes and automatically trigger backend search
 * This runs automatically whenever the search filter changes
 */
export function initializeSearchReactivity(token: string) {
  return derived([filters, activeTab], ([$filters, $activeTab]) => {
    const searchQuery = $filters.search?.trim() || "";

    // Skip if query hasn't changed
    if (searchQuery === lastSearchQuery) {
      return;
    }

    lastSearchQuery = searchQuery;

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Debounce the search
    searchTimeout = setTimeout(async () => {
      if (!searchQuery) {
        // Empty search: reload normal inbox with pagination
        console.log("[SEARCH] Empty query - reloading normal inbox");
        await loadInboxWithPagination(token, $activeTab);
      } else {
        // Non-empty search: perform global search
        console.log(`[SEARCH] Performing global search: "${searchQuery}"`);
        await paginationActions.search(token, searchQuery);
      }
    }, SEARCH_DEBOUNCE_MS);

    return searchQuery;
  });
}
