/**
 * General formatting utilities
 */

/**
 * Language configuration
 * ISO 639-1 language codes
 */
export const LANGUAGE_CONFIG: Record<string, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  nl: "Nederlands",
  ru: "Русский",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ar: "العربية",
  hi: "हिन्दी",
  he: "עברית",
};

/**
 * Get language display name
 */
export function getLanguageName(
  languageCode: string | undefined | null,
): string {
  if (!languageCode) return "-";

  return (
    LANGUAGE_CONFIG[languageCode.toLowerCase()] || languageCode.toUpperCase()
  );
}

/**
 * Format language with native name
 */
export function formatLanguage(
  languageCode: string | undefined | null,
  options: {
    showCode?: boolean;
    native?: boolean;
  } = {},
): string {
  if (!languageCode) return "-";

  const { showCode = false } = options;
  const name = getLanguageName(languageCode);

  if (showCode && name !== languageCode.toUpperCase()) {
    return `${name} (${languageCode.toUpperCase()})`;
  }

  return name;
}

/**
 * Truncate text to specified length
 */
export function truncateText(
  text: string | undefined | null,
  maxLength: number = 50,
  suffix: string = "...",
): string {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format external ID for display
 */
export function formatExternalId(
  externalId: string | undefined | null,
  source?: string | undefined | null,
): string {
  if (!externalId) return "-";

  // Truncate long IDs
  const truncated =
    externalId.length > 12 ? `${externalId.substring(0, 8)}...` : externalId;

  if (source) {
    return `${source}: ${truncated}`;
  }

  return truncated;
}

/**
 * Format tags for display
 */
export function formatTags(
  tags: string[] | undefined | null,
  maxVisible: number = 3,
): {
  visible: string[];
  remaining: number;
  total: number;
} {
  if (!tags || tags.length === 0) {
    return {
      visible: [],
      remaining: 0,
      total: 0,
    };
  }

  return {
    visible: tags.slice(0, maxVisible),
    remaining: Math.max(0, tags.length - maxVisible),
    total: tags.length,
  };
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(
  value: number | undefined | null,
  options: {
    decimals?: number;
    locale?: string;
  } = {},
): string {
  if (value === null || value === undefined) return "-";

  const { decimals = 0, locale = "es-MX" } = options;

  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
