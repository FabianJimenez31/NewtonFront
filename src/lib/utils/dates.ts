/**
 * Date and time formatting utilities
 */

/**
 * Format ISO datetime to relative time
 * @param isoDate - ISO datetime string
 * @returns Relative time string in Spanish
 */
export function formatRelativeTime(isoDate: string | undefined | null): string {
  if (!isoDate) return "-";

  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;

    return `Hace ${Math.floor(diffDays / 365)} años`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoDate;
  }
}

/**
 * Format ISO datetime to localized date string
 */
export function formatDate(
  isoDate: string | undefined | null,
  options: Intl.DateTimeFormatOptions = {},
): string {
  if (!isoDate) return "-";

  try {
    const date = new Date(isoDate);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    return date.toLocaleDateString("es-MX", defaultOptions);
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoDate;
  }
}

/**
 * Format ISO datetime to time string
 */
export function formatTime(
  isoDate: string | undefined | null,
  options: Intl.DateTimeFormatOptions = {},
): string {
  if (!isoDate) return "-";

  try {
    const date = new Date(isoDate);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    };

    return date.toLocaleTimeString("es-MX", defaultOptions);
  } catch (error) {
    console.error("Error formatting time:", error);
    return isoDate;
  }
}

/**
 * Format ISO datetime to full datetime string
 */
export function formatDateTime(isoDate: string | undefined | null): string {
  if (!isoDate) return "-";

  try {
    const date = new Date(isoDate);
    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return isoDate;
  }
}
