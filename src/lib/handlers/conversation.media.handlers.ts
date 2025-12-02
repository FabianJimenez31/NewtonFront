/**
 * Conversation Media Handlers
 * Handles sending media messages (audio, image, PDF, video) via WebSocket
 */

import { webSocketService } from "$lib/services/websocket.core.service";
import { messagingActions } from "$lib/stores/messaging.store";
import { get } from "svelte/store";
import { currentConversation } from "$lib/stores/messaging.store";
import type { Message } from "$lib/types/inbox.types";

/**
 * Send audio message via WebSocket
 */
export async function sendAudioMessage(
  audioBase64: string,
  duration: number,
): Promise<void> {
  const conversation = get(currentConversation);
  if (!conversation) {
    console.error("[Media Handlers] No active conversation");
    return;
  }

  console.log("[Media Handlers] Sending audio message, duration:", duration);

  // Create optimistic message
  const tempMessage: Message = {
    id: `temp-audio-${Date.now()}`,
    content: "",
    sender: "agent",
    timestamp: new Date().toISOString(),
    type: "audio",
    status: "sending",
    internal: false,
    conversation_id: conversation.id,
    read: false,
  };

  messagingActions.addMessage(tempMessage);

  // Send via WebSocket
  const success = webSocketService.sendAudioMessage(audioBase64, duration);

  if (!success) {
    console.error("[Media Handlers] Failed to send audio");
    messagingActions.updateMessage(tempMessage.id, { status: "failed" });
  }
}

/**
 * Send image message via WebSocket
 */
export async function sendImageMessage(
  base64: string,
  mimetype: string,
  filename: string,
  caption?: string,
): Promise<void> {
  const conversation = get(currentConversation);
  if (!conversation) {
    console.error("[Media Handlers] No active conversation");
    return;
  }

  console.log("[Media Handlers] Sending image:", filename);

  // Create optimistic message
  const tempMessage: Message = {
    id: `temp-image-${Date.now()}`,
    content: caption || "",
    sender: "agent",
    timestamp: new Date().toISOString(),
    type: "image",
    status: "sending",
    internal: false,
    conversation_id: conversation.id,
    read: false,
    metadata: {
      file_name: filename,
      file_url: `data:${mimetype};base64,${base64}`,
    },
  };

  console.log("[Media Handlers] Created optimistic message:", tempMessage);
  messagingActions.addMessage(tempMessage);

  // Send via WebSocket
  const success = webSocketService.sendImageMessage(
    base64,
    mimetype,
    filename,
    caption,
  );

  if (!success) {
    console.error("[Media Handlers] Failed to send image");
    messagingActions.updateMessage(tempMessage.id, { status: "failed" });
  }
}

/**
 * Send PDF message via WebSocket
 */
export async function sendPdfMessage(
  base64: string,
  filename: string,
  caption?: string,
): Promise<void> {
  const conversation = get(currentConversation);
  if (!conversation) {
    console.error("[Media Handlers] No active conversation");
    return;
  }

  console.log("[Media Handlers] Sending PDF:", filename);

  // Create optimistic message
  const tempMessage: Message = {
    id: `temp-pdf-${Date.now()}`,
    content: caption || "",
    sender: "agent",
    timestamp: new Date().toISOString(),
    type: "file",
    status: "sending",
    internal: false,
    conversation_id: conversation.id,
    read: false,
    metadata: {
      file_name: filename,
      file_url: `data:application/pdf;base64,${base64}`,
    },
  };

  messagingActions.addMessage(tempMessage);

  // Send via WebSocket
  const success = webSocketService.sendPdfMessage(base64, filename, caption);

  if (!success) {
    console.error("[Media Handlers] Failed to send PDF");
    messagingActions.updateMessage(tempMessage.id, { status: "failed" });
  }
}

/**
 * Send video message via WebSocket
 */
export async function sendVideoMessage(
  base64: string,
  mimetype: string,
  filename: string,
  caption?: string,
): Promise<void> {
  const conversation = get(currentConversation);
  if (!conversation) {
    console.error("[Media Handlers] No active conversation");
    return;
  }

  console.log("[Media Handlers] Sending video:", filename);

  // Create optimistic message
  const tempMessage: Message = {
    id: `temp-video-${Date.now()}`,
    content: caption || "",
    sender: "agent",
    timestamp: new Date().toISOString(),
    type: "video",
    status: "sending",
    internal: false,
    conversation_id: conversation.id,
    read: false,
    metadata: {
      file_name: filename,
      file_url: `data:${mimetype};base64,${base64}`,
    },
  };

  messagingActions.addMessage(tempMessage);

  // Send via WebSocket
  const success = webSocketService.sendVideoMessage(
    base64,
    mimetype,
    filename,
    caption,
  );

  if (!success) {
    console.error("[Media Handlers] Failed to send video");
    messagingActions.updateMessage(tempMessage.id, { status: "failed" });
  }
}
