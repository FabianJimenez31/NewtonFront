/**
 * Inbox Search Wrapper - Newton CRM
 * Provides an enhanced onSearchChange handler that triggers global backend search
 *
 * USAGE in ConversationsView.svelte:
 * Replace:
 *   onSearchChange={(q) => inboxActions.updateFilters({ search: q })}
 * With:
 *   onSearchChange={createSearchHandler(token, $activeTab)}
 */

import { inboxActions } from "$lib/stores/inbox.store";
import { handleSearchWithDebounce } from "./search.handlers";
import type { InboxTab } from "$lib/types/inbox.types";

/**
 * Creates a search handler that updates filters AND triggers backend search
 */
export function createSearchHandler(
  token: string,
  activeTab: InboxTab = "all",
  priority: boolean = false,
) {
  return (query: string) => {
    // Update the filter in the store (for UI reactivity)
    inboxActions.updateFilters({ search: query });

    // Trigger global backend search with debouncing
    handleSearchWithDebounce(query, token, activeTab, priority);
  };
}
