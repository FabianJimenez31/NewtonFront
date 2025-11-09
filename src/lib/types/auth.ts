/**
 * Auth Types - Newton CRM
 * Types for authentication system based on API at https://crm.inewton.ai/api/docs
 */

// Login Request (Legacy - con tenant_id)
export interface LoginRequest {
	email: string;
	password: string;
	tenant_id: string;
}

// Multi-Tenant Login Request (Nuevo - sin tenant_id)
export interface LoginMultiTenantRequest {
	email: string;
	password: string;
}

// Tenant Information
export interface TenantInfo {
	tenant_id: string;
	tenant_name: string;
	role: string;
}

// User Data
export interface User {
	id: string;
	email: string;
	name: string;
	tenant_id: string;
	role?: string;
	created_at?: string;
	updated_at?: string;
}

// User Basic Info (sin tenant)
export interface UserBasicInfo {
	id: string;
	email: string;
	name: string;
}

// Login Response
export interface LoginResponse {
	access_token: string;
	token_type: string;
	user: User;
}

// Multi-Tenant Login Response (con temp_token y lista de tenants)
export interface LoginMultiTenantResponse {
	temp_token: string;
	user: UserBasicInfo;
	tenants: TenantInfo[];
}

// Select Tenant Request
export interface SelectTenantRequest {
	tenant_id: string;
}

// Switch Tenant Request
export interface SwitchTenantRequest {
	tenant_id: string;
}

// Auth Store State
export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	// Multi-tenant state
	tempToken: string | null;
	availableTenants: TenantInfo[];
	needsTenantSelection: boolean;
}

// WhatsApp Login Request
export interface WhatsAppLoginRequest {
	email: string;
	tenant: string;
}

// WhatsApp Code Validation Request
export interface WhatsAppCodeValidationRequest {
	code: string;
	code_id: string;
}

// Register Request
export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
	tenant_id: string;
}

// API Error Response
export interface ApiError {
	detail: string;
	status_code?: number;
}
