/**
 * Conversations Mappers - Newton CRM
 * Functions to map API responses to frontend types
 */

import type {
  Conversation,
  ConversationDetail,
  Message,
} from "$lib/types/inbox.types";
import { normalizeMediaUrl } from "./api.utils";

/**
 * Map API message format to frontend Message type
 */
export function mapApiMessage(apiMsg: any, conversationId: string): Message {
  // Map API sender values to frontend types
  let mappedSender: "agent" | "contact" | "system" | "ai" = "contact";

  if (apiMsg.sender === "lead") {
    // Lead = customer/contact
    mappedSender = "contact";
  } else if (apiMsg.sender === "agent") {
    // Human agent
    mappedSender = "agent";
  } else if (apiMsg.sender === "system") {
    // System messages from AI (usually have secure_ prefix)
    // Most "system" messages are actually AI responses
    if (apiMsg.id?.startsWith("secure_")) {
      mappedSender = "ai";
    } else {
      mappedSender = "system";
    }
  } else if (apiMsg.sender === "ai_agent") {
    // AI agent messages
    mappedSender = "ai";
  }

  console.log('[MAPPER] Raw API message:', apiMsg);
  console.log('[MAPPER] Message type from API:', apiMsg.message_type);
  console.log('[MAPPER] Content:', apiMsg.content);
  console.log('[MAPPER] Media URL from API:', apiMsg.media_url);
  console.log('[MAPPER] Media filename:', apiMsg.media_filename);
  console.log('[MAPPER] Media mimetype:', apiMsg.media_mimetype);

  const normalizedFileUrl = normalizeMediaUrl(apiMsg.media_url);
  console.log("[MAPPER] Normalized file URL:", normalizedFileUrl);

  // Map message types - convert 'document' to 'file' for MessageBubble
  let messageType = apiMsg.message_type || "text";
  if (messageType === "document") {
    messageType = "file";
  }

  const mappedMessage = {
    id: apiMsg.id,
    conversation_id: conversationId,
    sender: mappedSender,
    sender_id: apiMsg.sender_id,
    sender_name: apiMsg.sender_name,
    content: apiMsg.content || "",
    timestamp: apiMsg.timestamp || new Date().toISOString(),
    read: true, // Assuming read for now
    type: messageType,
    metadata: {
      file_url: normalizedFileUrl,
      file_name: apiMsg.media_filename,
      file_size: apiMsg.media_size,
      file_type: apiMsg.media_mimetype,
      audio_duration: apiMsg.duration,
      ...apiMsg.metadata,
    },
    internal: apiMsg.internal || false,
  };
  console.log('[MAPPER] Mapped message:', mappedMessage);
  console.log('[MAPPER] File URL in metadata:', mappedMessage.metadata.file_url);
  return mappedMessage;
}

/**
 * Map API conversation format to frontend Conversation type
 */
export function mapApiConversation(apiConv: any): Conversation {
  return {
    id: apiConv.id,
    lead_id: apiConv.lead_id || apiConv.lead?.id || apiConv.id,
    contact_name: apiConv.name || "Sin nombre",
    contact_phone: apiConv.phone || "",
    contact_email: apiConv.email,
    contact_avatar: normalizeMediaUrl(apiConv.avatar_url),
    last_message:
      typeof apiConv.last_message === "string"
        ? apiConv.last_message
        : apiConv.last_message?.content || "",
    last_message_time:
      apiConv.last_message?.timestamp || new Date().toISOString(),
    last_message_sender: apiConv.last_message?.sender || ("contact" as const),
    unread_count: apiConv.unread_count || 0,
    status: (apiConv.conversation_status === "attended"
      ? "open"
      : apiConv.conversation_status) as any,
    assigned_agent: apiConv.assigned_agent,
    assigned_agent_id: apiConv.assigned_agent_id,
    channel: (apiConv.channel || "whatsapp") as any,
    priority: apiConv.priority,
    stage: apiConv.stage,
    stage_id: apiConv.stage_id || apiConv.lead?.stage_id,
    score: apiConv.score,
    tags: apiConv.tags,
  };
}

/**
 * Map API conversation to ConversationDetail (with messages)
 */
export function mapApiConversationDetail(apiConv: any): ConversationDetail {
  const baseConversation = mapApiConversation(apiConv);

  // Map messages if they exist
  const messages: Message[] = Array.isArray(apiConv.messages)
    ? apiConv.messages.map((msg: any) => mapApiMessage(msg, apiConv.id))
    : [];

  return {
    ...baseConversation,
    messages,
    lead: apiConv.lead,
  };
}
