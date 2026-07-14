import { Fragment, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Check } from "lucide-react";
import { PricingGlass, type TierType } from "@/components/ui/pricing-glass";
import { useTranslation } from "@/hooks/useTranslation";
import { translations } from "@/i18n";

const PLAN_NAMES = ["Essential", "Starter", "Growth", "Pro", "Enterprise"];
const TIER_KEYS = ["essential", "starter", "growth", "pro", "enterprise"] as const;
const PRICES = ["19", "49", "99", "199", ""]; 
const HREFS = ["/register/brand", "/register/brand", "/register/brand", "/register/brand", "/contact"];
const POPULAR_INDEX = 2; // Growth

const CREATOR_KEYS = ["new", "pro", "top"] as const;
const CREATOR_POPULAR = 1; // Pro Creator

type PricingContent = {
  seoTitle: string;
  seoDescription: string;
  title: string;
  description: string;
  currency: string;
  period: string;
  popularLabel: string;
  ctaStart: string;
  ctaContact: string;
  customPrice: string;
  comparisonTitle: string;
  comparisonSubtitle: string;
  featuresLabel: string;
  audience: { brands: string; creators: string };
  creators: {
    title: string;
    description: string;
    commissionLabel: string;
    note: string;
    tiers: Record<string, { name: string; price: string; description: string; features: string[] }>;
  };
  tiers: Record<string, { description: string; features: string[] }>;
  comparison: {
    groups: { title: string; rows: { label: string; values: (boolean | string)[] }[] }[];
  };
};

const getDiscountedPrice = (priceStr: string, isAnnual: boolean): string => {
  if (!priceStr || !isAnnual) return priceStr;
  const num = parseFloat(priceStr);
  return isNaN(num) ? priceStr : Math.round(num * 0.8).toString();
};

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/25 border border-white/40">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </span>
    );
  }
  if (value === false) {
    return <span className="text-white/40">—</span>;
  }
  return <span className="text-white/90 text-[13px] font-semibold">{value}</span>;
}

function AudienceToggle({
  value,
  labels,
  onChange,
}: {
  value: "brands" | "creators";
  labels: { brands: string; creators: string };
  onChange: (v: "brands" | "creators") => void;
}) {
  return (
    <div className="mx-auto inline-flex p-1.5 rounded-full bg-primary/10 border border-primary/20">
      {(["brands", "creators"] as const).map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => onChange(a)}
          className={`px-6 md:px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            value === a
              ? "bg-gradient-to-br from-secondary to-primary text-white shadow-md"
              : "text-primary hover:text-primary/70"
          }`}
        >
          {labels[a]}
        </button>
      ))}
    </div>
  );
}

function BillingToggle({
  isAnnual,
  onChange,
}: {
  isAnnual: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-black" : "text-gray-500"}`}>
        Monthly
      </span>
      <button
        type="button"
        onClick={() => onChange(!isAnnual)}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-br from-secondary to-primary transition-colors focus:outline-none shadow-sm cursor-pointer"
        aria-label="Toggle annual billing"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
            isAnnual ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onChange(true)}>
        <span className={`text-sm font-semibold transition-colors ${isAnnual ? "text-black" : "text-gray-500"}`}>
          Annual
        </span>
        <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-xs font-bold text-primary shadow-sm border border-primary/20">
          Save 20%
        </span>
      </div>
    </div>
  );
}

function ComparisonTable({ p, isAnnual }: { p: PricingContent; isAnnual: boolean }) {
  return (
    <div className="relative z-10 w-full">
      <div className="text-center mb-10 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">{p.comparisonTitle}</h2>
        <p className="text-gray-600 text-base md:text-lg mt-3 max-w-2xl mx-auto">{p.comparisonSubtitle}</p>
      </div>

      <div className="rounded-[24px] border border-white/20 bg-gradient-to-br from-secondary to-primary overflow-hidden shadow-[0_24px_48px_-16px_hsl(var(--primary)/0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-5 text-white/80 text-sm font-medium w-[240px]">{p.featuresLabel}</th>
                {PLAN_NAMES.map((name, i) => {
                  const displayPrice =
                    i === TIER_KEYS.length - 1
                      ? p.customPrice
                      : `${p.currency}${getDiscountedPrice(PRICES[i], isAnnual)}${p.period}`;

                  return (
                    <th
                      key={name}
                      className={`p-5 text-center align-bottom ${i === POPULAR_INDEX ? "bg-white/15" : ""}`}
                    >
                      <div className="text-white text-sm font-semibold">{name}</div>
                      <div className="text-white/80 text-xs font-medium mt-0.5">{displayPrice}</div>
                      {i === POPULAR_INDEX && (
                        <span className="block text-[10px] font-bold text-white uppercase tracking-wider mt-1">
                          {p.popularLabel}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {p.comparison.groups.map((group) => (
                <Fragment key={group.title}>
                  <tr className="bg-white/10">
                    <td
                      colSpan={PLAN_NAMES.length + 1}
                      className="px-5 py-2.5 text-white text-xs font-bold uppercase tracking-wider"
                    >
                      {group.title}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.label} className="border-b border-white/15 last:border-0">
                      <td className="p-5 text-white/90 text-sm font-medium align-middle">{row.label}</td>
                      {row.values.map((value, ci) => (
                        <td
                          key={ci}
                          className={`p-5 text-center align-middle ${ci === POPULAR_INDEX ? "bg-white/10" : ""}`}
                        >
                          <Cell value={value} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const { language } = useTranslation();
  const p = translations[language].pricing as unknown as PricingContent;
  const [audience, setAudience] = useState<"brands" | "creators">("brands");
  const [isAnnual, setIsAnnual] = useState(false);

  const brandTiers: TierType[] = TIER_KEYS.map((key, i) => {
    const isEnterprise = i === TIER_KEYS.length - 1;
    const rawPrice = isEnterprise ? p.customPrice : getDiscountedPrice(PRICES[i], isAnnual);

    // Securely lock the bubble inside the card container next to the price
    const priceWithBubble =
      isAnnual && !isEnterprise
        ? ((
            <span className="inline-flex items-center gap-1.5 vertical-align-middle">
              <span>{rawPrice}</span>
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wide whitespace-nowrap leading-none h-4 self-center transform -translate-y-1 shadow-sm">
                -20%
              </span>
            </span>
          ) as unknown as string)
        : rawPrice;

    return {
      name: PLAN_NAMES[i],
      priceMonthly: priceWithBubble,
      description: p.tiers[key].description,
      features: p.tiers[key].features,
      isPopular: i === POPULAR_INDEX,
      cta: isEnterprise ? p.ctaContact : p.ctaStart,
      href: HREFS[i],
    };
  });

  const creatorTiers: TierType[] = CREATOR_KEYS.map((key, i) => ({
    name: p.creators.tiers[key].name,
    priceMonthly: p.creators.tiers[key].price,
    description: p.creators.tiers[key].description,
    features: p.creators.tiers[key].features,
    isPopular: i === CREATOR_POPULAR,
    cta: p.ctaStart,
    href: "/register/creator",
  }));

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-white">
      <Helmet>
        <title>{p.seoTitle}</title>
        <meta name="description" content={p.seoDescription} />
      </Helmet>

      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(55% 40% at 50% 0%, hsl(var(--secondary) / 0.12), transparent)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto py-20 md:py-28 px-4 flex flex-col gap-14">
        <div className="flex justify-center">
          <AudienceToggle value={audience} labels={p.audience} onChange={setAudience} />
        </div>

        {audience === "brands" ? (
          <div className="flex flex-col gap-24">
            <PricingGlass
              tiers={brandTiers}
              title={p.title}
              description={
                (
                  <span className="flex flex-col items-center gap-6 mt-1">
                    <span className="text-gray-600">{p.description}</span>
                    <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} />
                  </span>
                ) as unknown as string
              }
              currency={p.currency}
              period={p.period}
              popularLabel={p.popularLabel}
              titleClassName="text-black"
              descriptionClassName="text-gray-600"
            />
            <ComparisonTable p={p} isAnnual={isAnnual} />
          </div>
        ) : (
          <div className="flex flex-col gap-8 items-center">
            <PricingGlass
              tiers={creatorTiers}
              title={p.creators.title}
              description={p.creators.description}
              currency=""
              period={p.creators.commissionLabel}
              popularLabel={p.popularLabel}
              titleClassName="text-black"
              descriptionClassName="text-gray-600"
            />
            <p className="text-gray-500 text-sm text-center max-w-xl">{p.creators.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}