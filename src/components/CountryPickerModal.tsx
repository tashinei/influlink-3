import { useEffect, useState, useRef } from "react";
import { Search, X, Check, Globe } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CountryPickerModal({
  open,
  onClose,
  selected,
  setSelected,
  onSave,
}) {
  const [search, setSearch] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef(null);
  const isMobile =  useIsMobile();

  const internalCountries = [
    { code: "AL", name: "Албания", flag: "https://flagcdn.com/w40/al.png" },
    { code: "AD", name: "Андора", flag: "https://flagcdn.com/w40/ad.png" },
    { code: "AT", name: "Австрия", flag: "https://flagcdn.com/w40/at.png" },
    { code: "BY", name: "Беларус", flag: "https://flagcdn.com/w40/by.png" },
    { code: "BE", name: "Белгия", flag: "https://flagcdn.com/w40/be.png" },
    { code: "BA", name: "Босна и Херцеговина", flag: "https://flagcdn.com/w40/ba.png" },
    { code: "BG", name: "България", flag: "https://flagcdn.com/w40/bg.png" },
    { code: "HR", name: "Хърватия", flag: "https://flagcdn.com/w40/hr.png" },
    { code: "CY", name: "Кипър", flag: "https://flagcdn.com/w40/cy.png" },
    { code: "CZ", name: "Чехия", flag: "https://flagcdn.com/w40/cz.png" },
    { code: "DK", name: "Дания", flag: "https://flagcdn.com/w40/dk.png" },
    { code: "EE", name: "Естония", flag: "https://flagcdn.com/w40/ee.png" },
    { code: "FI", name: "Финландия", flag: "https://flagcdn.com/w40/fi.png" },
    { code: "FR", name: "Франция", flag: "https://flagcdn.com/w40/fr.png" },
    { code: "DE", name: "Германия", flag: "https://flagcdn.com/w40/de.png" },
    { code: "GR", name: "Гърция", flag: "https://flagcdn.com/w40/gr.png" },
    { code: "HU", name: "Унгария", flag: "https://flagcdn.com/w40/hu.png" },
    { code: "IS", name: "Исландия", flag: "https://flagcdn.com/w40/is.png" },
    { code: "IE", name: "Ирландия", flag: "https://flagcdn.com/w40/ie.png" },
    { code: "IT", name: "Италия", flag: "https://flagcdn.com/w40/it.png" },
    { code: "XK", name: "Косово", flag: "https://flagcdn.com/w40/xk.png" },
    { code: "LV", name: "Латвия", flag: "https://flagcdn.com/w40/lv.png" },
    { code: "LI", name: "Лихтенщайн", flag: "https://flagcdn.com/w40/li.png" },
    { code: "LT", name: "Литва", flag: "https://flagcdn.com/w40/lt.png" },
    { code: "LU", name: "Люксембург", flag: "https://flagcdn.com/w40/lu.png" },
    { code: "MT", name: "Малта", flag: "https://flagcdn.com/w40/mt.png" },
    { code: "MD", name: "Молдова", flag: "https://flagcdn.com/w40/md.png" },
    { code: "MC", name: "Монако", flag: "https://flagcdn.com/w40/mc.png" },
    { code: "ME", name: "Черна гора", flag: "https://flagcdn.com/w40/me.png" },
    { code: "NL", name: "Нидерландия", flag: "https://flagcdn.com/w40/nl.png" },
    { code: "NO", name: "Норвегия", flag: "https://flagcdn.com/w40/no.png" },
    { code: "PL", name: "Полша", flag: "https://flagcdn.com/w40/pl.png" },
    { code: "PT", name: "Португалия", flag: "https://flagcdn.com/w40/pt.png" },
    { code: "RO", name: "Румъния", flag: "https://flagcdn.com/w40/ro.png" },
    { code: "RU", name: "Русия", flag: "https://flagcdn.com/w40/ru.png" },
    { code: "SM", name: "Сан Марино", flag: "https://flagcdn.com/w40/sm.png" },
    { code: "RS", name: "Сърбия", flag: "https://flagcdn.com/w40/rs.png" },
    { code: "SK", name: "Словакия", flag: "https://flagcdn.com/w40/sk.png" },
    { code: "SI", name: "Словения", flag: "https://flagcdn.com/w40/si.png" },
    { code: "ES", name: "Испания", flag: "https://flagcdn.com/w40/es.png" },
    { code: "SE", name: "Швеция", flag: "https://flagcdn.com/w40/se.png" },
    { code: "CH", name: "Швейцария", flag: "https://flagcdn.com/w40/ch.png" },
    { code: "TR", name: "Турция", flag: "https://flagcdn.com/w40/tr.png" },
    { code: "UA", name: "Украйна", flag: "https://flagcdn.com/w40/ua.png" },
    { code: "GB", name: "Обединено кралство", flag: "https://flagcdn.com/w40/gb.png" },
    { code: "VA", name: "Ватикан", flag: "https://flagcdn.com/w40/va.png" }
  ];

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const filtered = internalCountries.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const toggleCountry = (country) => {
    const exists = selected.some((s) => s.code === country.code);

    if (exists) {
      setSelected(selected.filter((p) => p.code !== country.code));
    } else {
      if (selected.length < 3) {
        setSelected([...selected, country]);
        setSearch("");
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    }
  };

  const isLimitReached = selected.length >= 3;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all rounded-[30px]"
      onClick={onClose}
      style={{ marginTop: "0" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-white rounded-xl w-full max-w-sm shadow-2xl flex flex-col 
          max-h-[85vh] md:max-h-[550px] 
          ${isShaking ? "animate-shake" : ""} 
          animate-in fade-in zoom-in-95 duration-200
        `}
        style={isMobile ? {height:"90%", width: "90%"} : {}}
      >
        {/* HEADER: Compact padding */}
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              Изберете държави
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Максимум <span className="font-bold text-primary">3</span> държави.
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
            {selected.length}/3
          </span>
          <button
            type="button"
            onClick={onSave}
            className="bg-gradient-to-tr from-primary to-secondary hover:scale-105 text-white text-sm px-6 py-2 rounded-lg font-medium transition-all active:scale-95"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}