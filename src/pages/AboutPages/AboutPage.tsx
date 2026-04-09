import { useState } from "react";
// import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/hooks/useTranslation";
import { Globe, Rocket, Heart, ChevronRight, Users, Sparkles, Image as ImageIcon, CheckCircle2 } from "lucide-react";

// import CTASection from "@/components/CTASection";
// import RegisterSelectionDialog from "@/components/RegisterSelectionDialog";

const AboutPage = () => {
  const { t } = useTranslation();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const handleJoinClick = () => setIsRegisterOpen(true);

  // High-quality placeholders reflecting WordStream's advice to use "Real People" feel
  const placeholders = {
    founder: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop",
    team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
  };

  return (
    <main className="bg-background font-rubik selection:bg-primary/30">
      {/* <Helmet>
        <title>About InfluLink | Our Mission & Values</title>
      </Helmet> */}

      {/* --- WORDSTREAM STEP 1: THE BIG "WHY" (Emotional Headline) --- */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-12">
            We believe marketing is <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">human</span>.
          </h1>
          <p className="text-xl md:text-2xl text-black text-muted-foreground max-w-3xl leading-relaxed font-light">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">InfuLink</span> was founded to solve a single problem: the gap between brilliant creators and the brands that need them. We’re here to make that connection <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">effortless</span>.
          </p>
        </div>
      </section>

      {/* --- WORDSTREAM STEP 2: THE STORY (Hero's Journey) --- */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <span className="uppercase tracking-[0.4em] text-[15px] font-bold opacity-70">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              From a problem-solving idea to a global community.
            </h2>
            <div className="space-y-6 text-lg opacity-90 leading-relaxed font-normal">
              <p>
                We saw the frustration of brands spending thousands on campaigns that didn't resonate, and creators struggling to find fair partnerships.
              </p>
              <p>
                We set out on a quest to build a platform that prioritizes transparency over transactions. <br></br> Today, we are building a platform to support the voices of people across 40+ countries.
              </p>
            </div>
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden border-8 border-white/10 rotate-2">
            <div className="w-full h-full bg-white/30 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 opacity-40">
                <ImageIcon className="w-16 h-16" />
                <span className="text-xs uppercase tracking-widest font-bold">Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- WORDSTREAM STEP 3: SOCIAL PROOF & DATA --- */}
      <section className="py-24 px-6 bg-white text-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent text-3xl md:text-5xl font-bold mb-4">Trusted by you<span className="text-black">.</span></h2>
            <p className="text-black font-bold text-lg">Metrics that matter.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "50+", label: "Creators" },
              { val: "30+", label: "Top Brands" },
              { val: "98%", label: "Retention" },
              { val: "24h", label: "Avg Response" }
            ].map((stat, i) => (
              <div key={i} className="p-8 border border-white/5 bg-white/[0.02] rounded-2xl hover:border-primary/50 transition-colors">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">{stat.val}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- WORDSTREAM STEP 4: VALUES (The "What's in it for them") --- */}
      <section className="py-24 px-6 bg-gradient-to-br from-secondary to-primary">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3">
              <h2 className="text-4xl font-bold mb-6 text-white">What we stand by.</h2>
              <p className="text-muted-foreground leading-relaxed text-white">
                We don't just "care about quality." We live by three specific pillars that ensure your success.
              </p>
            </div>
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-10 text-white">
              {[
                { title: "Radical Transparency", desc: "No hidden fees, no gatekeepers. You see the data we see." },
                { title: "Human Support", desc: "Real people answering your calls, not just automated bots." },
                { title: "Fair Compensation", desc: "We ensure creators are paid what they are worth, every time." },
                { title: "Global Vision", desc: "Marketing without borders. We bridge cultures and markets." }
              ].map((v, i) => (
                <div key={i} className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-white shrink-0" />
                  <div>
                    <h4 className="font-bold text-xl mb-2">{v.title}</h4>
                    <p className="text-white text-sm">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- WORDSTREAM STEP 5: CTA (Guide the visitor) --- */}
      <section className="py-40 border-t border-border/10">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to be part of the story?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleJoinClick}
              className="bg-gradient-to-br from-secondary to-primary text-white px-10 py-5 rounded-full font-bold hover:scale-105 transition-transform shadow-xl"
            >
              Join now
            </button>
            <button className="border border-black px-10 py-5 rounded-full font-bold hover:bg-muted transition-colors">
              Learn more
            </button>
          </div>
        </div>
      </section>

      {/* <RegisterSelectionDialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen} /> */}
    </main>
  );
};

export default AboutPage;