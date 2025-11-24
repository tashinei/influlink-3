import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Ear, Menu, X } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { Earth } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const { language, setLanguage, t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const languages: { code: "bg" | "en"; label: string }[] = [
    { code: "bg", label: "Български" },
    { code: "en", label: "English" },
  ];

  const changeLanguage = (lang: "bg" | "en") => {
    setLanguage(lang);
    setLangOpen(false);
  };

  const isRegistered = useUserStore((state) => state.isRegistered);
  const accountType = useUserStore((state) => state.accountType);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsScrolled(false);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    const timer = setTimeout(() => {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const links = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Determine path/label for the dynamic "About" link
  const aboutPath = accountType === "creator" ? "/creator/about" : "/brand/about";
  const aboutLabel = accountType === "creator" ? t("nav.creatorAbout") : t("nav.brandAbout");

  const isSolidBackground = isScrolled || isOpen;
  const textColorClass = !isSolidBackground ? "text-white" : "text-primary";

  const navClasses = `
    fixed top-0 w-full z-50 transition-all duration-300 
    ${isSolidBackground
      ? "bg-background/90 shadow-sm border-b backdrop-blur-md"
      : "bg-transparent border-b-transparent"
    }
  `;

  return (
    <nav
      className={navClasses}
      style={{ borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" }}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            to="/"
            className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${textColorClass}`}
          >
            InfluLink
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`p-2 rounded-full transition-colors duration-300 ${textColorClass}`}
                aria-label="Select language"
              >
                <Earth size={24} />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300
                  ${isActive(link.path)
                    ? "bg-primary text-white shadow-md"
                    : isSolidBackground
                      ? "text-foreground hover:bg-secondary/10 hover:text-primary"
                      : "text-white/90 hover:bg-white/20 hover:text-white"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {isRegistered && (
              <Link
                to={aboutPath}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 border
                  ${isActive(aboutPath)
                    ? "bg-primary text-white border-transparent shadow-md"
                    : isSolidBackground
                      ? "border-primary/20 text-primary hover:bg-primary hover:text-white"
                      : "border-white/40 text-white hover:bg-white hover:text-black"
                  }`}
              >
                {aboutLabel}
              </Link>
            )}
          </div>

          {/* --- MOBILE TOGGLE (Right) --- */}
          <button
            className={`md:hidden p-2 rounded-md transition-colors duration-300 ${textColorClass}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className={`pb-6 pt-2 flex flex-col gap-2 ${isSolidBackground ? 'border-t border-border' : 'border-t border-white/10'}`}>
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${isActive(link.path)
                  ? "bg-gradient-to-br from-primary to-primary/40 text-[white]"
                  : isSolidBackground ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {isRegistered && (
              <Link
                to={aboutPath}
                onClick={() => setIsOpen(false)}
                className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${isActive(aboutPath)
                  ? "bg-gradient-to-br from-secondary to-primary/60 text-[white]"
                  : isSolidBackground ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
                  }`}
              >
                {aboutLabel}
              </Link>
            )}

            <div className="border-t border-gray-200 pt-2">
              <span className="block px-4 py-2 text-xs text-gray-500">Language</span>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-sm"
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
