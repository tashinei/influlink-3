import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

/**
 * GDPR-oriented privacy policy. The content below is written to reflect what the
 * InfluLink codebase actually collects and which processors it actually uses
 * (Stripe, Meta/Instagram, Google, Resend, DigitalOcean). It is a thorough
 * starting point but MUST be reviewed by a qualified lawyer / DPO and a certified
 * Bulgarian translation added before it is relied upon in production.
 *
 * Effective date lives in one place: the `dateValue` i18n key.
 */

// Rich-text styling for the translated section bodies (rendered as HTML so that
// links, lists and tables stay inside a single translatable string per section).
const BODY_CLASS =
  "space-y-3 text-[15px] leading-relaxed " +
  "[&_a]:text-primary [&_a]:underline " +
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 " +
  "[&_.scroll]:overflow-x-auto " +
  "[&_table]:w-full [&_table]:text-sm " +
  "[&_thead_tr]:border-b-2 [&_thead_tr]:border-gray-200 [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-gray-500 " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-gray-100 [&_tbody_tr]:align-top [&_td]:py-3 [&_td]:pr-4 [&_td]:text-gray-700 [&_td_strong]:font-semibold [&_td_strong]:text-gray-900 " +
  "[&_.muted]:text-sm [&_.muted]:text-gray-500";

const Section = ({ title, html }: { title: string; html: string }) => (
  <div className="space-y-3">
    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
    <div className={BODY_CLASS} dangerouslySetInnerHTML={{ __html: html }} />
  </div>
);

const Privacy = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const quickCards = [
    { icon: Lock, title: t("privacy.cards.controllerTitle"), content: t("privacy.cards.controllerContent") },
    { icon: Eye, title: t("privacy.cards.dataTitle"), content: t("privacy.cards.dataContent") },
    { icon: Shield, title: t("privacy.cards.securityTitle"), content: t("privacy.cards.securityContent") },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
      <Helmet>
        <title>{t("privacy.heroTitle")} | InfluLink</title>
        <meta name="description" content={t("privacy.heroSubtitle")} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-primary via-secondary to-[#6EC5E9]">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">{t("privacy.heroTitle")}</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">{t("privacy.heroSubtitle")}</p>
          <p className="mt-6 text-sm uppercase tracking-widest opacity-80">{t("privacy.lastUpdatedLabel")} {t("privacy.dateValue")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Quick cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {quickCards.map((section, index) => (
              <Card key={index} className="rounded-2xl border-border text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <section.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="rounded-3xl border-border overflow-hidden">
              <CardContent className="p-8 md:p-12 space-y-10 text-gray-700">

                {/* Controller identity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-6 rounded-2xl border">
                  <div>
                    <p className="font-bold">{t("privacy.controller.controllerLabel")}</p>
                    <p>INFLULINK LTD.</p>
                  </div>
                  <div>
                    <p className="font-bold">{t("privacy.controller.officeLabel")}</p>
                    <p>{t("privacy.controller.officeValue")}</p>
                  </div>
                  <div>
                    <p className="font-bold">{t("privacy.controller.idLabel")}</p>
                    <p>208542977</p>
                  </div>
                  <div>
                    <p className="font-bold">{t("privacy.controller.contactLabel")}</p>
                    <p>global@influ-link.com</p>
                  </div>
                </div>

                {(t("privacy.body") as unknown as { title: string; html: string }[]).map((s, i) => (
                  <Section key={i} title={s.title} html={s.html} />
                ))}

                <div className="pt-8 text-center border-t border-gray-100">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    © 2026 INFLULINK LTD. • {t("privacy.controller.officeValue")} • {t("privacy.lastUpdatedLabel")} {t("privacy.dateValue")}
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

export default Privacy;
