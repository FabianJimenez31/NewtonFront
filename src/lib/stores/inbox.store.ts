/**
 * Inbox Store - Newton CRM
 * Svelte store for managing inbox conversations state
 */

import { get } from "svelte/store";
import {
  getInbox,
  getPriorityInbox,
} from "$lib/services/conversations.inbox.service";
import { getMockConversations } from "./inbox.mock";
import type {
  Conversation,
  ConversationDetail,
  InboxTab,
  InboxFilters,
  ConversationStatus,
  Priority,
  Channel,
} from "$lib/types/inbox.types";

// ==================== STATE & DERIVED STORES ====================
// All stores are now defined in inbox.derived.ts to avoid circular dependencies
export {
  // Base stores
  conversations,
  selectedConversationId,
  activeTab,
  filters,
  isLoading,
  error,
  backendStageCounts,
  // Derived stores
  selectedConversation,
  filteredConversations,
  unreadCount,
  unreadByTab,
  countByTab,
} from "./inbox.derived";

// Import stores for use in actions
import {
  conversations,
  selectedConversationId,
  activeTab,
  filters,
  isLoading,
  error,
  backendStageCounts,
} from "./inbox.derived";

// ==================== ACTIONS ====================

export const inboxActions = {
  /**
   * Load inbox conversations (legacy, use loadInboxWithPagination instead)
   */
  async loadInbox(
    token: string,
    tab: InboxTab = "all",
    priority: boolean = false,
  ) {
    isLoading.set(true);
    error.set(null);

    try {
      const params = {
        ...get(filters),
        limit: 100,
      };

      const response = priority
        ? await getPriorityInbox(token, params)
        : await getInbox(token, params);

      conversations.set(response.conversations);
      activeTab.set(tab);
    } catch (err) {
      error.set(err instanceof Error ? err.message : "Error loading inbox");
      console.error("Failed to load inbox:", err);

      // Load mock data for demo purposes
      console.warn("[INBOX] Loading mock data for demo");
      conversations.set(getMockConversations());
      activeTab.set(tab);
    } finally {
      isLoading.set(false);
    }
  },

  /**
   * Select a conversation
   */
  selectConversation(conversationId: string | null) {
    selectedConversationId.set(conversationId);
  },

  /**
   * Update filters
   */
  updateFilters(newFilters: Partial<InboxFilters> | Record<string, any>) {
    console.log("[INBOX ACTIONS] updateFilters called with:", newFilters);
    filters.update((current) => {
      const updated = { ...current, ...newFilters };
      // Remove null/undefined values to clear filters
      Object.keys(updated).forEach((key) => {
        if (
          updated[key as keyof InboxFilters] === null ||
          updated[key as keyof InboxFilters] === undefined
        ) {
          delete updated[key as keyof InboxFilters];
        }
      });
      console.log("[INBOX ACTIONS] Updated filters:", updated);
      return updated;
    });
  },

  /**
   * Clear all filters
   */
  clearFilters() {
    filters.set({});
  },

  /**
   * Refresh inbox
   */
  async refreshInbox(token: string) {
    const currentTab = get(activeTab);
    await inboxActions.loadInbox(token, currentTab);
  },

  /**
   * Update a conversation in the list (after message sent/received)
   */
  updateConversation(conversationId: string, updates: Partial<Conversation>) {
    conversations.update((convs) =>
      convs.map((c) => (c.id === conversationId ? { ...c, ...updates } : c)),
    );
  },

  /**
   * Mark conversation as read
   */
  markAsRead(conversationId: string) {
    conversations.update((convs) =>
      convs.map((c) =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c,
      ),
    );
  },

  /**
   * Add new conversation to the list
   */
  addConversation(conversation: ConversationDetail) {
    conversations.update((convs) => [conversation, ...convs]);
  },

  /**
   * Remove conversation from the list
   */
  removeConversation(conversationId: string) {
    conversations.update((convs) =>
      convs.filter((c) => c.id !== conversationId),
    );
  },
};
