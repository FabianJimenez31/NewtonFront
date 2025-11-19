/**
 * Conversations Tabs Store - Newton CRM
 * Manages multiple active conversations as tabs
 */

import { writable, derived } from "svelte/store";

export interface ActiveConversation {
    id: string;
    leadId: string;
    contactName: string;
    contactAvatar?: string;
    isMinimized: boolean;
    lastActivity: string;
    unreadCount: number;
}

/**
 * Normalize conversation ID by removing any prefix
 */
function normalizeId(id: string): string {
    // Remove 'conv_' prefix if present
    return id.replace(/^conv_/, "");
}

// ==================== STATE ====================

export const activeConversations = writable<ActiveConversation[]>([]);
export const currentConversationId = writable<string | null>(null);

// ==================== DERIVED STORES ====================

/**
 * Get minimized conversations (tabs)
 */
export const minimizedConversations = derived(
    activeConversations,
    ($conversations) => {
        const minimized = $conversations.filter((c) => c.isMinimized);
        console.log("[minimizedConversations] derived update:", {
            total: $conversations.length,
            minimized: minimized.length,
            conversations: minimized,
        });
        return minimized;
    },
);

/**
 * Get active (maximized) conversation
 */
export const activeConversation = derived(
    [activeConversations, currentConversationId],
    ([$conversations, $currentId]) => {
        if (!$currentId) return null;
        return $conversations.find((c) => c.id === $currentId && !c.isMinimized);
    },
);

/**
 * Count total active conversations
 */
export const activeConversationsCount = derived(
    activeConversations,
    ($conversations) => $conversations.length,
);

// ==================== ACTIONS ====================

/**
 * Maximum number of simultaneous conversations
 */
const MAX_CONVERSATIONS = 10;

/**
 * Open a new conversation or maximize if already exists
 */
export function openConversation(conversation: {
    id: string;
    leadId: string;
    contactName: string;
    contactAvatar?: string;
}) {
    const normalizedId = normalizeId(conversation.id);
    console.log("[tabsActions.openConversation] opening:", conversation.id, "->", normalizedId);

    activeConversations.update((conversations) => {
        const existing = conversations.find((c) => c.id === normalizedId);

        if (existing) {
            // Already exists, just maximize it
            console.log("[tabsActions] conversation already exists, maximizing");
            return conversations.map((c) =>
                c.id === normalizedId ? { ...c, isMinimized: false } : c,
            );
        }

        // Check if we've reached the limit
        if (conversations.length >= MAX_CONVERSATIONS) {
            // Remove least recently used (first in array)
            console.log("[tabsActions] max conversations reached, removing oldest");
            conversations.shift();
        }

        // Add new conversation
        console.log("[tabsActions] adding new conversation");
        return [
            ...conversations,
            {
                id: normalizedId,
                leadId: conversation.leadId,
                contactName: conversation.contactName,
                contactAvatar: conversation.contactAvatar,
                isMinimized: false,
                lastActivity: new Date().toISOString(),
                unreadCount: 0,
            },
        ];
    });

    console.log("[tabsActions] setting currentConversationId to:", normalizedId);
    currentConversationId.set(normalizedId);
}

/**
 * Minimize a conversation (convert to tab)
 */
export function minimizeConversation(id: string) {
    const normalizedId = normalizeId(id);
    console.log("[tabsActions.minimizeConversation] minimizing:", id, "->", normalizedId);

    activeConversations.update((conversations) => {
        console.log("[tabsActions] current conversations:", conversations);
        const updated = conversations.map((c) =>
            c.id === normalizedId
                ? {
                    ...c,
                    isMinimized: true,
                    lastActivity: new Date().toISOString(),
                }
                : c,
        );
        console.log("[tabsActions] updated conversations:", updated);
        return updated;
    });

    // Clear current if it was the active one
    currentConversationId.update((current) => {
        console.log("[tabsActions] clearing current id:", current, "->", current === normalizedId ? null : current);
        return current === normalizedId ? null : current;
    });
}

/**
 * Maximize a conversation from tab
 */
export function maximizeConversation(id: string) {
    const normalizedId = normalizeId(id);
    activeConversations.update((conversations) =>
        conversations.map((c) =>
            c.id === normalizedId
                ? {
                    ...c,
                    isMinimized: false,
                    lastActivity: new Date().toISOString(),
                }
                : c,
        ),
    );

    currentConversationId.set(normalizedId);
}

/**
 * Close a conversation completely
 */
export function closeConversation(id: string) {
    const normalizedId = normalizeId(id);
    activeConversations.update((conversations) =>
        conversations.filter((c) => c.id !== normalizedId),
    );

    // Clear current if it was the active one
    currentConversationId.update((current) => (current === normalizedId ? null : current));
}

/**
 * Update unread count for a conversation
 */
export function updateUnreadCount(id: string, count: number) {
    const normalizedId = normalizeId(id);
    activeConversations.update((conversations) =>
        conversations.map((c) =>
            c.id === normalizedId ? { ...c, unreadCount: count } : c,
        ),
    );
}

/**
 * Clear all conversations
 */
export function clearAllConversations() {
    activeConversations.set([]);
    currentConversationId.set(null);
}

// Export all as tabsActions for convenience
export const tabsActions = {
    openConversation,
    minimizeConversation,
    maximizeConversation,
    closeConversation,
    updateUnreadCount,
    clearAllConversations,
};
