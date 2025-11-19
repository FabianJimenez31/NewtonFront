/**
 * Conversations Inbox Service - Newton CRM
 * Handles inbox operations with pagination metadata
 * API Base: https://crm.inewton.ai/api/v1/conversations
 */

import type {
  ConversationDetail,
  InboxParams,
  InboxResponse,
} from "$lib/types/inbox.types";
import {
  API_BASE_URL,
  authenticatedFetchJSON,
  buildURL,
  handleApiError,
} from "./api.utils";
import { mapApiConversationDetail } from "./conversations.mappers";

const CONVERSATIONS_BASE = `${API_BASE_URL}/conversations`;

/**
 * Get conversations inbox with pagination metadata
 * @endpoint GET /api/v1/conversations/inbox
 */
export async function getInbox(
  token: string,
  params: InboxParams = {},
): Promise<InboxResponse> {
  try {
    const url = buildURL(`${CONVERSATIONS_BASE}/inbox`, params);
    const response = await authenticatedFetchJSON<any>(url, token, {
      timeout: 30000,
    });

    // Handle response with metadata (new format)
    if (Array.isArray(response?.conversations)) {
      const conversations = response.conversations.map(
        mapApiConversationDetail,
      );

      const total =
        response.total ?? response.meta?.total ?? conversations.length;
      const page = response.page ?? response.meta?.page ?? params.page ?? 1;
      const pages =
        response.pages ??
        response.meta?.pages ??
        (params.limit ? Math.max(1, Math.ceil(total / params.limit)) : 1);
      const hasMoreFlag =
        response.has_more ??
        response.hasMore ??
        response.meta?.has_more ??
        response.meta?.hasMore ??
        page < pages;
      const statusCounts =
        response.status_counts ?? response.meta?.status_counts;
      const stageCounts = response.stage_counts ?? response.meta?.stage_counts;

      console.log(
        `[INBOX] Loaded ${conversations.length} conversations (page ${page}/${pages}, has_more: ${hasMoreFlag})`,
      );

      return {
        conversations,
        total,
        page,
        pages,
        has_more: Boolean(hasMoreFlag),
        status_counts: statusCounts,
        stage_counts: stageCounts,
      };
    }

    // Fallback for old format (array only)
    let rawConversations: any[] = [];
    if (Array.isArray(response)) {
      rawConversations = response;
    } else if (response?.data) {
      rawConversations = response.data;
    }

    const conversations = rawConversations.map(mapApiConversationDetail);
    const total = conversations.length;
    const limit = params.limit ?? total;
    const pages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
    const hasMoreFlag = limit > 0 && total === limit;

    console.log(
      `[INBOX] Loaded ${conversations.length} conversations (legacy format)`,
    );

    return {
      conversations,
      total,
      page: params.page || 1,
      pages,
      has_more: hasMoreFlag,
      status_counts: undefined,
    };
  } catch (error) {
    console.error("[INBOX] Error:", error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Get priority inbox (high priority conversations) with pagination metadata
 * @endpoint GET /api/v1/conversations/priority-inbox
 */
export async function getPriorityInbox(
  token: string,
  params: InboxParams = {},
): Promise<InboxResponse> {
  try {
    const url = buildURL(`${CONVERSATIONS_BASE}/priority-inbox`, params);
    const response = await authenticatedFetchJSON<any>(url, token, {
      timeout: 30000,
    });

    // Handle response with metadata (new format)
    if (Array.isArray(response?.conversations)) {
      const conversations = response.conversations.map(
        mapApiConversationDetail,
      );

      const total =
        response.total ?? response.meta?.total ?? conversations.length;
      const page = response.page ?? response.meta?.page ?? params.page ?? 1;
      const pages =
        response.pages ??
        response.meta?.pages ??
        (params.limit ? Math.max(1, Math.ceil(total / params.limit)) : 1);
      const hasMoreFlag =
        response.has_more ??
        response.hasMore ??
        response.meta?.has_more ??
        response.meta?.hasMore ??
        page < pages;
      const statusCounts =
        response.status_counts ?? response.meta?.status_counts;
      const stageCounts = response.stage_counts ?? response.meta?.stage_counts;

      console.log(
        `[PRIORITY-INBOX] Loaded ${conversations.length} conversations (page ${page}/${pages}, has_more: ${hasMoreFlag})`,
      );

      return {
        conversations,
        total,
        page,
        pages,
        has_more: Boolean(hasMoreFlag),
        status_counts: statusCounts,
        stage_counts: stageCounts,
      };
    }

    // Fallback for old format
    let rawConversations: any[] = [];
    if (Array.isArray(response)) {
      rawConversations = response;
    } else if (response?.data) {
      rawConversations = response.data;
    }

    const conversations = rawConversations.map(mapApiConversationDetail);
    const total = conversations.length;
    const limit = params.limit ?? total;
    const pages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
    const hasMoreFlag = limit > 0 && total === limit;

    console.log(
      `[PRIORITY-INBOX] Loaded ${conversations.length} conversations (legacy format)`,
    );

    return {
      conversations,
      total,
      page: params.page || 1,
      pages,
      has_more: hasMoreFlag,
      status_counts: undefined,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
