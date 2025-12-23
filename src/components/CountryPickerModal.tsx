import { useEffect, useState, useRef, useMemo } from "react";
import { Search, X, Check, Globe } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/hooks/useTranslation";

export default function CountryPickerModal({
  open,
  onClose,
  selected,
  setSelected,
  onSave,
  shouldHaveOverlay,
  maxCapacity = 3
}) {
  const [search, setSearch] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const ALL_EUROPEAN_COUNTRY_CODES = [
    "AL", "AD", "AT", "BY", "BE", "BA", "BG", "HR", "CY", "CZ", "DK",
    "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "XK", "LV",
    "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "NO", "PL", "PT",
    "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "TR", "UA",
    "GB", "VA"
  ];

  const getFlagUrl = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  const translatedCountries = useMemo(() => {
    return ALL_EUROPEAN_COUNTRY_CODES.map((code) => ({
      code: code,
      // Name is fetched dynamically from the translation file
      name: t(`form.countries.${code}`),
      // Flag is generated dynamically from the code
      flag: getFlagUrl(code),
    }));
  }, [t]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const filtered = translatedCountries.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const toggleCountry = (country) => {
    const exists = selected.some((s) => s.code === country.code);

    if (exists) {
      setSelected(selected.filter((p) => p.code !== country.code));
    } else {
      if (selected.length < maxCapacity) {
        setSelected([...selected, country]);
        setSearch("");
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    }
  };

  const isLimitReached = selected.length >= maxCapacity;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all rounded-[30px]"
      onClick={onClose}
      style={!shouldHaveOverlay ? {marginTop: "0", background:"transparent"} : { marginTop: "0" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-white rounded-xl w-full max-w-sm shadow-2xl flex flex-col 
          max-h-[85vh] md:max-h-[550px] 
          ${isShaking ? "animate-shake" : ""} 
          animate-in fade-in zoom-in-95 duration-200
        `}
        style={isMobile ? { height: "90%", width: "90%" } : {}}
      >
        {/* HEADER: Compact padding */}
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              {t("form.countryPick.title")}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            {t("form.countryPick.subTitle")}
          </p>

          {/* CHIPS: More compact */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selected.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center gap-1.5 bg-gradient-to-br from-secondary to-primary text-[white] px-2 py-1 rounded text-xs font-medium border border-blue-100 animate-in fade-in zoom-in"
                >
                  <img src={item.flag} alt="" className="w-3.5 h-2.5 object-cover rounded-[1px]" />
                  {item.name}
                  <button
                    onClick={() => toggleCountry(item)}
                    className="flex hover:bg-[white] hover:text-primary rounded-full p-0.5 transition justify-center place-items-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEARCH: Compact */}
        <div className="px-3 py-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-black" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Търсене..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* LIST: Flexible height, but items are smaller */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0">
          {filtered.map((country) => {
            const isSelected = selected.some((s) => s.code === country.code);
            const isDisabled = !isSelected && isLimitReached;

            return (
              <button
                key={country.code}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleCountry(country)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-sm
                  ${isSelected
                    ? "bg-blue-50 border-blue-200 bg-gradient-to-br from-secondary to-primary bg-clip-text text-transparent"
                    : "hover:bg-gray-50 text-gray-700"
                  }
                  ${isDisabled ? "opacity-40 cursor-not-allowed grayscale" : ""}
                `}
              >
                <img
                  src={country.flag}
                  alt={country.name}
                  className={`w-6 h-4 object-cover rounded shadow-sm ${isDisabled ? "opacity-70" : ""}`}
                />
                <span className="font-medium truncate flex-1">
                  {country.name}
                </span>

                {isSelected && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Globe className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs">Няма резултати</p>
            </div>
          )}
        </div>

        {/* FOOTER: Compact */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex justify-between items-center shrink-0">
          <span className="text-xs bg-gradient-to-br from-secondary to-primary bg-clip-text text-transparent font-medium">
            {selected.length}/{maxCapacity}
          </span>
          <button
            type="button"
            onClick={onSave}
            className="bg-gradient-to-tr from-primary to-secondary hover:scale-105 text-white text-sm px-6 py-2 rounded-lg font-medium transition-all active:scale-95"
          >
            {t("form.countryPick.save")}
          </button>
        </div>
      </div>
    </div>
  );
}