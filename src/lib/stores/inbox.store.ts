/**
 * Inbox Store - Newton CRM
 * Svelte store for managing inbox conversations state
 */

import { writable, derived, get } from "svelte/store";
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

// ==================== STATE ====================

export const conversations = writable<ConversationDetail[]>([]);
export const selectedConversationId = writable<string | null>(null);
export const activeTab = writable<InboxTab>("all");
export const filters = writable<InboxFilters>({});
export const isLoading = writable(false);
export const error = writable<string | null>(null);

// ==================== DERIVED STORES ====================

/**
 * Get currently selected conversation
 */
export const selectedConversation = derived(
  [conversations, selectedConversationId],
  ([$conversations, $selectedId]) => {
    if (!$selectedId) return null;
    return $conversations.find((c) => c.id === $selectedId) || null;
  },
);

/**
 * Filter conversations based on active tab and filters
 */
export const filteredConversations = derived(
  [conversations, filters, activeTab],
  ([$conversations, $filters, $activeTab]) => {
    // Ensure $conversations is an array
    if (!Array.isArray($conversations)) {
      console.warn("[INBOX] Conversations is not an array:", $conversations);
      return [];
    }

    let filtered = [...$conversations];
    console.log("[INBOX STORE] Filtering with:", $filters);
    console.log("[INBOX STORE] Initial count:", filtered.length);

    // Filter by tab
    if ($activeTab === "mine") {
      // TODO: Get current user ID from auth store
      filtered = filtered.filter((c) => c.assigned_agent);
    } else if ($activeTab === "unassigned") {
      filtered = filtered.filter((c) => !c.assigned_agent);
    }

    // Apply search filter
    if ($filters.search) {
      const search = $filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.contact_name.toLowerCase().includes(search) ||
          c.last_message.toLowerCase().includes(search) ||
          c.contact_phone.includes(search) ||
          c.contact_email?.toLowerCase().includes(search),
      );
    }

    // Apply status filter
    if ($filters.status) {
      if (Array.isArray($filters.status)) {
        if ($filters.status.length > 0) {
          filtered = filtered.filter((c) =>
            ($filters.status as ConversationStatus[]).includes(c.status),
          );
        }
      } else {
        filtered = filtered.filter((c) => c.status === $filters.status);
      }
    }

    // Apply priority filter
    if ($filters.priority) {
      if (Array.isArray($filters.priority)) {
        if ($filters.priority.length > 0) {
          filtered = filtered.filter(
            (c) =>
              c.priority &&
              ($filters.priority as Priority[]).includes(c.priority),
          );
        }
      } else {
        filtered = filtered.filter((c) => c.priority === $filters.priority);
      }
    }

    // Apply stage filter
    if ($filters.stage) {
      if (Array.isArray($filters.stage)) {
        if ($filters.stage.length > 0) {
          // Check strict match against stage (for legacy/ID-as-stage) or stage_id
          filtered = filtered.filter(
            (c) => {
              const match = c.stage && ($filters.stage as string[]).includes(c.stage) ||
                c.stage_id && ($filters.stage as string[]).includes(c.stage_id);
              return match;
            }
          );
        }
      } else {
        filtered = filtered.filter((c) => c.stage === $filters.stage || c.stage_id === $filters.stage);
      }
    }

    // Apply agent filter
    if ($filters.agent) {
      if (Array.isArray($filters.agent)) {
        if ($filters.agent.length > 0) {
          filtered = filtered.filter(
            (c) =>
              c.assigned_agent?.id &&
              ($filters.agent as string[]).includes(c.assigned_agent.id),
          );
        }
      } else {
        filtered = filtered.filter(
          (c) => c.assigned_agent?.id === $filters.agent,
        );
      }
    }

    // Apply channel filter
    if ($filters.channel) {
      if (Array.isArray($filters.channel)) {
        if ($filters.channel.length > 0) {
          filtered = filtered.filter((c) =>
            ($filters.channel as Channel[]).includes(c.channel),
          );
        }
      } else {
        filtered = filtered.filter((c) => c.channel === $filters.channel);
      }
    }

    // Apply tags filter
    if ($filters.tags && $filters.tags.length > 0) {
      filtered = filtered.filter((c) =>
        $filters.tags?.some((tag) => c.tags?.includes(tag)),
      );
    }

    // Sort by last message time (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.last_message_time).getTime() -
        new Date(a.last_message_time).getTime(),
    );

    return filtered;
  },
);

/**
 * Total unread count across all conversations
 */
export const unreadCount = derived(conversations, ($conversations) => {
  if (!Array.isArray($conversations)) return 0;
  return $conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
});

/**
 * Unread count by tab
 */
export const unreadByTab = derived([conversations], ([$conversations]) => {
  if (!Array.isArray($conversations)) {
    return { all: 0, mine: 0, unassigned: 0 };
  }

  // TODO: Get current user ID from auth store
  const myConversations = $conversations.filter((c) => c.assigned_agent);
  const unassignedConversations = $conversations.filter(
    (c) => !c.assigned_agent,
  );

  return {
    all: $conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    mine: myConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    unassigned: unassignedConversations.reduce(
      (sum, c) => sum + (c.unread_count || 0),
      0,
    ),
  };
});

/**
 * Conversations count by tab
 */
export const countByTab = derived([conversations], ([$conversations]) => {
  if (!Array.isArray($conversations)) {
    return { all: 0, mine: 0, unassigned: 0 };
  }

  const myConversations = $conversations.filter((c) => c.assigned_agent);
  const unassignedConversations = $conversations.filter(
    (c) => !c.assigned_agent,
  );

  return {
    all: $conversations.length,
    mine: myConversations.length,
    unassigned: unassignedConversations.length,
  };
});

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
  updateFilters(newFilters: Partial<InboxFilters>) {
    filters.update((current) => ({ ...current, ...newFilters }));
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
