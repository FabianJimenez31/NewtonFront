/**
 * Inbox Initialization - Newton CRM
 * Handles initial load with pagination support
 */

import { get } from "svelte/store";
import {
  getInbox,
  getPriorityInbox,
} from "$lib/services/conversations.inbox.service";
import type { InboxTab } from "$lib/types/inbox.types";
import {
  conversations,
  filters,
  activeTab,
  isLoading,
  error,
} from "./inbox.store";
import {
  pageSize,
  hasMore,
  isInitializing,
  resetPagination,
} from "./inbox.pagination.store";
import { paginationActions } from "./inbox.pagination.actions";

export async function loadInboxWithPagination(
  token: string,
  tab: InboxTab = "all",
  priority: boolean = false,
) {
  isLoading.set(true);
  error.set(null);
  resetPagination();

  try {
    const limit = get(pageSize);
    const params = {
      ...get(filters),
      page: 1,
      limit,
    };

    const response = priority
      ? await getPriorityInbox(token, params)
      : await getInbox(token, params);

    conversations.set(response.conversations);
    activeTab.set(tab);

    // Use has_more flag from API instead of comparing lengths
    hasMore.set(response.has_more);

    console.log(
      `[INBOX] Initial page loaded - ${response.conversations.length} conversations, has_more: ${response.has_more}, total: ${response.total}`,
    );

    // Set initializing flag to prevent IntersectionObserver from triggering during auto-fill
    isInitializing.set(true);

    // Auto-load additional pages to fill viewport (reach pageSize)
    // This ensures there's always enough content for scroll to work
    let previousCount = response.conversations.length;
    let safetyCounter = 0;
    const MAX_AUTO_LOADS = 3; // Safety limit to prevent infinite loops

    while (
      get(hasMore) &&
      get(conversations).length < 10 &&
      safetyCounter < 3
    ) {
      const currentCount = get(conversations).length;
      console.log(
        `[INBOX] Auto-loading more to fill viewport (${currentCount}/${limit}, page ${safetyCounter + 2})`,
      );

      await paginationActions.loadMore(token, priority);

      const newCount = get(conversations).length;

      // Safety check: if no new conversations were added, stop to prevent infinite loop
      if (newCount === previousCount) {
        console.warn(
          `[INBOX] Auto-load stopped - no new conversations added (stuck at ${newCount})`,
        );
        break;
      }

      previousCount = newCount;
      safetyCounter++;
    }

    if (safetyCounter >= MAX_AUTO_LOADS) {
      console.warn(
        `[INBOX] Auto-load stopped - reached safety limit (${MAX_AUTO_LOADS} pages)`,
      );
    }

    console.log(
      `[INBOX] Viewport fill complete - ${get(conversations).length} conversations loaded, has_more: ${get(hasMore)}`,
    );

    // Clear initializing flag - now IntersectionObserver can trigger normally
    isInitializing.set(false);
  } catch (err) {
    error.set(err instanceof Error ? err.message : "Error loading inbox");
    console.error("[INBOX] Failed to load:", err);
    conversations.set([]);
    // Clear initializing flag even on error
    isInitializing.set(false);
  } finally {
    isLoading.set(false);
  }
}
