/**
 * Conversations Service - Newton CRM
 * Handles conversations and messaging operations
 * API Base: https://crm.inewton.ai/api/v1/conversations
 */

import type {
  Conversation,
  ConversationDetail,
  Message,
  InboxParams,
  SendMessageResponse,
  PollMessagesResponse,
  PollingStatus,
  Agent,
} from "$lib/types/inbox.types";
import {
  API_BASE_URL,
  authenticatedFetchJSON,
  authenticatedFetch,
  buildURL,
  handleApiError,
} from "./api.utils";
import {
  mapApiConversation,
  mapApiConversationDetail,
} from "./conversations.mappers";

const CONVERSATIONS_BASE = `${API_BASE_URL}/conversations`;

/**
 * Get conversations inbox 
 * @endpoint GET /api/v1/conversations/inbox
 */
export async function getInbox(
  token: string,
  params: InboxParams = {},
): Promise<ConversationDetail[]> {
  try {
    const url = buildURL(`${CONVERSATIONS_BASE}/inbox`, params);
    const response = await authenticatedFetchJSON<any>(url, token, {
      timeout: 10000,
    });

    let rawConversations: any[] = [];

    if (Array.isArray(response)) {
      rawConversations = response;
    } else if (response?.conversations) {
      rawConversations = response.conversations;
    } else if (response?.data) {
      rawConversations = response.data;
    }

    console.log(`[INBOX] Loaded ${rawConversations.length} conversations`);

    return rawConversations.map(mapApiConversationDetail);
  } catch (error) {
    console.error("[INBOX] Error:", error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Get priority inbox (high priority conversations)
 * @endpoint GET /api/v1/conversations/priority-inbox
 */
export async function getPriorityInbox(
  token: string,
  params: InboxParams = {},
): Promise<ConversationDetail[]> {
  try {
    const url = buildURL(`${CONVERSATIONS_BASE}/priority-inbox`, params);
    const response = await authenticatedFetchJSON<any>(url, token, {
      timeout: 10000,
    });

    let rawConversations: any[] = [];

    // Handle different response formats (same as getInbox)
    if (Array.isArray(response)) {
      rawConversations = response;
    } else if (
      response?.conversations &&
      Array.isArray(response.conversations)
    ) {
      rawConversations = response.conversations;
    } else if (response?.data && Array.isArray(response.data)) {
      rawConversations = response.data;
    }

    return rawConversations.map(mapApiConversationDetail);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Get full conversation with messages
 * @endpoint GET /api/v1/conversations/lead/{lead_id}
 */
export async function getConversation(
  token: string,
  id: string,
): Promise<ConversationDetail> {
  try {
    const endpoint = `${CONVERSATIONS_BASE}/lead/${id}`;
    const response = await authenticatedFetchJSON<any>(endpoint, token, {
      timeout: 10000
    });

    console.log(`[CONVERSATION] Fetched conversation, messages: ${response.messages?.length || 0}`);

    const conversation = mapApiConversationDetail(response);

    // Remove duplicate messages by ID
    if (conversation.messages) {
      const uniqueMessages = new Map();
      conversation.messages.forEach(msg => {
        if (!uniqueMessages.has(msg.id)) {
          uniqueMessages.set(msg.id, msg);
        }
      });
      conversation.messages = Array.from(uniqueMessages.values());
      console.log(`[CONVERSATION] After dedup: ${conversation.messages.length} unique messages`);
    }

    return conversation;
  } catch (error) {
    console.error(`[CONVERSATION] Error:`, error);
    throw new Error(handleApiError(error));
  }
}


/**
 * Send text message
 * @endpoint POST /api/v1/conversations/{conversation_id}/messages
 * @deprecated Use sendMessageToLead for new implementations
 */
export async function sendMessage(
  token: string,
  conversationId: string,
  content: string,
): Promise<Message> {
  try {
    const response = await authenticatedFetch(
      `${CONVERSATIONS_BASE}/${conversationId}/messages`,
      token,
      {
        method: "POST",
        body: JSON.stringify({ content }),
        timeout: 10000,
      },
    );
    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Send text message to lead (recommended endpoint)
 * @endpoint POST /api/v1/leads/{lead_id}/messages
 */
export async function sendMessageToLead(
  token: string,
  leadId: string,
  content: string,
  messageType: string = "text",
): Promise<Message> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/leads/${leadId}/messages`,
      token,
      {
        method: "POST",
        body: JSON.stringify({
          content,
          message_type: messageType,
          media_url: null,
          media_filename: null,
          media_mimetype: null,
        }),
        timeout: 10000,
      },
    );
    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export { sendAudio, sendFile } from "./conversations.media.service";

/**
 * Poll for new messages
 * @endpoint POST /api/v1/conversations/poll/messages
 */
export async function pollMessages(token: string): Promise<Message[]> {
  try {
    const response = await authenticatedFetchJSON<any>(
      `${CONVERSATIONS_BASE}/poll/messages`,
      token,
      { method: "POST", timeout: 5000 },
    );

    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    } else if (response?.messages && Array.isArray(response.messages)) {
      return response.messages;
    } else if (response?.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      // No new messages or unexpected format
      return [];
    }
  } catch (error) {
    // Polling errors are common (no new messages), don't throw
    console.debug("[POLLING] No new messages or error:", error);
    return [];
  }
}

/**
 * Get polling status
 * @endpoint GET /api/v1/conversations/poll/status
 */
export async function getPollingStatus(token: string): Promise<PollingStatus> {
  try {
    return await authenticatedFetchJSON<PollingStatus>(
      `${CONVERSATIONS_BASE}/poll/status`,
      token,
      { timeout: 5000 },
    );
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Toggle AI mode for conversation
 * @endpoint PATCH /api/v1/conversations/{conversation_id}/toggle-ai
 */
export async function toggleAI(
  token: string,
  conversationId: string,
  enabled: boolean,
): Promise<any> {
  try {
    const url = `${CONVERSATIONS_BASE}/${conversationId}/toggle-ai?ai_enabled=${enabled}`;
    return await authenticatedFetchJSON(url, token, {
      method: "PATCH",
      timeout: 5000,
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Get agents list for filters
 * @endpoint GET /api/v1/conversations/agents
 */
export async function getAgents(token: string): Promise<Agent[]> {
  try {
    const response = await authenticatedFetchJSON<any>(
      `${API_BASE_URL}/users/`,
      token,
      { timeout: 5000 },
    );

    let users: any[] = [];
    if (Array.isArray(response)) {
      users = response;
    } else if (response?.users && Array.isArray(response.users)) {
      users = response.users;
    } else if (response?.data && Array.isArray(response.data)) {
      users = response.data;
    }

    return users
      .filter((u) => u.role === "agente")
      .map((u) => ({
        id: u.id,
        name: u.name || u.full_name || u.username || u.email || "Sin nombre",
        email: u.email || "",
        role: u.role || "agent",
        avatar: u.avatar_url || u.avatar,
        is_online: u.is_online,
      }));
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
