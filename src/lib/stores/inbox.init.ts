/**
 * Inbox Initialization - Newton CRM
 * Handles initial load with pagination support
 */

import type { InboxTab } from "$lib/types/inbox.types";
import { activeTab, isLoading, error, conversations } from "./inbox.store";
import { resetPagination } from "./inbox.pagination.store";
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
    activeTab.set(tab);
    await paginationActions.loadPage(token, 1, priority);
  } catch (err) {
    error.set(err instanceof Error ? err.message : "Error loading inbox");
    console.error("[INBOX] Failed to load:", err);
    conversations.set([]);
  } finally {
    isLoading.set(false);
  }
}
