import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Rocket, ArrowRight, Construction } from "lucide-react";

const MVPStatus = () => {
  // We use the colors from your HeroSection configuration
  // #90d5f3 (Light blue), #6EC5E9 (Medium), #1E88E5 (Deep blue)

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Animated Background Shaders - Mimicking your HeroSection style */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#90d5f3] opacity-20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1E88E5] opacity-20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-[95vw] max-w-[600px] p-8 md:p-12 text-center backdrop-blur-sm bg-gradient-to-br from-secondary via-tertiary to-primary border border-white/10 rounded-3xl shadow-2xl">
        {/* Icon / Status Badge */}
        <span
          className={`text-2xl text-white font-bold tracking-tight transition-colors duration-300`}
        >
          InfluLink
        </span>

        {/* Content - Using your Highlight style */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 mt-[20px]">
          Something <span className="text-[#90d5f3]">big</span> is underway
        </h1>

        <p className="text-lg text-white mb-10 leading-relaxed max-w-md mx-auto">
          We're currently fine-tuning our platform to ensure the best experience for our community.
          The build is in progress, but our waiting list is officially open.
        </p>

        {/* Action Button - Styled like your Primary Hero Button */}
        <div className="flex flex-col space-y-4">
          <Button
            asChild
            className="w-full h-14 text-lg font-bold bg-white hover:bg-white/90 text-secondary rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(30,136,229,0.4)]"
          >
            <a href="https://influ-link.com">
              Join the waiting list now! <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm text-white">
            <Construction className="h-4 w-4" />
            <span>Expected launch date: Mid 2026</span>
          </div>
        </div>

        {/* Features Preview - Visual Consistency with your form logic */}
        <div className="mt-12 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-white/5 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-secondary" />
            <span className="text-sm text-secondary text-left font-medium">Early access</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-white/5 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-secondary" />
            <span className="text-sm text-secondary text-left font-medium">Benefits for first-comers</span>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-white uppercase tracking-widest font-semibold">
            &copy; 2026 InfluLink | Secured by ReCAPTCHA
          </p>
        </div>
      </div>
    </div>
  );
};

export default MVPStatus;