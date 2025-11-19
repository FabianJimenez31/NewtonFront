/**
 * Inbox Derived Stores - Newton CRM
 * Computed/derived stores for inbox state
 */

import { derived, writable } from "svelte/store";
import type {
  ConversationStatus,
  Priority,
  Channel,
  ConversationDetail,
  InboxTab,
  InboxFilters,
} from "$lib/types/inbox.types";

// Import base stores directly to avoid circular dependency
// These are re-exported from inbox.store.ts
export const conversations = writable<ConversationDetail[]>([]);
export const selectedConversationId = writable<string | null>(null);
export const activeTab = writable<InboxTab>("all");
export const filters = writable<InboxFilters>({});
export const isLoading = writable(false);
export const error = writable<string | null>(null);
export const backendStageCounts = writable<Record<string, number>>({});

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
          filtered = filtered.filter((c) => {
            const match =
              (c.stage && ($filters.stage as string[]).includes(c.stage)) ||
              (c.stage_id && ($filters.stage as string[]).includes(c.stage_id));
            return match;
          });
        }
      } else {
        filtered = filtered.filter(
          (c) => c.stage === $filters.stage || c.stage_id === $filters.stage,
        );
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
