/**
 * Messaging State - Newton CRM
 * State definitions for messaging store
 */

import { writable, derived } from "svelte/store";
import type { ConversationDetail, Message } from "$lib/types/inbox.types";

// ==================== STATE ====================

export const currentConversation = writable<ConversationDetail | null>(null);
export const messages = writable<Message[]>([]);
export const isLoadingMessages = writable(false);
export const isSending = writable(false);
export const error = writable<string | null>(null);

// ==================== DERIVED STORES ====================

/**
 * Get unread messages in current conversation
 */
export const unreadMessages = derived(messages, ($messages) =>
    $messages.filter((m) => !m.read && m.sender === "contact"),
);

/**
 * Get messages grouped by date
 */
export const messagesByDate = derived(messages, ($messages) => {
    const grouped = new Map<string, Message[]>();

    $messages.forEach((msg) => {
        const date = new Date(msg.timestamp).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        if (!grouped.has(date)) {
            grouped.set(date, []);
        }
        grouped.get(date)!.push(msg);
    });

    return Array.from(grouped.entries()).map(([date, msgs]) => ({
        date,
        messages: msgs,
    }));
});

/**
 * Check if current conversation has AI enabled
 */
export const isAIEnabled = derived(
    currentConversation,
    ($conversation) => $conversation?.lead?.ai_enabled ?? false,
);

/**
 * Check if AI is paused
 */
export const isAIPaused = derived(
    currentConversation,
    ($conversation) =>
        $conversation?.lead?.ai_enabled && !!$conversation?.lead?.ai_paused_reason,
);
