/**
 * Messaging Actions - Newton CRM
 * Actions for messaging store
 */

import { get } from "svelte/store";
import {
    getConversation,
    sendMessage,
    sendAudio,
    sendFile,
    pollMessages,
} from "$lib/services/conversations.service";
import { getLead } from "$lib/services/leads.service";
import { agents } from "./inbox.agents.store";
import {
    currentConversation,
    messages,
    isLoadingMessages,
    isSending,
    error,
} from "./messaging.state";
import type { Message } from "$lib/types/inbox.types";

// Polling state
let pollingInterval: number | null = null;
let currentToken: string | null = null;

/**
 * Load conversation with messages
 * Uses data from inbox store if available (messages are already there)
 */
export async function loadConversation(
    token: string,
    id: string,
    knownContactInfo?: { name?: string; avatar?: string },
) {
    console.log("[MESSAGING] loadConversation called for ID:", id);
    isLoadingMessages.set(true);
    error.set(null);

    try {
        console.log("[MESSAGING] Fetching full conversation history from API");

        // Fetch conversation and lead info in parallel
        const [conversation, lead] = await Promise.all([
            getConversation(token, id),
            getLead(token, id).catch((e) => {
                console.warn("[MESSAGING] Failed to fetch lead info:", e);
                return null;
            }),
        ]);

        // Merge lead info if available
        if (lead) {
            conversation.lead = lead;

            // Sync contact details from lead if available
            if (
                lead.name &&
                (!conversation.contact_name ||
                    conversation.contact_name === "Sin nombre")
            ) {
                conversation.contact_name = lead.name;
            }
            if (lead.email) conversation.contact_email = lead.email;
            if (lead.phone) conversation.contact_phone = lead.phone;

            // Sync metadata
            if (lead.country) {
                conversation.metadata = {
                    ...conversation.metadata,
                    country: lead.country,
                };
            }
            if (lead.language) {
                conversation.metadata = {
                    ...conversation.metadata,
                    language: lead.language,
                };
            }

            conversation.assigned_agent_id =
                lead.assigned_agent_id || (lead.assigned_agent as any)?.id;
            // If lead has the full agent object, use it
            if (lead.assigned_agent) {
                conversation.assigned_agent = lead.assigned_agent;
            }
        }

        // If we still have "Sin nombre" but we have known info from the list, use that
        if (
            knownContactInfo?.name &&
            (!conversation.contact_name ||
                conversation.contact_name === "Sin nombre")
        ) {
            console.log(
                "[MESSAGING] Using known contact name from list:",
                knownContactInfo.name,
            );
            conversation.contact_name = knownContactInfo.name;
        }

        // Also sync avatar if missing
        if (!conversation.contact_avatar && knownContactInfo?.avatar) {
            conversation.contact_avatar = knownContactInfo.avatar;
        }

        // Enrich with agent info if missing but ID is present
        if (!conversation.assigned_agent && conversation.assigned_agent_id) {
            const loadedAgents = get(agents);
            const foundAgent = loadedAgents.find(
                (a) => a.id === conversation.assigned_agent_id,
            );
            if (foundAgent) {
                conversation.assigned_agent = foundAgent;
            }
        }

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
}

/**
 * Send text message
 */
export async function sendTextMessage(token: string, content: string) {
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
}

/**
 * Send audio message
 */
export async function sendAudioMessage(token: string, audioFile: File) {
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
}

/**
 * Send file attachment
 */
export async function sendFileMessage(token: string, file: File) {
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
}

/**
 * Start polling for new messages
 */
export function startPolling(token: string, intervalMs: number = 5000) {
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
}

/**
 * Stop polling for messages
 */
export function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        currentToken = null;
        console.log("[MESSAGING] Stopped polling for messages");
    }
}

/**
 * Clear current conversation
 */
export function clearConversation() {
    currentConversation.set(null);
    messages.set([]);
    stopPolling();
}

/**
 * Add a message to the current conversation
 */
export function addMessage(message: Message) {
    messages.update((msgs) => [...msgs, message]);
}

/**
 * Update a message in the current conversation
 */
export function updateMessage(messageId: string, updates: Partial<Message>) {
    messages.update((msgs) =>
        msgs.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
    );
}

/**
 * Mark all messages as read
 */
export function markAllAsRead() {
    messages.update((msgs) => msgs.map((m) => ({ ...m, read: true })));
}
