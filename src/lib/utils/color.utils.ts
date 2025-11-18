/**
 * Color Utilities
 * Functions for color normalization, validation, and manipulation
 */

/**
 * Normalize a color string to uppercase hex format (#RRGGBB)
 */
export function normalizeColor(value: string): string {
  // Remove any spaces
  let normalized = value.trim();

  // Add # if missing
  if (normalized && !normalized.startsWith("#")) {
    normalized = "#" + normalized;
  }

  // Ensure it's uppercase for consistency
  return normalized.toUpperCase();
}

/**
 * Validate if a string is a valid hex color (#RRGGBB)
 */
export function validateHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Get contrast color (black or white) based on background color
 * Uses YIQ formula for luminance calculation
 */
export function getContrastColor(bgColor: string): string {
  // Remove # if present
  const hex = bgColor.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate YIQ luminance
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black or white based on luminance
  return yiq >= 128 ? "#000000" : "#FFFFFF";
}

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
    return null;
  }

  return {
    r: parseInt(normalized.substring(0, 2), 16),
    g: parseInt(normalized.substring(2, 4), 16),
    b: parseInt(normalized.substring(4, 6), 16),
  };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
