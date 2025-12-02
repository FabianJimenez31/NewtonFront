/**
 * Inbox Pagination Actions - Newton CRM
 * Loads specific pages of inbox conversations using API metadata
 */

import { get } from "svelte/store";
import {
  getInbox,
  getPriorityInbox,
} from "$lib/services/conversations.inbox.service";
import type { InboxTab, InboxFilters } from "$lib/types/inbox.types";
import {
  conversations,
  filters,
  activeTab,
  error,
  backendStageCounts,
} from "./inbox.store";
import {
  applyPaginationMeta,
  currentPage,
  isPageLoading,
  pageSize,
  resetPagination,
} from "./inbox.pagination.store";

export const paginationActions = {
  /**
   * Load a specific page of conversations
   */
  async loadPage(
    token: string,
    page: number = get(currentPage),
    priority: boolean = false,
  ) {
    const requestedPage = Math.max(1, page);

    if (get(isPageLoading)) {
      console.log("[PAGINATION] Skipping load - already in progress");
      return;
    }

    isPageLoading.set(true);
    error.set(null);

    try {
      const limit = get(pageSize);
      const currentFilters = get(filters);

      console.log(
        `[PAGINATION] Loading page ${requestedPage} with limit ${limit}`,
      );

      const params = {
        ...currentFilters,
        page: requestedPage,
        limit,
      };

      console.log("[PAGINATION] API params:", params);

      const response = priority
        ? await getPriorityInbox(token, params)
        : await getInbox(token, params);

      console.log(
        `[PAGINATION] Page ${response.page}/${response.pages} loaded (${response.conversations.length} conversations)`,
      );

      conversations.set(response.conversations);

      // Update backend stage counts if available
      if (response.stage_counts) {
        console.log(
          "[PAGINATION] Stage counts from backend:",
          response.stage_counts,
        );
        backendStageCounts.set(response.stage_counts);
      }

      applyPaginationMeta({
        page: response.page ?? requestedPage,
        pages: response.pages,
        total: response.total,
        limit,
      });
    } catch (err) {
      error.set(
        err instanceof Error ? err.message : "Error loading conversations page",
      );
      console.error("[PAGINATION] Failed to load page:", err);
    } finally {
      isPageLoading.set(false);
    }
  },

  /**
   * Search conversations globally
   * When search query is provided, fetches results using the maximum allowed limit (100)
   * For larger result sets, the user can paginate through search results
   */
  async search(token: string, searchQuery: string, priority: boolean = false) {
    if (get(isPageLoading)) {
      console.log("[SEARCH] Skipping search - already in progress");
      return;
    }

    isPageLoading.set(true);
    error.set(null);

    try {
      const currentFilters = get(filters);

      console.log(`[SEARCH] Searching for: "${searchQuery}"`);

      // Use maximum allowed limit (100) as per API validation
      const params = {
        ...currentFilters,
        search: searchQuery,
        page: 1,
        limit: 100, // Maximum allowed by API
      };

      console.log("[SEARCH] API params:", params);

      const response = priority
        ? await getPriorityInbox(token, params)
        : await getInbox(token, params);

      console.log(
        `[SEARCH] Found ${response.conversations.length} results on page 1 (total: ${response.total})`,
      );

      conversations.set(response.conversations);

      // Update pagination metadata with search results
      // User can navigate through pages if there are more than 100 results
      applyPaginationMeta({
        page: response.page,
        pages: response.pages,
        total: response.total,
        limit: 100,
      });
    } catch (err) {
      error.set(
        err instanceof Error ? err.message : "Error searching conversations",
      );
      console.error("[SEARCH] Failed to search:", err);
    } finally {
      isPageLoading.set(false);
    }
  },

  /**
   * Reset pagination metadata and target the first page
   */
  async reset(token: string, tab: InboxTab = "all", priority: boolean = false) {
    resetPagination();
    activeTab.set(tab);
    await paginationActions.loadPage(token, 1, priority);
  },
};
