/**
 * Currency formatting utilities
 * Uses Intl.NumberFormat for proper localization
 */

/**
 * Currency configuration map
 * Maps ISO 4217 currency codes to their display properties
 */
export const CURRENCY_CONFIG = {
  USD: { symbol: "$", locale: "en-US", name: "US Dollar" },
  EUR: { symbol: "€", locale: "de-DE", name: "Euro" },
  MXN: { symbol: "$", locale: "es-MX", name: "Mexican Peso" },
  BRL: { symbol: "R$", locale: "pt-BR", name: "Brazilian Real" },
  ARS: { symbol: "$", locale: "es-AR", name: "Argentine Peso" },
  CLP: { symbol: "$", locale: "es-CL", name: "Chilean Peso" },
  COP: { symbol: "$", locale: "es-CO", name: "Colombian Peso" },
  PEN: { symbol: "S/", locale: "es-PE", name: "Peruvian Sol" },
  UYU: { symbol: "$", locale: "es-UY", name: "Uruguayan Peso" },
  GBP: { symbol: "£", locale: "en-GB", name: "British Pound" },
  CAD: { symbol: "$", locale: "en-CA", name: "Canadian Dollar" },
  JPY: { symbol: "¥", locale: "ja-JP", name: "Japanese Yen" },
  CNY: { symbol: "¥", locale: "zh-CN", name: "Chinese Yuan" },
} as const;

export type SupportedCurrency = keyof typeof CURRENCY_CONFIG;

/**
 * Format a monetary value with the appropriate currency symbol and formatting
 * @param value - The numeric value to format
 * @param currency - ISO 4217 currency code (e.g., 'USD', 'MXN')
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | undefined | null,
  currency: string = "USD",
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
): string {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return "-";
  }

  const {
    showSymbol = true,
    showCode = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  // Get currency configuration or default to USD
  const config =
    CURRENCY_CONFIG[currency as SupportedCurrency] || CURRENCY_CONFIG.USD;

  try {
    // Use Intl.NumberFormat for proper localization
    const formatter = new Intl.NumberFormat(config.locale, {
      style: showSymbol ? "currency" : "decimal",
      currency: currency || "USD",
      minimumFractionDigits,
      maximumFractionDigits,
      currencyDisplay: showSymbol ? "symbol" : "code",
    });

    const formatted = formatter.format(value);

    // Optionally append currency code
    if (showCode && !showSymbol) {
      return `${formatted} ${currency}`;
    }

    return formatted;
  } catch (error) {
    // Fallback for unsupported currencies
    console.warn(`Currency format error for ${currency}:`, error);
    const fallback = value.toFixed(maximumFractionDigits);
    return showCode ? `${fallback} ${currency}` : `${config.symbol}${fallback}`;
  }
}

/**
 * Format a large monetary value in a compact form (e.g., 1.5M, 10K)
 * @param value - The numeric value to format
 * @param currency - ISO 4217 currency code
 * @returns Compact formatted currency string
 */
export function formatCompactCurrency(
  value: number | undefined | null,
  currency: string = "USD",
): string {
  if (value === null || value === undefined) {
    return "-";
  }

  const config =
    CURRENCY_CONFIG[currency as SupportedCurrency] || CURRENCY_CONFIG.USD;

  try {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency || "USD",
      notation: "compact",
      maximumSignificantDigits: 3,
    });

    return formatter.format(value);
  } catch (error) {
    // Fallback for unsupported currencies
    let compact = value;
    let suffix = "";

    if (value >= 1_000_000) {
      compact = value / 1_000_000;
      suffix = "M";
    } else if (value >= 1_000) {
      compact = value / 1_000;
      suffix = "K";
    }

    return `${config.symbol}${compact.toFixed(1)}${suffix}`;
  }
}

/**
 * Get the currency symbol for a given currency code
 * @param currency - ISO 4217 currency code
 * @returns Currency symbol or the code itself if not found
 */
export function getCurrencySymbol(currency: string): string {
  const config = CURRENCY_CONFIG[currency as SupportedCurrency];
  return config?.symbol || currency;
}

/**
 * Get the currency name for a given currency code
 * @param currency - ISO 4217 currency code
 * @returns Currency name or the code itself if not found
 */
export function getCurrencyName(currency: string): string {
  const config = CURRENCY_CONFIG[currency as SupportedCurrency];
  return config?.name || currency;
}

/**
 * Parse a currency string back to a number
 * @param value - The currency string to parse
 * @param currency - ISO 4217 currency code
 * @returns Numeric value or null if parsing fails
 */
export function parseCurrency(value: string, currency?: string): number | null {
  if (!value) return null;

  // Remove common currency symbols and formatting
  const cleanValue = value
    .replace(/[€$£¥R\s,]/g, "")
    .replace(/[A-Z]{3}$/i, "") // Remove trailing currency codes
    .trim();

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Validate if a currency code is supported
 * @param currency - Currency code to validate
 * @returns True if the currency is supported
 */
export function isSupportedCurrency(
  currency: string,
): currency is SupportedCurrency {
  return currency in CURRENCY_CONFIG;
}
