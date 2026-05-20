import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  ShieldCheck,
  Zap,
  MessageSquare,
  Users,
  TrendingUp,
  CheckCircle2,
  Lock,
  ArrowRight,
  Briefcase
} from "lucide-react";

const AboutPage = () => {
  const { t } = useTranslation();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const handleJoinClick = (type: "creator" | "brand") => {
    navigate(`/?register=true&type=${type}`);
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const navigate = useNavigate();

  // Helper for mapped arrays from translation file
  const stats = t('aboutPage.stats', { returnObjects: true }) as any[];
  const creatorBenefits = t('aboutPage.dual_value.creators.benefits', { returnObjects: true }) as string[];
  const brandBenefits = t('aboutPage.dual_value.brands.benefits', { returnObjects: true }) as string[];
  const features = t('aboutPage.solution.features', { returnObjects: true }) as string[];

  return (
    <main className="bg-background font-rubik selection:bg-primary/30">

      {/* --- SECTION 1: AWARENESS --- */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-12">
            {/* We split by the keyword 'global' (EN) or 'глобално' (BG). 
          The regex /global|глобално/i handles both cases.
      */}
            {t('aboutPage.hero.title').split(/global|глобално/i)[0]}

            <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              {t('aboutPage.hero.title').includes('глобално') ? 'глобално' : 'global'}
            </span>

            {t('aboutPage.hero.title').split(/global|глобално/i)[1]}
          </h1>

          <p className="text-xl md:text-2xl text-black max-w-4xl leading-relaxed font-light">
            <span className="font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              InfluLink
            </span> {t('aboutPage.hero.description')}
          </p>
        </div>
      </section>

      {/* --- SECTION 2: INTEREST --- */}
      <section className="bg-gradient-to-br from-secondary to-primary py-24 px-6 border-y border-border/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight text-white">
              {t('aboutPage.problem.title')}
            </h2>
            <div className="space-y-6 text-lg text-white leading-relaxed">
              <p>
                {t('aboutPage.problem.stats_highlight')}
              </p>
              <div className="bg-background p-6 rounded-2xl border border-primary/20 shadow-sm">
                <p className="text-md italic text-black">
                  "{t('aboutPage.problem.market_insight.quote')}"
                </p>
                <p className="text-xs mt-2 font-bold uppercase tracking-wider opacity-60 text-black">
                  — {t('aboutPage.problem.market_insight.source')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white text-black p-8 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                {t('aboutPage.solution.title')}
              </h3>
              <p className="opacity-90">{t('aboutPage.solution.description')}</p>
              <ul className="space-y-2 text-sm opacity-80">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white text-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              {t('aboutPage.whyUs.title')}
            </h2>
            <p className="text-black">{t('aboutPage.whyUs.subtitle')}</p>
          </div>

          {/* The Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, i) => (
              <div key={i} className="p-8 border border-border rounded-3xl hover:shadow-lg transition-shadow bg-muted/10">
                <div className="text-4xl font-black mb-2 bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-lg font-bold mb-2">{stat.label}</div>
                <div className="text-md text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>

          {/* NEW: Selling Points List */}
          <div className="max-w-4xl mx-auto border-t pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {(t('aboutPage.whyUs.sellingPoints', { returnObjects: true }) as string[]).map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                  <span className="text-lg font-medium leading-tight">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: DUAL VALUE --- */}
      <section className="py-24 px-6 bg-gradient-to-br from-secondary to-primary text-white">
        <section className="pb-20 px-6 bg-transparent">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-black text-white">
              {t('aboutPage.status.title')}
            </h2>
            <div className="space-y-6 text-lg md:text-xl text-white leading-relaxed">
              <p className="font-bold">
                {t('aboutPage.status.subtitle')}
              </p>
              <p className="font-light">
                {t('aboutPage.status.description')}
              </p>
              <div className="p-6 bg-muted/30 rounded-2xl border-l-4 border-white italic text-md font-bold">
                {t('aboutPage.status.waitingListNote')}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Creators Side */}
          <div className="p-10 rounded-3xl bg-white border border-white/10 space-y-6 shadow-2xl">
            <Users className="h-10 w-10 text-secondary" />
            <h3 className="text-3xl font-bold text-black">
              {t('aboutPage.dual_value.creators.title')}
            </h3>
            <ul className="space-y-4">
              {creatorBenefits.map((item, i) => (
                <li key={i} className="flex items-start gap-3 font-bold bg-gradient-to-br from-secondary to-primary bg-clip-text text-transparent">
                  {/* Added shrink-0 to prevent icon squishing */}
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                  <span className="leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands Side */}
          <div className="p-10 rounded-3xl bg-white border border-white/10 space-y-6 shadow-2xl">
            <Briefcase className="h-10 w-10 text-secondary" />
            <h3 className="text-3xl font-bold text-black">
              {t('aboutPage.dual_value.brands.title')}
            </h3>
            <ul className="space-y-4">
              {brandBenefits.map((item, i) => (
                <li key={i} className="flex items-start gap-3 font-bold bg-gradient-to-br from-secondary to-primary bg-clip-text text-transparent">
                  {/* Added shrink-0 to prevent icon squishing */}
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                  <span className="leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: DECISION --- */}
      <section className="py-32 px-6 text-center bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block bg-gradient-to-br from-secondary to-primary text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
            {t('aboutPage.decision.launch_date')}
          </div>
          <h2 className="text-4xl md:text-6xl font-black">{t('aboutPage.decision.title')}</h2>
          <p className="text-xl bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent max-w-2xl mx-auto font-bold">
            {t('aboutPage.decision.perks')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <button
              onClick={() => handleJoinClick("brand")}
              className="group flex items-center justify-center gap-2 bg-gradient-to-br from-secondary to-primary text-white px-10 py-5 rounded-full font-bold hover:scale-105 transition-transform shadow-2xl"
            >
              {t('aboutPage.decision.cta_brand')} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleJoinClick("creator")}
              className="group flex items-center justify-center gap-2 border border-foreground px-10 py-5 rounded-full font-bold hover:bg-foreground hover:text-background transition-all"
            >
              {t('aboutPage.decision.cta_creator')} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

    </main>
  );
};

export default AboutPage;