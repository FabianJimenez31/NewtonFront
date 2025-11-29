/**
 * Messaging WebSocket Actions
 * Functions for sending messages via WebSocket
 */

import { get } from "svelte/store";
import { webSocketService } from "$lib/services/websocket.service";
import { authStore } from "./auth.store";
import {
  currentConversation,
  messages,
  isSending,
  error,
} from "./messaging.state";
import type { Message } from "$lib/types/inbox.types";

/**
 * Send text message via WebSocket
 */
export async function sendTextMessageViaWS(content: string): Promise<boolean> {
  const conversation = get(currentConversation);
  if (!conversation) {
    console.error("[WS] No active conversation");
    return false;
  }

  if (!webSocketService.isConnected()) {
    console.error("[WS] WebSocket not connected");
    error.set("WebSocket no conectado");
    return false;
  }

  isSending.set(true);
  error.set(null);

  try {
    // Send via WebSocket
    const sent = webSocketService.sendMessage(content);

    if (!sent) {
      throw new Error("Failed to send via WebSocket");
    }

    const currentUser = get(authStore).user;
    const tempId = `temp-${Date.now()}`;

    // Optimistic update - add message immediately
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conversation.id,
      content,
      timestamp: new Date().toISOString(),
      sender: "agent",
      sender_id: currentUser?.id,
      sender_name: currentUser?.name || "Agente",
      read: true,
      type: "text",
      status: "sending",
    };

    console.log("[WS] Optimistic message:", optimisticMessage);

    messages.update((msgs) => [...msgs, optimisticMessage]);

    // Update last message in conversation
    currentConversation.update((conv) =>
      conv
        ? {
            ...conv,
            last_message: content,
            last_message_time: optimisticMessage.timestamp,
            last_message_sender: "agent",
          }
        : null,
    );

    return true;
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Error sending message";
    error.set(errorMsg);
    console.error("[WS] Failed to send message:", err);
    return false;
  } finally {
    isSending.set(false);
  }
}
