import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-r from-secondary to-primary bg-card border-border mt-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center md:justify-items-start text-center md:text-left">
          
          <div>
            <h3 className="text-white text-xl font-bold mb-4">
              InfluLink
            </h3>
            <p className="text-muted max-w-[250px]">
              {t("footer.slogan")}
            </p>
          </div>

          {/* Navigation Section */}
          <div>
            <h4 className="font-semibold mb-4 text-muted text-lg">{t("footer.nav.title")}</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted hover:text-white transition-colors">{t("footer.nav.home")}</Link></li>
              <li><Link to="/about" className="text-muted hover:text-white transition-colors">{t("footer.nav.about")}</Link></li>
              <li><Link to="/contact" className="text-muted hover:text-white transition-colors">{t("footer.nav.contact")}</Link></li>
            </ul>
          </div>

          {/* Legal Section - NEW */}
          <div>
            <h4 className="font-semibold mb-4 text-muted text-lg">{t("legal.title")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-muted hover:text-white transition-colors">
                  {t("legal.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted hover:text-white transition-colors">
                  {t("legal.terms")}
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-muted hover:text-white transition-colors">
                  {t("legal.cookies")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-semibold mb-4 text-muted text-lg">{t("footer.nav.contact")}</h4>
            <ul className="space-y-2 text-muted">
              <li>support@influ-link.com</li>
              <li>{t("footer.support")}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-muted text-sm">
          <p>&copy; 2025 InfluLink. {t("footer.rights")}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">{t("legal.privacyPolicy")}</Link>
            <Link to="/terms" className="hover:text-white transition-colors">{t("legal.terms")}</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">{t("legal.cookies")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;