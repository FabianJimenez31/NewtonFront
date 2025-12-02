/**
 * Search Handlers - Newton CRM
 * Handles global search with debouncing
 */

import { paginationActions } from "$lib/stores/inbox.pagination.actions";
import { loadInboxWithPagination } from "$lib/stores/inbox.init";
import { inboxActions } from "$lib/stores/inbox.store";
import type { InboxTab } from "$lib/types/inbox.types";

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const SEARCH_DEBOUNCE_MS = 500;

/**
 * Handle search with debouncing
 * If query is empty, reload normal inbox
 * If query has content, search globally across all conversations
 */
export function handleSearchWithDebounce(
  query: string,
  token: string,
  activeTab: InboxTab = "all",
  priority: boolean = false,
) {
  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Debounce the search
  searchTimeout = setTimeout(async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      // Empty search: reload normal inbox with pagination
      console.log("[SEARCH] Empty query - reloading normal inbox");
      inboxActions.updateFilters({ search: undefined });
      await loadInboxWithPagination(token, activeTab, priority);
    } else {
      // Non-empty search: perform global search
      console.log(`[SEARCH] Performing global search: "${trimmedQuery}"`);
      inboxActions.updateFilters({ search: trimmedQuery });
      await paginationActions.search(token, trimmedQuery, priority);
    }
  }, SEARCH_DEBOUNCE_MS);
}

/**
 * Clear search and reload inbox
 */
export function clearSearch(
  token: string,
  activeTab: InboxTab = "all",
  priority: boolean = false,
) {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }

  console.log("[SEARCH] Clearing search and reloading inbox");
  inboxActions.updateFilters({ search: undefined });
  loadInboxWithPagination(token, activeTab, priority);
}
