/**
 * Conversation Handlers
 * Extracted logic for +page.svelte to reduce file size
 */

import { get } from "svelte/store";
import {
  inboxActions,
  filteredConversations,
  conversations,
} from "$lib/stores/inbox.store";
import {
  messagingActions,
  currentConversation,
} from "$lib/stores/messaging.store";
import { messages } from "$lib/stores/messaging.state";
import { paginationActions } from "$lib/stores/inbox.pagination.actions";
import { agentActions } from "$lib/stores/inbox.agents.store";
import { loadInboxWithPagination } from "$lib/stores/inbox.init";
import { toggleAI, pauseAI, resumeAI } from "$lib/services/ai.service";
import { paginationSummary } from "$lib/stores/inbox.pagination.store";
import {
  tabsActions,
  activeConversations,
} from "$lib/stores/conversations-tabs.store";
import { moveLead } from "$lib/services/leads.service";
import {
  webSocketService,
  type WebSocketMessage,
} from "$lib/services/websocket.service";
import type { Message, MessageSender } from "$lib/types/inbox.types";
import { sendTextMessageViaWS } from "$lib/stores/messaging.websocket";
import { mapApiMessage } from "$lib/services/conversations.mappers";

/**
 * Setup WebSocket callbacks for handling incoming messages
 */
function setupWebSocketCallbacks() {
  webSocketService.setCallbacks({
    onNewMessage: (data: WebSocketMessage) => {
      const message = data.message;
      const leadId = data.lead_id;

      if (!message) return;

      // Check if this is for the currently active conversation
      const activeConversation = get(currentConversation);
      const currentLeadId = webSocketService.getCurrentLeadId();

      const isCurrentConversation =
        activeConversation &&
        (activeConversation.lead_id === leadId ||
          activeConversation.lead_id === currentLeadId ||
          activeConversation.id === leadId);

      let mappedMessage: Message | null = null;

      if (isCurrentConversation) {
        // Check for duplicates
        const currentMessages = get(messages);
        const messageId = message.id as string | undefined;
        const isDuplicate =
          messageId && currentMessages.some((m) => m.id === messageId);

        if (!isDuplicate) {
          // Use mapApiMessage to properly process the message
          // This ensures URLs are normalized and types are correct
          const conversationId = activeConversation?.id || (leadId as string) || "";
          mappedMessage = mapApiMessage(message, conversationId);

          console.log("[WebSocket] Message added to conversation");
          messagingActions.addMessage(mappedMessage);
        }
      }

      // Update inbox list
      const convId = activeConversation?.id || (leadId as string) || "";
      if (convId) {
        inboxActions.updateConversation(convId, {
          last_message: message.content as string,
          last_message_time: message.timestamp as string,
          last_message_sender: mappedMessage?.sender || ("contact" as MessageSender),
          unread_count: isCurrentConversation ? 0 : undefined,
        });
      }
    },

    onMessageSent: (data: WebSocketMessage) => {
      console.log("[WebSocket] Message sent confirmation received:", data);
      const message = data.message;
      if (!message) return;

      // Update the optimistic message with the server response
      // The server returns the confirmed message with the real ID and media URL
      const conversationId = get(currentConversation)?.id || "";
      const mappedMessage = mapApiMessage(message, conversationId);

      console.log("[WebSocket] Updating optimistic message with server data");

      // Find and update temp message or add if not exists
      const currentMessages = get(messages);
      const tempMessageIndex = currentMessages.findIndex(m =>
        m.id.startsWith('temp-')
      );

      if (tempMessageIndex >= 0) {
        // Update the temp message with real data
        messagingActions.updateMessage(currentMessages[tempMessageIndex].id, mappedMessage);
      } else {
        // Add as new message if temp not found
        messagingActions.addMessage(mappedMessage);
      }
    },

    onMessageStatus: (messageId: string, status: string) => {
      messagingActions.updateMessage(messageId, { status });
    },

    onError: (error: string) => {
      console.error("[WebSocket] Error from server:", error);
    },
  });
}

export function createConversationHandlers(
  getAuthToken: () => string,
  getTenantId: () => string | undefined,
) {
  // Setup WebSocket callbacks once
  setupWebSocketCallbacks();

  async function selectConversation(id: string | null) {
    console.log("[selectConversation] Called with id:", id);
    const authToken = getAuthToken();
    if (!authToken) {
      console.log("[selectConversation] No authToken, returning");
      return;
    }

    if (!id) {
      console.log("[selectConversation] Clearing selection");
      webSocketService.disconnect();
      inboxActions.selectConversation(null);
      return;
    }

    // Find the conversation to get its details
    let conversation = get(filteredConversations).find((c) => c.id === id);

    if (!conversation) {
      conversation = get(conversations).find((c) => c.id === id);
    }

    if (!conversation) {
      const activeTab = get(activeConversations).find((c) => c.id === id);
      if (activeTab) {
        conversation = {
          id: activeTab.id,
          lead_id: activeTab.leadId,
          contact_name: activeTab.contactName,
          contact_avatar: activeTab.contactAvatar,
        } as any;
      }
    }

    if (!conversation) {
      console.error("[INBOX] Conversation not found:", id);
      return;
    }

    // Open conversation in tabs system
    tabsActions.openConversation({
      id: conversation.id,
      leadId: conversation.lead_id,
      contactName: conversation.contact_name,
      contactAvatar: conversation.contact_avatar,
    });

    // Select conversation by ID for UI highlighting
    inboxActions.selectConversation(id);

    // Load conversation details using lead_id
    await messagingActions.loadConversation(authToken, conversation.lead_id, {
      name: conversation.contact_name,
      avatar: conversation.contact_avatar,
    });

    // Connect WebSocket to this lead
    const tenantId = getTenantId();
    if (tenantId && conversation.lead_id) {
      console.log("[WebSocket] Connecting to lead:", conversation.lead_id);
      webSocketService.connect(tenantId, conversation.lead_id, authToken);
    }

    // Mark as read using conversation id
    inboxActions.markAsRead(id);
  }

  async function minimizeConversation() {
    const conversation = get(currentConversation);
    if (!conversation) return;

    console.log("[minimizeConversation] Minimizing:", conversation.id);
    webSocketService.disconnect();
    tabsActions.minimizeConversation(conversation.id);
    messagingActions.clearConversation();
  }

  async function closeConversationTab(id: string) {
    console.log("[closeConversationTab] Closing:", id);
    const currentConv = get(currentConversation);

    tabsActions.closeConversation(id);

    if (currentConv?.id === id) {
      webSocketService.disconnect();
      messagingActions.clearConversation();
      inboxActions.selectConversation(null);
    }
  }

  async function changeTab(tab: "all" | "mine" | "unassigned") {
    const authToken = getAuthToken();
    if (!authToken) return;
    await loadInboxWithPagination(authToken, tab);
  }

  async function goToPage(page: number) {
    const authToken = getAuthToken();
    if (!authToken) return;
    const currentPagination = get(paginationSummary);
    if (currentPagination?.page === page) return;
    await paginationActions.loadPage(authToken, page);
  }

  async function sendMessage(msg: string) {
    const authToken = getAuthToken();
    if (!authToken || !msg.trim()) return;
    try {
      await sendTextMessageViaWS(msg);
    } catch (err) {
      console.error("Send failed:", err);
      throw err;
    }
  }

  async function sendFile(file: File) {
    const authToken = getAuthToken();
    if (!authToken) return;
    try {
      await messagingActions.sendFileMessage(authToken, file);
    } catch (err) {
      console.error("File send failed:", err);
    }
  }

  async function sendAudio(file: File) {
    const authToken = getAuthToken();
    if (!authToken) return;
    try {
      await messagingActions.sendAudioMessage(authToken, file);
    } catch (err) {
      console.error("Audio send failed:", err);
    }
  }

  async function handleAIToggle(enabled: boolean, reason?: string) {
    const authToken = getAuthToken();
    const conversation = get(currentConversation);
    if (!authToken || !conversation?.lead) return;
    try {
      await toggleAI(authToken, conversation.lead.id, enabled, reason);
      await messagingActions.loadConversation(authToken, conversation.id);
    } catch (err) {
      console.error("AI toggle failed:", err);
    }
  }

  async function handleAIPause(reason: string) {
    const authToken = getAuthToken();
    const conversation = get(currentConversation);
    if (!authToken || !conversation?.lead) return;
    try {
      await pauseAI(authToken, conversation.lead.id, reason);
      await messagingActions.loadConversation(authToken, conversation.id);
    } catch (err) {
      console.error("AI pause failed:", err);
    }
  }

  async function handleAIResume() {
    const authToken = getAuthToken();
    const conversation = get(currentConversation);
    if (!authToken || !conversation?.lead) return;
    try {
      await resumeAI(authToken, conversation.lead.id);
      await messagingActions.loadConversation(authToken, conversation.id);
    } catch (err) {
      console.error("AI resume failed:", err);
    }
  }

  function handleAssignAgent(agentId: string | null) {
    const authToken = getAuthToken();
    const conversation = get(currentConversation);
    if (!conversation || !authToken) return;

    const targetLeadId = conversation.lead?.id || conversation.lead_id;
    agentActions.assignAgent(authToken, conversation.id, targetLeadId, agentId);
  }

  async function handleStageChange(stageId: string) {
    const authToken = getAuthToken();
    const conversation = get(currentConversation);
    if (!authToken || !conversation?.lead_id) return;

    try {
      await moveLead(authToken, conversation.lead_id, stageId);
      await messagingActions.loadConversation(authToken, conversation.lead_id);
      await loadInboxWithPagination(authToken, "all");
    } catch (err) {
      console.error("Stage change failed:", err);
    }
  }

  function formatTime(timestamp: string): string {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  }

  return {
    selectConversation,
    minimizeConversation,
    closeConversationTab,
    changeTab,
    goToPage,
    sendMessage,
    sendFile,
    sendAudio,
    handleAIToggle,
    handleAIPause,
    handleAIResume,
    handleAssignAgent,
    handleStageChange,
    formatTime,
  };
}
