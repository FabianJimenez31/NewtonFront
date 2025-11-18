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
import { conversations, filters, activeTab, error } from "./inbox.store";
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

      const response = priority
        ? await getPriorityInbox(token, params)
        : await getInbox(token, params);

      console.log(
        `[PAGINATION] Page ${response.page}/${response.pages} loaded (${response.conversations.length} conversations)`,
      );

      conversations.set(response.conversations);

      applyPaginationMeta({
        page: response.page ?? requestedPage,
        pages: response.pages,
        total: response.total,
        limit,
      });
    } catch (err) {
      error.set(
        err instanceof Error
          ? err.message
          : "Error loading conversations page",
      );
      console.error("[PAGINATION] Failed to load page:", err);
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
