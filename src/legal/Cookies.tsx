import { Card, CardContent } from "@/components/ui/card";
import { Cookie, ShieldCheck, Settings, Info, Clock, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Helmet } from "react-helmet-async";

const Cookies = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cookieCategories = [
    {
      title: t('mvpCookies.catStrictTitle'),
      description: t('mvpCookies.catStrictDesc'),
      status: t('mvpCookies.catStrictStatus'),
      icon: ShieldCheck,
      examples: ["Auth Session", "CSRF Protection", "Cookie Preference Storage"]
    },
    {
      title: t('mvpCookies.catPerfTitle'),
      description: t('mvpCookies.catPerfDesc'),
      status: t('mvpCookies.catPerfStatus'),
      icon: Info,
      examples: ["Google Analytics", "Vercel Insights"]
    },
    {
      title: t('mvpCookies.catFuncTitle'),
      description: t('mvpCookies.catFuncDesc'),
      status: t('mvpCookies.catFuncStatus'),
      icon: Settings,
      examples: ["Language Preference", "Chat Support Widget"]
    }
  ];

  const handleOpenCookiePanel = () => {
    window.dispatchEvent(new Event("open-cookie-settings"));
  };

  return (
    <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
      <Helmet>
        <title>{t('mvpCookies.heroTitle')} | InfluLink</title>
        <meta name="description" content={t('mvpCookies.heroSubtitle')} />
      </Helmet>
      <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t('mvpCookies.heroTitle')} <span className="text-white">{t('mvpCookies.heroTitleSpan')}</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            {t('mvpCookies.heroSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="rounded-3xl border-border overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-10 text-gray-700">

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">{t('mvpCookies.sec1Title')}</h2>
                <p>{t('mvpCookies.sec1Content')}</p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('mvpCookies.sec2Title')}</h2>
                <div className="grid gap-6">
                  {cookieCategories.map((cat, i) => (
                    <div key={i} className="p-6 border rounded-2xl bg-gray-50/50 hover:bg-white transition-colors border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <cat.icon className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-bold text-lg">{cat.title}</h3>
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${cat.status === t('mvpCookies.catStrictStatus') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {cat.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.examples.map(ex => (
                          <span key={ex} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-500">
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2 italic">
                    <Clock className="w-4 h-4" /> {t('mvpCookies.durationTitle')}
                  </h3>
                  <p className="text-sm">
                    <strong>{t('mvpCookies.sessionTitle')}</strong> {t('mvpCookies.sessionContent')}<br />
                    <strong>{t('mvpCookies.persistentTitle')}</strong> {t('mvpCookies.persistentContent')}
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2 italic">
                    <ExternalLink className="w-4 h-4" /> {t('mvpCookies.thirdPartyTitle')}
                  </h3>
                  <p className="text-sm">
                    {t('mvpCookies.thirdPartyContent')}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <h2 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <Cookie className="w-5 h-5" />
                  {t('mvpCookies.sec3Title')}
                </h2>
                <p className="text-sm text-amber-800 leading-relaxed mb-4">
                  {t('mvpCookies.sec3Content')}
                </p>
                <button
                  onClick={handleOpenCookiePanel}
                  className="text-sm font-bold text-amber-900 underline underline-offset-4 hover:text-amber-700"
                >
                  {t('mvpCookies.openSettings')}
                </button>
              </div>

              <div className="pt-8 text-center border-t border-gray-100">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  {t('mvpCookies.lastUpdated')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Cookies;