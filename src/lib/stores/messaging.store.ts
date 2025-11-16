/**
 * Messaging Store - Newton CRM
 * Svelte store for managing messaging and conversation details
 */

import { writable, derived, get } from "svelte/store";
import {
  getConversation,
  sendMessage,
  sendAudio,
  sendFile,
  pollMessages,
} from "$lib/services/conversations.service";
import { mapApiConversationDetail } from "$lib/services/conversations.mappers";
import { conversations } from "./inbox.store";
import type { ConversationDetail, Message } from "$lib/types/inbox.types";

// ==================== STATE ====================

export const currentConversation = writable<ConversationDetail | null>(null);
export const messages = writable<Message[]>([]);
export const isLoadingMessages = writable(false);
export const isSending = writable(false);
export const error = writable<string | null>(null);

// Polling state
let pollingInterval: number | null = null;
let currentToken: string | null = null;

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

// ==================== ACTIONS ====================

export const messagingActions = {
  /**
   * Load conversation with messages
   * Uses data from inbox store if available (messages are already there)
   */
  async loadConversation(token: string, id: string) {
    console.log("[MESSAGING] loadConversation called for ID:", id);
    isLoadingMessages.set(true);
    error.set(null);

    try {
      console.log("[MESSAGING] Fetching full conversation history from API");

      // Fetch full conversation with all messages using lead_id
      const conversation = await getConversation(token, id);

      console.log(
        `[MESSAGING] Loaded ${conversation.messages?.length || 0} messages from API`,
      );

      currentConversation.set(conversation);
      messages.set(conversation.messages || []);
    } catch (err) {
      error.set(
        err instanceof Error ? err.message : "Error loading conversation",
      );
      console.error("[MESSAGING] Failed to load conversation:", err);
    } finally {
      isLoadingMessages.set(false);
    }
  },

  /**
   * Send text message
   */
  async sendTextMessage(token: string, content: string) {
    const conversation = get(currentConversation);
    if (!conversation) {
      console.error("No active conversation");
      return;
    }

    isSending.set(true);
    error.set(null);

    try {
      const newMessage = await sendMessage(token, conversation.id, content);

      // Optimistic update - add message to local state immediately
      messages.update((msgs) => [...msgs, newMessage]);

      // Update last message in conversation
      currentConversation.update((conv) =>
        conv
          ? {
              ...conv,
              last_message: content,
              last_message_time: newMessage.timestamp,
              last_message_sender: "agent",
            }
          : null,
      );
    } catch (err) {
      error.set(err instanceof Error ? err.message : "Error sending message");
      console.error("Failed to send message:", err);
      throw err;
    } finally {
      isSending.set(false);
    }
  },

  /**
   * Send audio message
   */
  async sendAudioMessage(token: string, audioFile: File) {
    const conversation = get(currentConversation);
    if (!conversation) return;

    isSending.set(true);
    error.set(null);

    try {
      const newMessage = await sendAudio(token, conversation.id, audioFile);
      messages.update((msgs) => [...msgs, newMessage]);

      // Update last message in conversation
      currentConversation.update((conv) =>
        conv
          ? {
              ...conv,
              last_message: "🎤 Audio message",
              last_message_time: newMessage.timestamp,
              last_message_sender: "agent",
            }
          : null,
      );
    } catch (err) {
      error.set(err instanceof Error ? err.message : "Error sending audio");
      console.error("Failed to send audio:", err);
      throw err;
    } finally {
      isSending.set(false);
    }
  },

  /**
   * Send file attachment
   */
  async sendFileMessage(token: string, file: File) {
    const conversation = get(currentConversation);
    if (!conversation) return;

    isSending.set(true);
    error.set(null);

    try {
      const newMessage = await sendFile(token, conversation.id, file);
      messages.update((msgs) => [...msgs, newMessage]);

      // Update last message in conversation
      currentConversation.update((conv) =>
        conv
          ? {
              ...conv,
              last_message: `📎 ${file.name}`,
              last_message_time: newMessage.timestamp,
              last_message_sender: "agent",
            }
          : null,
      );
    } catch (err) {
      error.set(err instanceof Error ? err.message : "Error sending file");
      console.error("Failed to send file:", err);
      throw err;
    } finally {
      isSending.set(false);
    }
  },

  /**
   * Start polling for new messages
   */
  startPolling(token: string, intervalMs: number = 5000) {
    if (pollingInterval) return;

    currentToken = token;

    pollingInterval = window.setInterval(async () => {
      try {
        const newMessages = await pollMessages(token);

        if (newMessages.length > 0) {
          // Add new messages that aren't already in the list
          messages.update((msgs) => {
            const existingIds = new Set(msgs.map((m) => m.id));
            const uniqueNewMessages = newMessages.filter(
              (m) => !existingIds.has(m.id),
            );
            return [...msgs, ...uniqueNewMessages];
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, intervalMs);

    console.log("[MESSAGING] Started polling for messages");
  },

  /**
   * Stop polling for messages
   */
  stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      currentToken = null;
      console.log("[MESSAGING] Stopped polling for messages");
    }
  },

  /**
   * Clear current conversation
   */
  clearConversation() {
    currentConversation.set(null);
    messages.set([]);
    messagingActions.stopPolling();
  },

  /**
   * Add a message to the current conversation
   */
  addMessage(message: Message) {
    messages.update((msgs) => [...msgs, message]);
  },

  /**
   * Update a message in the current conversation
   */
  updateMessage(messageId: string, updates: Partial<Message>) {
    messages.update((msgs) =>
      msgs.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
    );
  },

  /**
   * Mark all messages as read
   */
  markAllAsRead() {
    messages.update((msgs) => msgs.map((m) => ({ ...m, read: true })));
  },
};
