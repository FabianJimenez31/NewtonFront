/**
 * WebSocket Media Service - Newton CRM
 * Handles media message sending through WebSocket
 */

export interface MediaMessagePayload {
  type: string;
  media_data: string;
  media_type: "image" | "video" | "document";
  mimetype: string;
  filename: string;
  caption?: string;
}

export interface AudioMessagePayload {
  type: string;
  audio: string;
  duration?: number;
}

/**
 * Send audio message via WebSocket
 * @param ws - WebSocket connection
 * @param audioBase64 - Audio in Base64 format (without data:// prefix)
 * @param duration - Duration in seconds (optional)
 */
export function sendAudioMessage(
  ws: WebSocket,
  audioBase64: string,
  duration?: number,
): boolean {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("[WebSocket Media] Cannot send audio: not connected");
    return false;
  }

  const payload: AudioMessagePayload = {
    type: "send_audio_message",
    audio: audioBase64,
  };

  if (duration !== undefined) {
    payload.duration = duration;
  }

  console.log("[WebSocket Media] Sending audio message, duration:", duration);
  ws.send(JSON.stringify(payload));
  return true;
}

/**
 * Send image message via WebSocket
 * @param ws - WebSocket connection
 * @param imageBase64 - Image in Base64 format (without data:// prefix)
 * @param mimeType - MIME type (e.g., image/jpeg, image/png)
 * @param filename - Original filename
 * @param caption - Optional caption
 */
export function sendImageMessage(
  ws: WebSocket,
  imageBase64: string,
  mimeType: string,
  filename: string,
  caption?: string,
): boolean {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("[WebSocket Media] Cannot send image: not connected");
    return false;
  }

  const payload: MediaMessagePayload = {
    type: "send_media_message",
    media_data: imageBase64,
    media_type: "image",
    mimetype: mimeType,
    filename,
  };

  if (caption) {
    payload.caption = caption;
  }

  console.log("[WebSocket Media] Sending image:", filename, "MIME:", mimeType);
  ws.send(JSON.stringify(payload));
  return true;
}

/**
 * Send PDF document via WebSocket
 * @param ws - WebSocket connection
 * @param pdfBase64 - PDF in Base64 format (without data:// prefix)
 * @param filename - Original filename
 * @param caption - Optional caption
 */
export function sendPdfMessage(
  ws: WebSocket,
  pdfBase64: string,
  filename: string,
  caption?: string,
): boolean {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("[WebSocket Media] Cannot send PDF: not connected");
    return false;
  }

  const payload: MediaMessagePayload = {
    type: "send_media_message",
    media_data: pdfBase64,
    media_type: "document",
    mimetype: "application/pdf",
    filename,
  };

  if (caption) {
    payload.caption = caption;
  }

  console.log("[WebSocket Media] Sending PDF:", filename);
  ws.send(JSON.stringify(payload));
  return true;
}

/**
 * Send video message via WebSocket
 * @param ws - WebSocket connection
 * @param videoBase64 - Video in Base64 format (without data:// prefix)
 * @param mimeType - MIME type (e.g., video/mp4, video/quicktime)
 * @param filename - Original filename
 * @param caption - Optional caption
 */
export function sendVideoMessage(
  ws: WebSocket,
  videoBase64: string,
  mimeType: string,
  filename: string,
  caption?: string,
): boolean {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("[WebSocket Media] Cannot send video: not connected");
    return false;
  }

  const payload: MediaMessagePayload = {
    type: "send_media_message",
    media_data: videoBase64,
    media_type: "video",
    mimetype: mimeType,
    filename,
  };

  if (caption) {
    payload.caption = caption;
  }

  console.log("[WebSocket Media] Sending video:", filename, "MIME:", mimeType);
  ws.send(JSON.stringify(payload));
  return true;
}
