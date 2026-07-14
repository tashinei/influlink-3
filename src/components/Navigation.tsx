import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Ear, Menu, X, Earth, User, Briefcase, ArrowRight } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useTranslation } from "@/hooks/useTranslation";
import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationDropdown, { type Notification } from "@/components/notifications/NotificationDropdown";
import { NotificationDetailModal } from "@/components/notifications/NotificationDetailModal";
import { useLiveNotifications } from "@/hooks/useLiveNotifications";
import RegisterSelectionDialog from "./RegisterSelectionDialog";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

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
  const { user } = useUserStore();
  const { unreadCount } = useLiveNotifications(user);

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
    { name: t("nav.pricing"), path: "/pricing" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const aboutPath = accountType === "creator" ? "/creator/about" : "/brand/about";
  const aboutLabel = accountType === "creator" ? t("nav.creatorAbout") : t("nav.brandAbout");

  const isSolidBackground = isScrolled || isOpen;
  const textColorClass = !isSolidBackground ? "text-white" : "text-primary";

  const navClasses = `
    fixed top-0 w-full transition-all duration-300 z-[3000]
    ${isSolidBackground
      ? "bg-background/90 shadow-sm border-b backdrop-blur-md"
      : "bg-transparent border-b-transparent"
    }
  `;

  useEffect(() => {
    if (notifOpen && !isSolidBackground) {
      setNotifOpen(false);
    }
  }, [isSolidBackground]);

  const navigate = useNavigate();

  return (
    <>
      <nav
        className={navClasses}
        style={{ borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="text-2xl font-bold tracking-tight transition-colors duration-300">
              <img
                src={isSolidBackground ? "/influLink4.png" : "/influLink3.png"}
                className="h-16 md:h-20 lg:h-19 object-contain"
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
                      <button key={lang.code} onClick={() => changeLanguage(lang.code)} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isRegistered && (
                <div className="relative">
                  <div className="relative inline-flex items-center">
                    <NotificationBell color={textColorClass} onClick={() => setNotifOpen((v) => !v)} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0 -right-0 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[10px] font-bold text-white shadow-md">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>

                  {notifOpen && (
                    <NotificationDropdown
                      setDropdownOpen={setNotifOpen}
                      onNotificationSelect={setSelectedNotification}
                    />
                  )}
                </div>
              )}

              {links.map((link) => {
                const activeClasses =
                  isActive(link.path) && isSolidBackground ? "border-primary text-primary"
                    : isActive(link.path) ? "border-white text-white"
                      : isSolidBackground ? "border-transparent text-primary hover:bg-muted"
                        : "border-transparent text-white hover:bg-white/10";

                return (
                  <Link key={link.path} to={link.path} className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 border ${activeClasses}`}>
                    {link.name}
                  </Link>
                );
              })}

              {!isRegistered && (
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 bg-gradient-to-br from-secondary to-primary text-[white] shadow-md hover:bg-gray-100 hover:scale-105"
                >
                  {t("nav.register")}
                </button>
              )}

              {isRegistered && (
                <Link
                  to="/profile/me"
                  onClick={() => setIsOpen(false)}
                  className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300
                  ${isActive("/profile/me") && isSolidBackground ? "border border-secondary bg-gradient-to-br from-tertiary via-secondary to-primary bg-clip-text text-transparent"
                      : isActive("/profile/me") ? "border border-white text-white"
                        : isSolidBackground ? "border-transparent bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent hover:bg-muted"
                          : "border-transparent text-white hover:bg-white/10"}`}
                >
                  {t("nav.profile")}
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              className={`md:hidden p-2 rounded-md transition-colors duration-300 ${textColorClass}`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className={`pb-6 pt-2 flex flex-col gap-2 ${isSolidBackground ? 'border-t border-border' : 'border-t border-white/10'}`}>
              {links.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                  className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${isActive(link.path) ? "bg-gradient-to-br from-primary to-primary/40 text-[white]"
                      : isSolidBackground ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
                >
                  {link.name}
                </Link>
              ))}

              {!isRegistered && (
                <button
                  onClick={() => { setIsOpen(false); setIsRegisterOpen(true); }}
                  className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${isSolidBackground ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
                >
                  {t("nav.register")}
                </button>
              )}

              {isRegistered && (
                <Link to="/profile/me" onClick={() => setIsOpen(false)}
                  className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${isActive(aboutPath) ? "bg-gradient-to-br from-secondary to-primary/60 text-[white]"
                      : isSolidBackground ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
                >
                  {t("nav.profile")}
                </Link>
              )}

              <div className="border-t border-gray-200/20 pt-2">
                <span className={`block px-4 py-2 text-xs ${isSolidBackground ? "text-gray-500" : "text-white/60"}`}>Language</span>
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => changeLanguage(lang.code)}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${isSolidBackground ? "hover:bg-gray-100 text-gray-800" : "text-white hover:bg-white/10"}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onDropdownClose={() => setNotifOpen(false)}
        onOpenChat={(partner) => {
          setSelectedNotification(null);
          setNotifOpen(false);
          navigate("/profile/me", { state: { openChat: true, partner } });
        }}
      />

      <RegisterSelectionDialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen} />
    </>
  );
};

export default Navigation;