/**
 * Notifications WebSocket Service - Newton CRM
 * Global notifications for inbox updates
 *
 * Endpoint: wss://crm.inewton.ai/ws/notifications/{tenant_id}?token=JWT
 */

import { writable, type Writable } from "svelte/store";

export type NotificationStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "error";

export interface NotificationMessage {
  type: string;
  tenant_id?: string;
  lead_id?: string;
  lead_name?: string;
  message_preview?: string;
  phone?: string;
  changes?: Record<string, unknown>;
  timestamp?: string;
  [key: string]: unknown;
}

export interface NotificationCallbacks {
  onNewMessage?: (data: NotificationMessage) => void;
  onNewConversation?: (data: NotificationMessage) => void;
  onConversationUpdated?: (data: NotificationMessage) => void;
  onError?: (error: string) => void;
}

class NotificationsWebSocketService {
  private ws: WebSocket | null = null;
  private tenantId: string | null = null;
  private token: string | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private callbacks: NotificationCallbacks = {};

  public connectionStatus: Writable<NotificationStatus> =
    writable("disconnected");
  public lastError: Writable<string | null> = writable(null);

  constructor() {
    console.log("[NotificationsWS] Service instantiated");
  }

  /**
   * Set callbacks for notification handling
   */
  public setCallbacks(callbacks: NotificationCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Connect to notifications channel
   */
  public connect(tenantId: string, token: string): void {
    if (typeof window === "undefined") return;

    if (!tenantId || !token) {
      console.error("[NotificationsWS] Missing connection parameters");
      this.connectionStatus.set("error");
      this.lastError.set("Parámetros de conexión faltantes");
      return;
    }

    if (
      this.ws &&
      this.ws.readyState === WebSocket.OPEN &&
      this.tenantId === tenantId
    ) {
      console.log("[NotificationsWS] Already connected");
      return;
    }

    if (this.ws) {
      console.log("[NotificationsWS] Disconnecting from previous tenant");
      this.disconnect();
    }

    this.tenantId = tenantId;
    this.token = token;
    this.connectionStatus.set("connecting");
    this.lastError.set(null);

    const wsUrl = `wss://crm.inewton.ai/ws/notifications/${tenantId}?token=${token}`;
    console.log(`[NotificationsWS] Connecting to tenant ${tenantId}...`);

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (e) {
      console.error("[NotificationsWS] Connection error:", e);
      this.connectionStatus.set("error");
      this.lastError.set("Error al conectar");
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("[NotificationsWS] ✅ Connected to notifications");
      this.connectionStatus.set("connected");
      this.lastError.set(null);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        console.log("[NotificationsWS] 📨 Notification received:", event.data);
        const data = JSON.parse(event.data) as NotificationMessage;
        this.handleMessage(data);
      } catch (e) {
        console.error("[NotificationsWS] Error parsing message:", e);
      }
    };

    this.ws.onclose = (event) => {
      console.log(
        "[NotificationsWS] Connection closed:",
        event.code,
        event.reason,
      );
      this.connectionStatus.set("disconnected");
      this.stopHeartbeat();

      if (this.tenantId && event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error("[NotificationsWS] Error:", error);
      this.connectionStatus.set("error");
      this.lastError.set("Error de conexión");
    };
  }

  private handleMessage(data: NotificationMessage): void {
    console.log("[NotificationsWS] Processing notification type:", data.type);

    switch (data.type) {
      case "pong":
        break;

      case "connection_established":
        console.log("[NotificationsWS] Connection confirmed by server");
        break;

      case "new_message":
        if (this.callbacks.onNewMessage) {
          this.callbacks.onNewMessage(data);
        }
        break;

      case "new_conversation":
        if (this.callbacks.onNewConversation) {
          this.callbacks.onNewConversation(data);
        }
        break;

      case "conversation_updated":
        if (this.callbacks.onConversationUpdated) {
          this.callbacks.onConversationUpdated(data);
        }
        break;

      case "error":
        const errorMsg = String(data.error || "Error del servidor");
        console.error("[NotificationsWS] Server error:", errorMsg);
        this.lastError.set(errorMsg);
        if (this.callbacks.onError) {
          this.callbacks.onError(errorMsg);
        }
        break;

      default:
        console.log(
          "[NotificationsWS] Unknown notification type:",
          data.type,
          data,
        );
    }
  }

  public disconnect(): void {
    console.log("[NotificationsWS] Disconnecting...");
    this.stopHeartbeat();
    this.clearReconnect();

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.tenantId = null;
    this.token = null;
    this.reconnectAttempts = 0;
    this.connectionStatus.set("disconnected");
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.ws!.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout || !this.tenantId) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[NotificationsWS] Max reconnect attempts reached");
      this.lastError.set("No se pudo reconectar");
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(
      `[NotificationsWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`,
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.reconnectAttempts++;
      if (this.tenantId && this.token) {
        this.connect(this.tenantId, this.token);
      }
    }, delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

export const notificationsWS = new NotificationsWebSocketService();
