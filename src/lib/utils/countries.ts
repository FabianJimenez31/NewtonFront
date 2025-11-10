/**
 * Country code utilities and flag mapping
 * ISO 3166-1 alpha-2 country codes
 */

/**
 * Country configuration with name, flag emoji, and phone code
 * Focus on Americas and major markets
 */
export const COUNTRY_CONFIG = {
  // Americas
  US: { name: "United States", flag: "🇺🇸", phone: "+1", continent: "Americas" },
  MX: { name: "Mexico", flag: "🇲🇽", phone: "+52", continent: "Americas" },
  BR: { name: "Brazil", flag: "🇧🇷", phone: "+55", continent: "Americas" },
  AR: { name: "Argentina", flag: "🇦🇷", phone: "+54", continent: "Americas" },
  CL: { name: "Chile", flag: "🇨🇱", phone: "+56", continent: "Americas" },
  CO: { name: "Colombia", flag: "🇨🇴", phone: "+57", continent: "Americas" },
  PE: { name: "Peru", flag: "🇵🇪", phone: "+51", continent: "Americas" },
  UY: { name: "Uruguay", flag: "🇺🇾", phone: "+598", continent: "Americas" },
  PY: { name: "Paraguay", flag: "🇵🇾", phone: "+595", continent: "Americas" },
  BO: { name: "Bolivia", flag: "🇧🇴", phone: "+591", continent: "Americas" },
  EC: { name: "Ecuador", flag: "🇪🇨", phone: "+593", continent: "Americas" },
  VE: { name: "Venezuela", flag: "🇻🇪", phone: "+58", continent: "Americas" },
  CR: { name: "Costa Rica", flag: "🇨🇷", phone: "+506", continent: "Americas" },
  PA: { name: "Panama", flag: "🇵🇦", phone: "+507", continent: "Americas" },
  GT: { name: "Guatemala", flag: "🇬🇹", phone: "+502", continent: "Americas" },
  HN: { name: "Honduras", flag: "🇭🇳", phone: "+504", continent: "Americas" },
  SV: { name: "El Salvador", flag: "🇸🇻", phone: "+503", continent: "Americas" },
  NI: { name: "Nicaragua", flag: "🇳🇮", phone: "+505", continent: "Americas" },
  DO: {
    name: "Dominican Republic",
    flag: "🇩🇴",
    phone: "+1",
    continent: "Americas",
  },
  CA: { name: "Canada", flag: "🇨🇦", phone: "+1", continent: "Americas" },

  // Europe
  ES: { name: "Spain", flag: "🇪🇸", phone: "+34", continent: "Europe" },
  GB: { name: "United Kingdom", flag: "🇬🇧", phone: "+44", continent: "Europe" },
  FR: { name: "France", flag: "🇫🇷", phone: "+33", continent: "Europe" },
  DE: { name: "Germany", flag: "🇩🇪", phone: "+49", continent: "Europe" },
  IT: { name: "Italy", flag: "🇮🇹", phone: "+39", continent: "Europe" },
  PT: { name: "Portugal", flag: "🇵🇹", phone: "+351", continent: "Europe" },
  NL: { name: "Netherlands", flag: "🇳🇱", phone: "+31", continent: "Europe" },
  BE: { name: "Belgium", flag: "🇧🇪", phone: "+32", continent: "Europe" },
  CH: { name: "Switzerland", flag: "🇨🇭", phone: "+41", continent: "Europe" },
  AT: { name: "Austria", flag: "🇦🇹", phone: "+43", continent: "Europe" },

  // Asia
  CN: { name: "China", flag: "🇨🇳", phone: "+86", continent: "Asia" },
  JP: { name: "Japan", flag: "🇯🇵", phone: "+81", continent: "Asia" },
  IN: { name: "India", flag: "🇮🇳", phone: "+91", continent: "Asia" },
  KR: { name: "South Korea", flag: "🇰🇷", phone: "+82", continent: "Asia" },

  // Other regions
  AU: { name: "Australia", flag: "🇦🇺", phone: "+61", continent: "Oceania" },
  ZA: { name: "South Africa", flag: "🇿🇦", phone: "+27", continent: "Africa" },
} as const;

export type SupportedCountry = keyof typeof COUNTRY_CONFIG;

/**
 * Get country flag emoji from ISO code
 * @param countryCode - ISO 3166-1 alpha-2 code
 * @returns Flag emoji or country code if not found
 */
export function getCountryFlag(countryCode: string | undefined | null): string {
  if (!countryCode) return "🌍";

  const country = COUNTRY_CONFIG[countryCode.toUpperCase() as SupportedCountry];
  if (country) return country.flag;

  // Fallback: Generate flag emoji from country code
  // This works for any valid ISO code
  try {
    const codePoints = [...countryCode.toUpperCase()]
      .map((char) => 0x1f1e6 - 65 + char.charCodeAt(0))
      .map((codePoint) => String.fromCodePoint(codePoint));
    return codePoints.join("");
  } catch {
    return countryCode.toUpperCase();
  }
}

/**
 * Get country name from ISO code
 * @param countryCode - ISO 3166-1 alpha-2 code
 * @returns Country name or the code itself if not found
 */
export function getCountryName(countryCode: string | undefined | null): string {
  if (!countryCode) return "Unknown";

  const country = COUNTRY_CONFIG[countryCode.toUpperCase() as SupportedCountry];
  return country?.name || countryCode.toUpperCase();
}

/**
 * Get phone code from country ISO code
 * @param countryCode - ISO 3166-1 alpha-2 code
 * @returns Phone code with + prefix or empty string
 */
export function getPhoneCode(countryCode: string | undefined | null): string {
  if (!countryCode) return "";

  const country = COUNTRY_CONFIG[countryCode.toUpperCase() as SupportedCountry];
  return country?.phone || "";
}

/**
 * Format country with flag and name
 * @param countryCode - ISO 3166-1 alpha-2 code
 * @param options - Display options
 * @returns Formatted country string
 */
export function formatCountry(
  countryCode: string | undefined | null,
  options: {
    showFlag?: boolean;
    showName?: boolean;
    showCode?: boolean;
  } = {},
): string {
  if (!countryCode) return "-";

  const { showFlag = true, showName = false, showCode = true } = options;

  const parts: string[] = [];

  if (showFlag) {
    parts.push(getCountryFlag(countryCode));
  }

  if (showName) {
    parts.push(getCountryName(countryCode));
  } else if (showCode) {
    parts.push(countryCode.toUpperCase());
  }

  return parts.join(" ");
}

/**
 * Group countries by continent for display
 * @returns Countries grouped by continent
 */
export function getCountriesByContinent(): Record<
  string,
  Array<{
    code: string;
    name: string;
    flag: string;
  }>
> {
  const grouped: Record<string, Array<any>> = {};

  Object.entries(COUNTRY_CONFIG).forEach(([code, config]) => {
    const continent = config.continent;
    if (!grouped[continent]) {
      grouped[continent] = [];
    }
    grouped[continent].push({
      code,
      name: config.name,
      flag: config.flag,
    });
  });

  // Sort countries within each continent
  Object.keys(grouped).forEach((continent) => {
    grouped[continent].sort((a, b) => a.name.localeCompare(b.name));
  });

  return grouped;
}

/**
 * Validate if a country code is supported
 * @param countryCode - Country code to validate
 * @returns True if the country is supported
 */
export function isSupportedCountry(
  countryCode: string,
): countryCode is SupportedCountry {
  return countryCode.toUpperCase() in COUNTRY_CONFIG;
}

/**
 * Get all supported country codes
 * @returns Array of supported ISO country codes
 */
export function getSupportedCountryCodes(): string[] {
  return Object.keys(COUNTRY_CONFIG);
}

/**
 * Search countries by name, code, or phone
 * @param query - Search query
 * @returns Matching countries
 */
export function searchCountries(query: string): Array<{
  code: string;
  name: string;
  flag: string;
  phone: string;
}> {
  if (!query) return [];

  const normalized = query.toLowerCase().trim();

  return Object.entries(COUNTRY_CONFIG)
    .filter(([code, config]) => {
      return (
        code.toLowerCase().includes(normalized) ||
        config.name.toLowerCase().includes(normalized) ||
        config.phone.includes(normalized)
      );
    })
    .map(([code, config]) => ({
      code,
      name: config.name,
      flag: config.flag,
      phone: config.phone,
    }));
}
