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
import { paginationActions } from "$lib/stores/inbox.pagination.actions";
import { agentActions } from "$lib/stores/inbox.agents.store";
import { loadInboxWithPagination } from "$lib/stores/inbox.init";
import { toggleAI, pauseAI, resumeAI } from "$lib/services/ai.service";
import { paginationSummary } from "$lib/stores/inbox.pagination.store";
import {
    tabsActions,
    activeConversations,
} from "$lib/stores/conversations-tabs.store";

export function createConversationHandlers(getToken: () => string) {
    async function selectConversation(id: string | null) {
        console.log("[selectConversation] Called with id:", id);
        const token = getToken();
        if (!token) {
            console.log("[selectConversation] No token, returning");
            return;
        }

        if (!id) {
            console.log("[selectConversation] Clearing selection");
            inboxActions.selectConversation(null);
            return;
        }

        // Find the conversation to get its details
        // 1. Try filtered list (current view)
        let conversation = get(filteredConversations).find((c) => c.id === id);

        // 2. Try unfiltered list (in case it's hidden by filters)
        if (!conversation) {
            conversation = get(conversations).find((c) => c.id === id);
        }

        // 3. Try active tabs (in case it's minimized/closed but in tabs history)
        if (!conversation) {
            const activeTab = get(activeConversations).find(c => c.id === id);
            if (activeTab) {
                // Reconstruct minimal conversation object from tab data
                conversation = {
                    id: activeTab.id,
                    lead_id: activeTab.leadId,
                    contact_name: activeTab.contactName,
                    contact_avatar: activeTab.contactAvatar,
                    // Add other required fields with defaults or placeholders if necessary
                    // For loadConversation, we mainly need lead_id
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
        await messagingActions.loadConversation(token, conversation.lead_id, {
            name: conversation.contact_name,
            avatar: conversation.contact_avatar,
        });

        // Mark as read using conversation id
        inboxActions.markAsRead(id);
    }

    async function minimizeConversation() {
        const conversation = get(currentConversation);
        if (!conversation) return;

        console.log("[minimizeConversation] Minimizing:", conversation.id);
        tabsActions.minimizeConversation(conversation.id);
        messagingActions.clearConversation(); // Clear the messaging console UI
        // Don't clear inbox selection - keep list visible for selecting another conversation
    }

    async function closeConversationTab(id: string) {
        console.log("[closeConversationTab] Closing:", id);
        const currentConv = get(currentConversation);

        // Close in tabs system
        tabsActions.closeConversation(id);

        // If it's the current conversation, clear messaging state
        if (currentConv?.id === id) {
            messagingActions.clearConversation();
            inboxActions.selectConversation(null);
        }
    }

    async function changeTab(tab: "all" | "mine" | "unassigned") {
        const token = getToken();
        if (!token) return;
        await loadInboxWithPagination(token, tab);
    }

    async function goToPage(page: number) {
        const token = getToken();
        if (!token) return;
        const currentPagination = get(paginationSummary);
        if (currentPagination?.page === page) return;
        await paginationActions.loadPage(token, page);
    }

    async function sendMessage(msg: string) {
        const token = getToken();
        if (!token || !msg.trim()) return;
        try {
            await messagingActions.sendTextMessage(token, msg);
        } catch (err) {
            console.error("Send failed:", err);
            throw err;
        }
    }

    async function sendFile(file: File) {
        const token = getToken();
        if (!token) return;
        try {
            await messagingActions.sendFileMessage(token, file);
        } catch (err) {
            console.error("File send failed:", err);
        }
    }

    async function sendAudio(file: File) {
        const token = getToken();
        if (!token) return;
        try {
            await messagingActions.sendAudioMessage(token, file);
        } catch (err) {
            console.error("Audio send failed:", err);
        }
    }

    async function handleAIToggle(enabled: boolean, reason?: string) {
        const token = getToken();
        const conversation = get(currentConversation);
        if (!token || !conversation?.lead) return;
        try {
            await toggleAI(token, conversation.lead.id, enabled, reason);
            // Reload conversation to get updated AI status
            await messagingActions.loadConversation(token, conversation.id);
        } catch (err) {
            console.error("AI toggle failed:", err);
        }
    }

    async function handleAIPause(reason: string) {
        const token = getToken();
        const conversation = get(currentConversation);
        if (!token || !conversation?.lead) return;
        try {
            await pauseAI(token, conversation.lead.id, reason);
            await messagingActions.loadConversation(token, conversation.id);
        } catch (err) {
            console.error("AI pause failed:", err);
        }
    }

    async function handleAIResume() {
        const token = getToken();
        const conversation = get(currentConversation);
        if (!token || !conversation?.lead) return;
        try {
            await resumeAI(token, conversation.lead.id);
            await messagingActions.loadConversation(token, conversation.id);
        } catch (err) {
            console.error("AI resume failed:", err);
        }
    }

    function handleAssignAgent(agentId: string) {
        const token = getToken();
        const conversation = get(currentConversation);
        if (!conversation || !token) return;

        // Use the actual lead ID from the lead object if available, otherwise fallback
        const targetLeadId = conversation.lead?.id || conversation.lead_id;

        agentActions.assignAgent(
            token,
            conversation.id,
            targetLeadId,
            agentId,
        );
    }

    function formatTime(timestamp: string): string {
        const date = new Date(timestamp);
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
        formatTime,
    };
}
