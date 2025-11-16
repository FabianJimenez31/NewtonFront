/**
 * Inbox Store - Newton CRM
 * Svelte store for managing inbox conversations state
 */

import { writable, derived, get } from "svelte/store";
import {
  getInbox,
  getPriorityInbox,
} from "$lib/services/conversations.service";
import type {
  Conversation,
  ConversationDetail,
  InboxTab,
  InboxFilters,
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
      filtered = filtered.filter((c) => c.status === $filters.status);
    }

    // Apply priority filter
    if ($filters.priority) {
      filtered = filtered.filter((c) => c.priority === $filters.priority);
    }

    // Apply stage filter
    if ($filters.stage) {
      filtered = filtered.filter((c) => c.stage === $filters.stage);
    }

    // Apply agent filter
    if ($filters.agent) {
      filtered = filtered.filter(
        (c) => c.assigned_agent?.id === $filters.agent,
      );
    }

    // Apply channel filter
    if ($filters.channel) {
      filtered = filtered.filter((c) => c.channel === $filters.channel);
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
   * Load inbox conversations
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

      const data = priority
        ? await getPriorityInbox(token, params)
        : await getInbox(token, params);

      conversations.set(data);
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

// ==================== MOCK DATA ====================

function getMockConversations(): ConversationDetail[] {
  return [
    {
      id: "1",
      lead_id: "lead-1",
      contact_name: "María González",
      contact_email: "maria.gonzalez@email.com",
      contact_phone: "+52 55 1234 5678",
      contact_avatar: undefined,
      last_message:
        "Hola, estoy interesada en conocer más sobre sus servicios de CRM",
      last_message_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      last_message_sender: "contact",
      unread_count: 2,
      status: "open",
      assigned_agent: {
        id: "agent-1",
        name: "Juan Pérez",
        email: "juan@company.com",
        avatar: undefined,
        role: "sales",
      },
      channel: "whatsapp",
      priority: "high",
      stage: "Exploración",
      stage_id: "stage-1",
      score: 85,
      tags: ["hot-lead", "enterprise"],
        messages: [],
    },
    {
      id: "2",
      lead_id: "lead-2",
      contact_name: "Carlos Rodríguez",
      contact_phone: "+52 55 9876 5432",
      last_message: "¿Cuándo podemos agendar una demo?",
      last_message_time: new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString(),
      last_message_sender: "contact",
      unread_count: 0,
      status: "open",
      assigned_agent: {
        id: "agent-1",
        name: "Juan Pérez",
        email: "juan@company.com",
        avatar: undefined,
        role: "sales",
      },
      channel: "whatsapp",
      priority: "medium",
      stage: "Propuesta Enviada",
      stage_id: "stage-3",
      score: 72,
        messages: [],
    },
    {
      id: "3",
      lead_id: "lead-3",
      contact_name: "Ana Martínez",
      contact_email: "ana.m@startup.io",
      contact_phone: "+52 55 5555 1234",
      last_message: "Gracias por la información, voy a revisarla con mi equipo",
      last_message_time: new Date(
        Date.now() - 1 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      last_message_sender: "agent",
      unread_count: 0,
      status: "open",
      channel: "email",
      priority: "low",
      stage: "Calificado",
      stage_id: "stage-2",
      score: 45,
        messages: [],
    },
    {
      id: "4",
      lead_id: "lead-4",
      contact_name: "Roberto Silva",
      contact_phone: "+52 55 7777 8888",
      last_message: "Me interesa el plan enterprise",
      last_message_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      last_message_sender: "contact",
      unread_count: 5,
      status: "open",
      channel: "whatsapp",
      priority: "high",
      stage: "En Negociación",
      stage_id: "stage-4",
      score: 92,
      tags: ["vip"],
        messages: [],
    },
    {
      id: "5",
      lead_id: "lead-5",
      contact_name: "Laura Fernández",
      contact_email: "laura.f@company.com",
      contact_phone: "+52 55 3333 2222",
      last_message: "¿Tienen integración con Salesforce?",
      last_message_time: new Date(
        Date.now() - 3 * 60 * 60 * 1000,
      ).toISOString(),
      last_message_sender: "contact",
      unread_count: 1,
      status: "open",
      channel: "email",
      stage: "Exploración",
      stage_id: "stage-1",
      score: 58,
        messages: [],
    },
  ];
}
