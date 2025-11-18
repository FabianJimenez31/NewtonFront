/**
 * Conversations Media Service - Newton CRM
 * Handles media uploads and attachments for conversations
 * API Base: https://crm.inewton.ai/api/v1/conversations
 */

import type { Message } from "$lib/types/inbox.types";
import { API_BASE_URL, handleApiError } from "./api.utils";

const CONVERSATIONS_BASE = `${API_BASE_URL}/conversations`;

/**
 * Send audio message
 * @endpoint POST /api/v1/conversations/send-audio
 */
export async function sendAudio(
    token: string,
    conversationId: string,
    audioFile: File,
): Promise<Message> {
    const formData = new FormData();
    formData.append("conversation_id", conversationId);
    formData.append("audio", audioFile);

    try {
        const response = await fetch(`${CONVERSATIONS_BASE}/send-audio`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                // Don't set Content-Type - let browser set it with boundary for FormData
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw error;
        }

        return await response.json();
    } catch (error) {
        throw new Error(handleApiError(error));
    }
}

/**
 * Send file attachment
 * @endpoint POST /api/v1/conversations/send-file
 */
export async function sendFile(
    token: string,
    conversationId: string,
    file: File,
): Promise<Message> {
    const formData = new FormData();
    formData.append("conversation_id", conversationId);
    formData.append("file", file);

    try {
        const response = await fetch(`${CONVERSATIONS_BASE}/send-file`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw error;
        }

        return await response.json();
    } catch (error) {
        throw new Error(handleApiError(error));
    }
}
