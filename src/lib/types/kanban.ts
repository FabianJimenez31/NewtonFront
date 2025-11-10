/**
 * Kanban and Pipeline TypeScript Interfaces
 * Based on Newton CRM API v1
 */

/**
 * Stage entity - represents a column in the kanban board
 */
export interface Stage {
  id: string;
  name: string;
  color: string; // Hex format #RRGGBB
  icon?: string; // FontAwesome icon name (optional)
  order: number; // Display order (0, 1, 2...)
  is_visible: boolean;
  is_active: boolean;
  allowed_transitions?: string[]; // Array of stage IDs this stage can transition to
  auto_score?: number; // Automatic score assignment (0-100)
  tenant_id: string;
  created_at?: string; // ISO datetime
  updated_at?: string; // ISO datetime
}

/**
 * Lead/Card data for kanban board
 */
export interface LeadKanban {
  id: string;
  name: string; // Contact name
  phone: string;
  email?: string;
  stage: string; // Current stage ID or name
  last_message?: string;
  last_interaction?: string; // ISO datetime
  unread_count?: number;
  priority?: string; // e.g., 'alta', 'media', 'baja'
  score?: number; // Lead score (0-100)
  assigned_agent_id?: string;
  assigned_agent_name?: string;
  ai_automation_enabled?: boolean;
  automation_status?: string;
  tenant_id?: string;

  // Global fields for comprehensive lead view
  channel?:
    | "whatsapp"
    | "web"
    | "telegram"
    | "instagram"
    | "email"
    | "facebook"
    | "sms"; // Communication channel
  country_code?: string; // ISO 3166-1 alpha-2 code (e.g., 'US', 'MX', 'BR')
  language?: string; // ISO 639-1 code (e.g., 'en', 'es', 'pt')
  currency?: string; // ISO 4217 code (e.g., 'USD', 'MXN', 'BRL')
  deal_value?: number; // Monetary value of the potential deal
  external_id?: string; // ID from external integration systems
  integration_source?: string; // Source system name (e.g., 'salesforce', 'hubspot')
  last_agent_id?: string; // ID of the last agent who interacted (different from assigned)
  last_agent_name?: string; // Name of the last agent who interacted
  sla_status?: "on_time" | "warning" | "overdue" | "no_sla"; // SLA compliance status
  last_channel_at?: string; // ISO datetime of last channel interaction
  tags?: string[]; // Array of categorical tags for the lead
}

/**
 * Minimal information about the user returned with the board response
 */
export interface BoardUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role?: string;
  phone?: string | null;
  tenant_id?: string;
  can_move_cards?: boolean;
  is_active?: boolean;
  [key: string]: unknown;
}

/**
 * Board data - response from GET /api/v1/kanban/board
 * Groups leads by stage
 */
export interface BoardData {
  stages: Record<string, LeadKanban[]>; // stage_id -> array of leads
  configuration?: KanbanConfig | null;
  user?: BoardUser | null;
}

/**
 * Kanban configuration - tenant-specific pipeline setup
 */
export interface KanbanConfig {
  id: string;
  tenant_id: string;
  stages: Stage[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Stage creation request - POST /api/v1/kanban/stages
 */
export interface StageCreate {
  id: string; // Required, unique stage identifier
  name: string; // Required, 3-50 characters
  display_name: string; // Required, display name for UI
  stage_type: "initial" | "progress" | "success" | "failure" | "waiting"; // Required stage type
  base_score: number; // Required, base score 0-100
  color: string; // Required, hex format #RRGGBB
  icon?: string; // Optional FontAwesome icon
  order: number; // Required, integer >= 0
  is_visible?: boolean; // Default: true
  is_active?: boolean; // Default: true
  allowed_transitions?: string[]; // Optional, stage IDs
  auto_score?: number; // Optional, 0-100
}

/**
 * Stage update request - PUT /api/v1/kanban/stages/{stage_id}
 */
export interface StageUpdate {
  name?: string;
  color?: string;
  icon?: string;
  order?: number;
  is_visible?: boolean;
  is_active?: boolean;
  allowed_transitions?: string[];
  auto_score?: number;
}

/**
 * Transition validation request - POST /api/v1/kanban/validate-transition
 */
export interface TransitionValidationRequest {
  lead_id: string;
  from_stage: string;
  to_stage: string;
}

/**
 * Transition validation response
 */
export interface TransitionValidationResponse {
  is_valid: boolean;
  message?: string;
  reason?: string;
}

/**
 * Lead move request - PATCH /api/v1/leads/{lead_id}/move
 */
export interface LeadMoveRequest {
  stage: string; // Target stage ID or name
  notes?: string; // Optional justification
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

/**
 * Error response from API
 */
export interface ApiError {
  detail: string;
  status_code?: number;
}

/**
 * Kanban filters for board view
 */
export interface KanbanFilters {
  days?: number; // Recent days filter
  start_date?: string; // Format: YYYY-MM-DD
  end_date?: string; // Format: YYYY-MM-DD
  assigned_agent_id?: string;
  priority?: string;
  min_score?: number; // 0-100
}
