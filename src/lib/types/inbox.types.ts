/**
 * Inbox Types - Newton CRM
 * TypeScript interfaces for conversations and messaging
 */

// ==================== CHANNEL & PRIORITY ====================

export type Channel =
  | "whatsapp"
  | "email"
  | "sms"
  | "web"
  | "instagram"
  | "facebook";
export type Priority = "high" | "medium" | "low";
export type MessageSender = "agent" | "contact" | "system" | "ai";
export type MessageType =
  | "text"
  | "audio"
  | "file"
  | "image"
  | "video"
  | "event";
export type InboxTab = "all" | "mine" | "unassigned";
export type ConversationStatus = "open" | "closed" | "snoozed";

// ==================== AGENT ====================

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  is_online?: boolean;
}

// ==================== CONVERSATION ====================

export interface Conversation {
  id: string;
  lead_id: string;
  contact_name: string;
  contact_email?: string;
  contact_phone: string;
  contact_avatar?: string;
  last_message: string;
  last_message_time: string;
  last_message_sender: MessageSender;
  unread_count: number;
  status: ConversationStatus;
  assigned_agent?: Agent;
  assigned_agent_id?: string;
  channel: Channel;
  priority?: Priority;
  stage?: string;
  stage_id?: string;
  score?: number;
  tags?: string[];
  metadata?: ConversationMetadata;
}

export interface ConversationMetadata {
  country?: string;
  language?: string;
  timezone?: string;
  source?: string;
  custom_fields?: Record<string, any>;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
  lead?: LeadDetail;
}

// ==================== MESSAGE ====================

export interface Message {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  sender_id?: string;
  sender_name?: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: MessageType;
  metadata?: MessageMetadata;
  internal?: boolean; // Internal notes (agent to agent)
}

export interface MessageMetadata {
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  audio_duration?: number;
  image_width?: number;
  image_height?: number;
  video_duration?: number;
  thumbnail_url?: string;
  delivery_status?: "sent" | "delivered" | "read" | "failed";
  error_message?: string;
}

// ==================== LEAD DETAIL ====================

export interface LeadDetail {
  id: string;
  name: string;
  phone: string;
  email?: string;
  country?: string;
  language?: string;
  stage: string;
  stage_id: string;
  score: number;
  priority: Priority;
  assigned_agent?: Agent;
  assigned_agent_id?: string;
  created_at: string;
  updated_at: string;
  last_contact: string;
  messages: Message[];
  ai_enabled: boolean;
  ai_paused_reason?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

// ==================== FILTERS & PARAMS ====================

export interface InboxFilters {
  search?: string;
  status?: ConversationStatus | ConversationStatus[];
  priority?: Priority | Priority[];
  agent?: string | string[];
  stage?: string | string[];
  tags?: string[];
  channel?: Channel | Channel[];
  start_date?: string; // Format: YYYY-MM-DD
  end_date?: string; // Format: YYYY-MM-DD
}

export interface InboxParams extends InboxFilters {
  page?: number;
  limit?: number;
}

// ==================== AI STATUS ====================

export interface AIStatus {
  lead_id: string;
  ai_enabled: boolean;
  ai_paused: boolean;
  pause_reason?: string;
  last_ai_message?: string;
  last_ai_message_time?: string;
}

// ==================== API RESPONSES ====================

export interface InboxResponse {
  conversations: ConversationDetail[];
  total: number;
  page: number;
  pages: number;
  has_more: boolean;
  status_counts?: {
    pending: number;
    unattended: number;
    attended: number;
    all: number;
  };
  stage_counts?: Record<string, number>; // Dynamic stage counts from backend
}

export interface SendMessageResponse {
  message: Message;
  conversation: Conversation;
}

export interface PollMessagesResponse {
  messages: Message[];
  conversations_updated: string[];
}

export interface PollingStatus {
  active: boolean;
  last_poll: string;
  pending_messages: number;
}

// ==================== API ERROR ====================

export interface ApiError {
  detail: string;
  status_code?: number;
  error_type?: string;
}
