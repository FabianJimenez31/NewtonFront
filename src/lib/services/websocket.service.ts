/**
 * WebSocket Service - Newton CRM
 * Manages real-time WebSocket connections per lead/conversation
 *
 * Endpoint: wss://crm.inewton.ai/ws/{tenant_id}/{lead_id}?token=JWT
 */

import { writable, type Writable } from "svelte/store";

export type ConnectionStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "error";

export interface WebSocketMessage {
  type: string;
  content?: string;
  message?: Record<string, unknown>;
  lead_id?: string;
  message_id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface WebSocketCallbacks {
  onNewMessage?: (data: WebSocketMessage) => void;
  onMessageStatus?: (messageId: string, status: string) => void;
  onMessageSent?: (data: WebSocketMessage) => void;
  onError?: (error: string) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private currentLeadId: string | null = null;
  private currentTenantId: string | null = null;
  private currentToken: string | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private callbacks: WebSocketCallbacks = {};

  public connectionStatus: Writable<ConnectionStatus> =
    writable("disconnected");
  public lastError: Writable<string | null> = writable(null);

  constructor() {
    console.log("[WebSocketService] Service instantiated");
  }

  /**
   * Set callbacks for message handling
   */
  public setCallbacks(callbacks: WebSocketCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Connect to a specific lead's WebSocket channel
   */
  public connect(tenantId: string, leadId: string, token: string): void {
    if (typeof window === "undefined") return;

    if (!tenantId || !leadId || !token) {
      console.error("[WebSocket] Missing connection parameters");
      this.connectionStatus.set("error");
      this.lastError.set("Parámetros de conexión faltantes");
      return;
    }

    if (
      this.ws &&
      this.ws.readyState === WebSocket.OPEN &&
      this.currentLeadId === leadId
    ) {
      console.log("[WebSocket] Already connected to lead:", leadId);
      return;
    }

    if (this.ws) {
      console.log(
        "[WebSocket] Disconnecting from previous lead:",
        this.currentLeadId,
      );
      this.disconnect();
    }

    this.currentLeadId = leadId;
    this.currentTenantId = tenantId;
    this.currentToken = token;
    this.connectionStatus.set("connecting");
    this.lastError.set(null);

    const wsUrl = `wss://crm.inewton.ai/ws/${tenantId}/${leadId}?token=${token}`;
    console.log(`[WebSocket] Connecting to lead ${leadId}...`);

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (e) {
      console.error("[WebSocket] Connection error:", e);
      this.connectionStatus.set("error");
      this.lastError.set("Error al conectar");
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("[WebSocket] ✅ Connected to lead:", this.currentLeadId);
      this.connectionStatus.set("connected");
      this.lastError.set(null);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        console.log("[WebSocket] 📨 Message received:", event.data);
        const data = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(data);
      } catch (e) {
        console.error("[WebSocket] Error parsing message:", e);
      }
    };

    this.ws.onclose = (event) => {
      console.log("[WebSocket] Connection closed:", event.code, event.reason);
      this.connectionStatus.set("disconnected");
      this.stopHeartbeat();

      if (this.currentLeadId && event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error("[WebSocket] Error:", error);
      this.connectionStatus.set("error");
      this.lastError.set("Error de conexión");
    };
  }

  private handleMessage(data: WebSocketMessage): void {
    console.log("[WebSocket] Processing message type:", data.type);

    switch (data.type) {
      case "pong":
        break;

      case "connection_established":
        console.log("[WebSocket] Connection confirmed by server");
        break;

      case "new_message":
        if (this.callbacks.onNewMessage) {
          this.callbacks.onNewMessage(data);
        }
        break;

      case "message_sent":
        console.log("[WebSocket] Message sent confirmation:", data);
        if (this.callbacks.onMessageSent) {
          this.callbacks.onMessageSent(data);
        }
        break;

      case "message_status":
        if (data.message_id && data.status && this.callbacks.onMessageStatus) {
          this.callbacks.onMessageStatus(data.message_id, data.status);
        }
        break;

      case "error":
        const errorMsg = String(data.message || "Error del servidor");
        console.error("[WebSocket] Server error:", errorMsg);
        this.lastError.set(errorMsg);
        if (this.callbacks.onError) {
          this.callbacks.onError(errorMsg);
        }
        break;

      default:
        console.log("[WebSocket] Unknown message type:", data.type, data);
    }
  }

  public sendMessage(content: string): boolean {
    if (!this.isConnected()) {
      console.error("[WebSocket] Cannot send: not connected");
      return false;
    }

    const payload = { type: "send_message", content, message_type: "text" };
    console.log("[WebSocket] Payload:", JSON.stringify(payload));
    console.log(
      "[WebSocket] Sending message:",
      content.substring(0, 50) + "...",
    );
    this.ws!.send(JSON.stringify(payload));
    return true;
  }

  public sendAudioMessage(
    audioBase64: string,
    mimeType: string = "audio/ogg",
  ): boolean {
    if (!this.isConnected()) {
      console.error("[WebSocket] Cannot send audio: not connected");
      return false;
    }

    const payload = {
      type: "send_audio_message",
      audio: audioBase64,
      mime_type: mimeType,
    };
    console.log("[WebSocket] Sending audio message");
    this.ws!.send(JSON.stringify(payload));
    return true;
  }

  public sendMediaMessage(
    mediaUrl: string,
    mediaType: string,
    caption?: string,
  ): boolean {
    if (!this.isConnected()) {
      console.error("[WebSocket] Cannot send media: not connected");
      return false;
    }

    const payload = {
      type: "send_media_message",
      media_url: mediaUrl,
      media_type: mediaType,
      caption,
    };
    console.log("[WebSocket] Sending media message:", mediaType);
    this.ws!.send(JSON.stringify(payload));
    return true;
  }

  public requestHistory(limit: number = 50): void {
    if (!this.isConnected()) {
      console.error("[WebSocket] Cannot request history: not connected");
      return;
    }

    const payload = { type: "request_history", limit };
    console.log("[WebSocket] Requesting history");
    this.ws!.send(JSON.stringify(payload));
  }

  public disconnect(): void {
    console.log("[WebSocket] Disconnecting...");
    this.stopHeartbeat();
    this.clearReconnect();

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.currentLeadId = null;
    this.currentTenantId = null;
    this.currentToken = null;
    this.reconnectAttempts = 0;
    this.connectionStatus.set("disconnected");
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public getCurrentLeadId(): string | null {
    return this.currentLeadId;
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
    if (this.reconnectTimeout || !this.currentLeadId) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[WebSocket] Max reconnect attempts reached");
      this.lastError.set("No se pudo reconectar");
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`,
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.reconnectAttempts++;
      if (this.currentLeadId && this.currentTenantId && this.currentToken) {
        this.connect(
          this.currentTenantId,
          this.currentLeadId,
          this.currentToken,
        );
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

export const webSocketService = new WebSocketService();
