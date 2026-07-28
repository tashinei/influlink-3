import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Mail, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

/**
 * Status page shown to a user after Meta's data-deletion callback runs
 * (`POST /api/instagram/deletion-callback` returns a URL pointing here with the
 * confirmation code). Meta requires this URL to resolve during App Review.
 */
const DataDeletionStatus = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const code = params.get("id");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
      <Helmet>
        <title>{t("dataDeletionStatus.seoTitle")} | InfluLink</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-secondary via-tertiary to-primary relative overflow-hidden">
        <div className="container mx-auto px-4 text-center text-white relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            {t("dataDeletionStatus.heroTitle")}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 font-medium leading-relaxed">
            {t("dataDeletionStatus.heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Status card */}
      <section className="py-16 -mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-[2.5rem] border-slate-100 overflow-hidden shadow-2xl shadow-blue-900/5">
              <CardContent className="p-8 md:p-14 text-center space-y-8">
                {code ? (
                  <>
                    <div className="w-20 h-20 mx-auto bg-green-50 rounded-3xl flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {t("dataDeletionStatus.confirmedTitle")}
                      </h2>
                      <p className="text-slate-600 leading-relaxed">
                        {t("dataDeletionStatus.confirmedText")}
                      </p>
                    </div>

                    {/* Confirmation code */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        {t("dataDeletionStatus.codeLabel")}
                      </p>
                      <p className="font-mono text-sm md:text-base font-semibold text-slate-800 break-all">
                        {code}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 w-fit mx-auto">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                        {t("dataDeletionStatus.verifiedBadge")}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto bg-amber-50 rounded-3xl flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-amber-500" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {t("dataDeletionStatus.noCodeTitle")}
                      </h2>
                      <p className="text-slate-600 leading-relaxed">
                        {t("dataDeletionStatus.noCodeText")}
                      </p>
                    </div>
                  </>
                )}

                {/* Contact + back */}
                <div className="pt-4 space-y-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 leading-relaxed pt-4">
                    {t("dataDeletionStatus.contactLine")}
                  </p>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between max-w-sm mx-auto">
                    <span className="text-primary font-bold text-sm">global@influ-link.com</span>
                    <Mail className="w-4 h-4 text-slate-300" />
                  </div>
                  <Link
                    to="/data-deletion"
                    className="inline-block text-sm font-semibold text-primary hover:underline"
                  >
                    {t("dataDeletionStatus.learnMore")}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DataDeletionStatus;
