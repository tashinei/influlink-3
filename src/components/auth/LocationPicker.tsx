import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { EUROPEAN_COUNTRY_CODES } from "@/data/countries";

/**
 * Registration location field: a free-text City input + a Country dropdown
 * limited to the supported (European) countries. The parent keeps `city` and
 * `countryCode`; this composes the human-readable `location` string
 * ("City, Country") the backend stores, so the country is always valid.
 */
export function LocationPicker({
  city,
  countryCode,
  onChange,
  cityPlaceholder,
}: {
  city: string;
  countryCode: string;
  onChange: (next: { city: string; countryCode: string; location: string }) => void;
  cityPlaceholder?: string;
}) {
  const { t } = useTranslation();

  const countryName = (code: string) => (code ? t(`form.countries.${code}`) : "");
  const compose = (c: string, code: string) =>
    [c.trim(), countryName(code)].filter(Boolean).join(", ");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* City */}
      <div className="relative">
        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
        <input
          className="step-input !pl-[40px]"
          placeholder={cityPlaceholder}
          value={city}
          onChange={(e) =>
            onChange({ city: e.target.value, countryCode, location: compose(e.target.value, countryCode) })
          }
        />
      </div>

      {/* Country (Europe only) */}
      <select
        className="step-input"
        value={countryCode}
        onChange={(e) =>
          onChange({ city, countryCode: e.target.value, location: compose(city, e.target.value) })
        }
      >
        <option value="" disabled className="bg-gray-900">
          {t("form.countryPick.selectCountry")}
        </option>
        {EUROPEAN_COUNTRY_CODES.map((code) => (
          <option key={code} value={code} className="bg-gray-900">
            {t(`form.countries.${code}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
