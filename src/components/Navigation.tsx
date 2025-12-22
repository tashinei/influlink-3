import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Ear, Menu, X, Earth, User, Briefcase, ArrowRight } from "lucide-react"; // Added new icons
import { useUserStore } from "@/store/useUserStore";
import { useTranslation } from "@/hooks/useTranslation";

// Assuming you have these components installed via shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Dialog State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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

  const aboutPath = accountType === "creator" ? "/creator/about" : "/brand/about";
  const aboutLabel = accountType === "creator" ? t("nav.creatorAbout") : t("nav.brandAbout");

  const isSolidBackground = isScrolled || isOpen;
  const textColorClass = !isSolidBackground ? "text-white" : "text-primary";

  const navClasses = `
    fixed top-0 w-full z-40 transition-all duration-300
    ${isSolidBackground
      ? "bg-background/90 shadow-sm border-b backdrop-blur-md"
      : "bg-transparent border-b-transparent"
    }
  `;

  // Helper to handle navigation from within the modal
  const handleOptionClick = () => {
    setIsRegisterOpen(false);
    setIsOpen(false); // Close mobile menu if open
  };

  return (
    <>
      <nav
        className={navClasses}
        style={{ borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              to="/"
              className={`text-2xl font-bold tracking-tight transition-colors duration-300`}
            >
              <img
                src={isSolidBackground ? "/influ11.svg" : "/influ7.svg"}
                className="h-10 md:h-14 lg:h-20 object-contain"
                alt="InfluLink logo"
              />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {/* Language Selector */}
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
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Standard Links */}
              {links.map((link) => {
                const activeClasses =
                  // 1. Is Active AND Solid Background (Scrolled/Open)
                  isActive(link.path) && isSolidBackground
                    ? "border-primary text-primary" // Solid border, primary color

                    // 2. Is Active BUT Transparent Background (Top of Page)
                    : isActive(link.path)
                      ? "border-white text-white" // Solid border, white color

                      // 3. Not Active & Solid Background
                      : isSolidBackground
                        ? "border-transparent text-primary hover:bg-muted" // No border

                        // 4. Not Active & Transparent Background
                        : "border-transparent text-white hover:bg-white/10"; // No border

                const defaultClasses = "px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 border";

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`${defaultClasses} ${activeClasses}`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* Register Button (Triggers Dialog) */}
              {!isRegistered && (
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 bg-gradient-to-br from-secondary to-primary text-[white] shadow-md hover:bg-gray-100 hover:scale-105`}
                >
                  {t("nav.register")}
                </button>
              )}

              {/* {isRegistered && (
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
              )} */}

              {isRegistered && (
                <Link
                  to={"/profile/me"}
                  onClick={() => setIsOpen(false)}
                  className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300
                  ${isActive("/profile/me") && isSolidBackground
                      ? "border border-primary text-primary" // Solid border, primary color

                      // 2. Is Active BUT Transparent Background (Top of Page)
                      : isActive("/profile/me")
                        ? "border border-white text-white" // Solid border, white color

                        // 3. Not Active & Solid Background
                        : isSolidBackground
                          ? "border-transparent text-primary hover:bg-muted" // No border

                          // 4. Not Active & Transparent Background
                          : "border-transparent text-white hover:bg-white/10" // No border
                    }`}
                >
                  {t("nav.profile")}
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

          {/* Mobile Menu Content */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
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

              {/* Mobile Register Button */}
              {!isRegistered && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsRegisterOpen(true);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-all 
                  ${isSolidBackground ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
                >
                  Регистрирай се
                </button>
              )}

              {isRegistered && (
                // <Link
                //   to={aboutPath}
                //   onClick={() => setIsOpen(false)}
                //   className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${isActive(aboutPath)
                //     ? "bg-gradient-to-br from-secondary to-primary/60 text-[white]"
                //     : isSolidBackground ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
                //     }`}
                // >
                //   {aboutLabel}
                // </Link>
                <Link
                  to={"/profile/me"}
                  onClick={() => setIsOpen(false)}
                  className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${isActive(aboutPath)
                    ? "bg-gradient-to-br from-secondary to-primary/60 text-[white]"
                    : isSolidBackground ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
                    }`}
                >
                  Профил
                </Link>
              )}

              <div className="border-t border-gray-200/20 pt-2">
                <span className={`block px-4 py-2 text-xs ${isSolidBackground ? "text-gray-500" : "text-white/60"}`}>Language</span>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm
                      ${isSolidBackground ? "hover:bg-gray-100 text-gray-800" : "text-white hover:bg-white/10"}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav >

      {/* --- REGISTRATION SELECTION DIALOG --- */}
      < Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen} >
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-primary to-secondary backdrop-blur-xl border-white/10 text-white shadow-2xl sm:rounded-3xl p-8">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-3xl font-bold text-center tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Join InfluLink
            </DialogTitle>
            <DialogDescription className="text-center text-[white] text-lg">
              Select your account type to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Creator Option */}
            <Link
              to="/register/creator"
              onClick={handleOptionClick}
              className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative mb-6 p-4 rounded-full bg-gradient-to-br from-secondary to-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
                <User className="h-8 w-8 text-white" />
              </div>

              <h3 className="relative text-xl font-semibold mb-2 text-white">Creator</h3>
              <p className="relative text-center text-sm text-[white] mb-6 px-2">
                Find campaigns, monetize content, and grow your personal brand.
              </p>

              <div className="relative flex items-center text-[white] text-sm font-medium group-hover:translate-x-1 transition-transform">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </Link>

            {/* Brand Option */}
            <Link
              to="/register/brand"
              onClick={handleOptionClick}
              className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative mb-6 p-4 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="h-8 w-8 text-white" />
              </div>

              <h3 className="relative text-xl font-semibold mb-2 text-white">Brand / Agency</h3>
              <p className="relative text-center text-sm text-slate-400 mb-6 px-2">
                Post campaigns, discover influencers, and track performance.
              </p>

              <div className="relative flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </Link>
          </div>
        </DialogContent>
      </Dialog >
    </>
  );
};

export default Navigation;