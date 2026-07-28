import { Card, CardContent } from "@/components/ui/card";
import { Scale, UserCheck, CreditCard, Handshake } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

/**
 * Terms of Service, written to reflect how InfluLink actually works: a
 * marketplace/intermediary between creators and brands, with Stripe escrow +
 * tiered platform commission and Stripe Connect payouts. English is the
 * reviewable canonical version — have it checked by a lawyer and add a certified
 * Bulgarian translation before relying on it.
 */

const BODY_CLASS =
  "space-y-3 text-[15px] leading-relaxed " +
  "[&_a]:text-primary [&_a]:underline " +
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2";

const Section = ({ title, html }: { title: string; html: string }) => (
  <section className="space-y-3">
    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
    <div className={BODY_CLASS} dangerouslySetInnerHTML={{ __html: html }} />
  </section>
);

const Terms = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const highlights = [
    { icon: Handshake, title: t("mvpTerms.roleTitle"), content: t("mvpTerms.roleContent") },
    { icon: UserCheck, title: t("mvpTerms.integrityTitle"), content: t("mvpTerms.integrityContent") },
    { icon: CreditCard, title: t("mvpTerms.paymentsTitle"), content: t("mvpTerms.paymentsContent") },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
      <Helmet>
        <title>{t("mvpTerms.heroTitle")} | InfluLink</title>
        <meta name="robots" content="index, follow" />
      </Helmet>

      <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t("mvpTerms.heroTitle")} <span className="text-white">{t("mvpTerms.heroTitleSpan")}</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">{t("mvpTerms.heroSubtitle")}</p>
          <p className="mt-6 text-sm uppercase tracking-widest opacity-80">{t("mvpTerms.lastUpdatedLabel")} {t("mvpTerms.dateValue")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {highlights.map((item, index) => (
              <Card key={index} className="rounded-2xl border-border text-center hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="rounded-3xl border-border overflow-hidden">
              <CardContent className="p-8 md:p-12 space-y-10 text-gray-700">

                {/* Intro / acceptance */}
                <div className="bg-gray-50 p-6 rounded-2xl border text-sm [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: t("mvpTerms.intro") }} />

                {(t("mvpTerms.body") as unknown as { title: string; html: string }[]).map((s, i) => (
                  <Section key={i} title={s.title} html={s.html} />
                ))}

                <div className="pt-8 text-center border-t border-gray-100">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    © 2026 INFLULINK LTD. • Sofia, Bulgaria (EU) • {t("mvpTerms.lastUpdatedLabel")} {t("mvpTerms.dateValue")} • global@influ-link.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
