// Single source of truth for the European countries offered across the app
// (registration location picker + campaign/creator search country filters).
// Display names come from i18n via `form.countries.<CODE>`; flags from flagcdn.
export const EUROPEAN_COUNTRY_CODES = [
  "AL", "AD", "AT", "BY", "BE", "BA", "BG", "HR", "CY", "CZ", "DK",
  "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "XK", "LV",
  "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "NO", "PL", "PT",
  "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "TR", "UA",
  "GB", "VA",
] as const;

export type EuropeanCountryCode = (typeof EUROPEAN_COUNTRY_CODES)[number];

export const isEuropeanCountryCode = (code: string): code is EuropeanCountryCode =>
  (EUROPEAN_COUNTRY_CODES as readonly string[]).includes(code);
