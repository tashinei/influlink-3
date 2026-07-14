import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

const NOISE_PATTERN =
  'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")';

export type TierType = {
  name: string;
  priceMonthly: string;
  priceAnnual?: string;
  description: string;
  isPopular?: boolean;
  features: string[];
  cta?: string;
  href?: string;
};

export interface PricingGlassProps {
  title?: string;
  description?: string;
  tiers: TierType[];
  className?: string;
  currency?: string;
  period?: string;
  popularLabel?: string;
  showToggle?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
}

// Lightweight reveal-on-scroll (no animation library).
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);
  return { ref, inView };
}

const REVEAL = "transition-all duration-700 ease-out motion-reduce:transition-none";
const HIDDEN = "opacity-0 translate-y-6";
const SHOWN = "opacity-100 translate-y-0";

function Price({ value, currency, period }: { value: string; currency: string; period: string }) {
  const isNumeric = /^[\d.,]/.test(value);
  if (!isNumeric) {
    return (
      <span
        key={value}
        className="block text-4xl font-bold text-white tracking-tight leading-none"
        style={{ animation: "pgPriceIn 0.35s cubic-bezier(0.22,1,0.36,1)" }}
      >
        {value}
      </span>
    );
  }
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-white/70 text-2xl font-medium tracking-tight">{currency}</span>
      <div className="h-[56px] overflow-hidden flex items-center">
        <span
          key={value}
          className="block text-[56px] font-bold text-white tracking-tighter leading-none"
          style={{ animation: "pgPriceIn 0.35s cubic-bezier(0.22,1,0.36,1)" }}
        >
          {value}
        </span>
      </div>
      <span className="text-white/70 text-base font-medium ml-1">{period}</span>
    </div>
  );
}

function PricingCard({
  tier,
  isAnnual,
  inView,
  index,
  currency,
  period,
  popularLabel,
  widthClass,
}: {
  tier: TierType;
  isAnnual: boolean;
  inView: boolean;
  index: number;
  currency: string;
  period: string;
  popularLabel: string;
  widthClass: string;
}) {
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - top}px`);
  }

  const price = isAnnual && tier.priceAnnual ? tier.priceAnnual : tier.priceMonthly;

  return (
    <div
      className={`${widthClass} ${REVEAL} ${inView ? SHOWN : HIDDEN}`}
      style={{ transitionDelay: `${index * 100 + 80}ms` }}
    >
      <div
        onMouseMove={handleMouseMove}
        style={{ ["--mx" as string]: "50%", ["--my" as string]: "50%" } as React.CSSProperties}
        className={`group relative h-full w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-secondary to-primary flex flex-col transition-transform duration-500 ${
          tier.isPopular
            ? "border border-white/40 shadow-[0_32px_64px_-12px_hsl(var(--primary)/0.5),0_0_60px_hsl(var(--primary)/0.25)] md:-translate-y-4"
            : "border border-white/15 shadow-[0_24px_48px_-16px_hsl(var(--primary)/0.35)]"
        }`}
      >
        {/* Mouse-follow highlight */}
        <div
          className="absolute inset-0 z-0 pointer-events-none rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: "radial-gradient(500px at var(--mx) var(--my), rgba(255,255,255,0.25), transparent)",
          }}
        />

        {tier.isPopular && (
          <div
            className="absolute inset-0 z-0 rounded-[28px] pointer-events-none p-px"
            style={{
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          >
            <div
              className="absolute -inset-full animate-[spin_4s_linear_infinite] motion-reduce:animate-none"
              style={{ background: "conic-gradient(from 0deg, transparent 65%, rgba(255,255,255,0.95) 100%)" }}
            />
          </div>
        )}

        <div
          className="absolute inset-0 z-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: NOISE_PATTERN }}
        />

        {tier.isPopular && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-primary rounded-b-xl text-xs font-bold shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-10 whitespace-nowrap">
            {popularLabel}
          </div>
        )}

        <div className="relative z-10 flex flex-col p-6 md:p-7 flex-1">
          <h3 className="text-lg font-semibold text-white tracking-wide mt-2">{tier.name}</h3>

          <div className="mt-4 mb-3 min-h-[64px] flex items-center">
            <Price value={price} currency={currency} period={period} />
          </div>

          <p className="text-white/80 text-[13px] leading-relaxed mb-6 min-h-[56px]">{tier.description}</p>

          <div className="w-full h-px bg-white/25 mb-6" />

          <div className="flex flex-col gap-3.5 mb-8 flex-1">
            {tier.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="shrink-0 flex items-center justify-center w-5 h-5 mt-0.5 rounded-full bg-white/25 border border-white/40">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-white/90 font-medium text-[13px] leading-tight">{feat}</span>
              </div>
            ))}
          </div>

          {tier.href ? (
            <a
              href={tier.href}
              className={`block text-center w-full py-3.5 rounded-[14px] font-semibold text-[14px] transition-all duration-300 ${
                tier.isPopular
                  ? "bg-white text-primary hover:bg-white/90 hover:scale-[1.02] shadow-lg"
                  : "bg-white/15 text-white border border-white/30 hover:bg-white/25 hover:scale-[1.02]"
              }`}
            >
              {tier.cta || "Get Started"}
            </a>
          ) : (
            <button
              type="button"
              className={`w-full py-3.5 rounded-[14px] font-semibold text-[14px] transition-all duration-300 ${
                tier.isPopular
                  ? "bg-white text-primary hover:bg-white/90 hover:scale-[1.02] shadow-lg"
                  : "bg-white/15 text-white border border-white/30 hover:bg-white/25 hover:scale-[1.02]"
              }`}
            >
              {tier.cta || "Get Started"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PricingGlass({
  title = "Simple, transparent pricing.",
  description = "Choose the perfect plan for your needs.",
  tiers,
  className,
  currency = "$",
  period = "/mo",
  popularLabel = "Most Popular",
  showToggle = false,
  titleClassName = "text-white",
  descriptionClassName = "text-white/50",
}: PricingGlassProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const { ref, inView } = useInView<HTMLDivElement>();

  const cols = tiers.length;
  const perRow = cols <= 3 ? cols : cols === 4 ? 2 : 3;
  const cardWidth =
    perRow === 3
      ? "w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-16px)] max-w-[380px]"
      : perRow === 2
      ? "w-full sm:w-[calc(50%-10px)] max-w-[420px]"
      : "w-full max-w-[420px]";

  return (
    <div ref={ref} className={`w-full flex flex-col items-center justify-center gap-12 relative ${className || ""}`}>
      <style>{`@keyframes pgPriceIn { from { opacity: 0; transform: translateY(24px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }`}</style>

      <div className={`flex flex-col items-center gap-8 relative z-20 w-full ${REVEAL} ${inView ? SHOWN : HIDDEN}`}>
        <div className="text-center space-y-4 px-4">
          <h2 className={`text-4xl md:text-5xl font-bold tracking-tight ${titleClassName}`}>{title}</h2>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto ${descriptionClassName}`}>{description}</p>
        </div>

        {showToggle && (
          <div className="relative p-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`relative px-6 md:px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-300 z-10 ${
                !isAnnual ? "text-white" : "text-primary/60 hover:text-primary"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`relative px-6 md:px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-300 z-10 ${
                isAnnual ? "text-white" : "text-primary/60 hover:text-primary"
              }`}
            >
              Annually
              <span className="absolute -top-3 -right-3 md:-right-6 px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-full tracking-wider shadow-lg">
                SAVE 20%
              </span>
            </button>
            <div
              className="absolute left-1.5 top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full bg-gradient-to-br from-secondary to-primary shadow-md transition-transform duration-300 ease-out"
              style={{ transform: isAnnual ? "translateX(100%)" : "translateX(0%)" }}
            />
          </div>
        )}
      </div>

      <div className="relative w-full flex flex-wrap justify-center items-stretch gap-5 lg:gap-6 z-20">
        {tiers.map((tier, index) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            isAnnual={isAnnual}
            inView={inView}
            index={index}
            currency={currency}
            period={period}
            popularLabel={popularLabel}
            widthClass={cardWidth}
          />
        ))}
      </div>
    </div>
  );
}
