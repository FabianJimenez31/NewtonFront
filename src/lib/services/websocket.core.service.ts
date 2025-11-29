/**
 * WebSocket Core Service - Newton CRM
 * Core WebSocket management (connection, reconnection, heartbeat)
 */

import { writable, type Writable } from "svelte/store";
import * as mediaService from "./websocket.media.service";

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

class WebSocketCoreService {
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

  public setCallbacks(callbacks: WebSocketCallbacks): void {
    this.callbacks = callbacks;
  }

  public connect(tenantId: string, leadId: string, token: string): void {
    if (typeof window === "undefined") return;

    if (!tenantId || !leadId || !token) {
      console.error("[WebSocket] Missing connection parameters");
      this.connectionStatus.set("error");
      this.lastError.set("Parámetros de conexión faltantes");
      return;
    }

    if (
      this.ws?.readyState === WebSocket.OPEN &&
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
        const data = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(data);
      } catch (e) {
        console.error("[WebSocket] Error parsing message:", e);
      }
    };

    this.ws.onclose = (event) => {
      console.log("[WebSocket] Connection closed:", event.code);
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
    switch (data.type) {
      case "pong":
      case "connection_established":
        break;
      case "new_message":
        this.callbacks.onNewMessage?.(data);
        break;
      case "message_sent":
        this.callbacks.onMessageSent?.(data);
        break;
      case "message_status":
        if (data.message_id && data.status) {
          this.callbacks.onMessageStatus?.(data.message_id, data.status);
        }
        break;
      case "error":
        const errorMsg = String(data.message || "Error del servidor");
        console.error("[WebSocket] Server error:", errorMsg);
        this.lastError.set(errorMsg);
        this.callbacks.onError?.(errorMsg);
        break;
    }
  }

  public sendMessage(content: string): boolean {
    if (!this.isConnected()) return false;
    this.ws!.send(
      JSON.stringify({ type: "send_message", content, message_type: "text" }),
    );
    return true;
  }

  public sendAudioMessage(audioBase64: string, duration?: number): boolean {
    if (!this.ws) return false;
    return mediaService.sendAudioMessage(this.ws, audioBase64, duration);
  }

  public sendImageMessage(
    imageBase64: string,
    mimeType: string,
    filename: string,
    caption?: string,
  ): boolean {
    if (!this.ws) return false;
    return mediaService.sendImageMessage(
      this.ws,
      imageBase64,
      mimeType,
      filename,
      caption,
    );
  }

  public sendPdfMessage(
    pdfBase64: string,
    filename: string,
    caption?: string,
  ): boolean {
    if (!this.ws) return false;
    return mediaService.sendPdfMessage(this.ws, pdfBase64, filename, caption);
  }

  public sendVideoMessage(
    videoBase64: string,
    mimeType: string,
    filename: string,
    caption?: string,
  ): boolean {
    if (!this.ws) return false;
    return mediaService.sendVideoMessage(
      this.ws,
      videoBase64,
      mimeType,
      filename,
      caption,
    );
  }

  public disconnect(): void {
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

export const webSocketService = new WebSocketCoreService();
