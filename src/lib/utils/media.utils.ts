/**
 * Media Utilities - Newton CRM
 * Utilities for handling media files, conversion to Base64, and validation
 */

export interface MediaFile {
  file: File;
  base64: string;
  preview?: string;
  type: "image" | "audio" | "video" | "document";
  mimetype: string;
}

/**
 * Convert a File to Base64 (without data:// prefix)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the "data:*/*;base64," prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a Blob to Base64 (without data:// prefix)
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the "data:*/*;base64," prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Determine media type from MIME type
 */
export function getMediaType(
  mimetype: string,
): "image" | "audio" | "video" | "document" {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("audio/")) return "audio";
  if (mimetype.startsWith("video/")) return "video";
  return "document";
}

/**
 * Validate file size (in MB)
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
}

/**
 * Get maximum file size for media type (in MB)
 */
export function getMaxFileSize(
  type: "image" | "audio" | "video" | "document",
): number {
  switch (type) {
    case "image":
      return 5; // 5MB
    case "audio":
      return 2; // 2MB
    case "video":
      return 16; // 16MB
    case "document":
      return 10; // 10MB
    default:
      return 5;
  }
}

/**
 * Validate MIME type
 */
export function validateMimeType(
  mimetype: string,
  allowedTypes: string[],
): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      const prefix = type.slice(0, -2);
      return mimetype.startsWith(prefix);
    }
    return mimetype === type;
  });
}

/**
 * Allowed MIME types by category
 */
export const ALLOWED_MIMETYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  audio: ["audio/ogg", "audio/mpeg", "audio/wav", "audio/webm"],
  video: ["video/mp4", "video/quicktime", "video/webm"],
  document: ["application/pdf"],
};

/**
 * Compress image (if needed)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not compress image"));
            }
          },
          file.type,
          quality,
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Generate preview URL for file
 */
export function generatePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Process media file for upload
 */
export async function processMediaFile(file: File): Promise<MediaFile> {
  const type = getMediaType(file.type);
  const maxSize = getMaxFileSize(type);

  // Validate file size
  if (!validateFileSize(file, maxSize)) {
    throw new Error(
      `El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`,
    );
  }

  // Validate MIME type
  const allowedTypes = ALLOWED_MIMETYPES[type];
  if (!validateMimeType(file.type, allowedTypes)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}`);
  }

  // Compress image if needed
  let processedFile: File | Blob = file;
  if (type === "image" && file.size > 1024 * 1024) {
    // Compress images larger than 1MB
    processedFile = await compressImage(file);
  }

  // Convert to Base64
  const base64 = await (processedFile instanceof File
    ? fileToBase64(processedFile)
    : blobToBase64(processedFile));

  // Generate preview for images and videos
  let preview: string | undefined;
  if (type === "image" || type === "video") {
    preview = generatePreviewUrl(file);
  }

  return {
    file,
    base64,
    preview,
    type,
    mimetype: file.type,
  };
}

/**
 * Format audio duration (seconds to MM:SS)
 */
export function formatAudioDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
