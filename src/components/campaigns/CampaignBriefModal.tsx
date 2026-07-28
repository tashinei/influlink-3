import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  DollarSign,
  Target,
  Users,
  Clock,
  ClipboardList,
  ListChecks,
} from "lucide-react";
import { BsFacebook, BsInstagram, BsX, BsYoutube } from "react-icons/bs";
import { useUserStore } from "@/store/useUserStore";
import { useTranslation } from "@/hooks/useTranslation";

const API_BASE = "https://api.influ-link.com";

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case "instagram":
      return <BsInstagram className="h-4 w-4" />;
    case "youtube":
      return <BsYoutube className="h-4 w-4" />;
    case "twitter":
    case "x":
      return <BsX className="h-4 w-4" />;
    case "facebook":
      return <BsFacebook className="h-4 w-4" />;
    case "tiktok":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    default:
      return null;
  }
};

const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: any | null;
  onApply?: (campaignId: string) => void;
}

export const CampaignBriefModal = ({ open, onOpenChange, campaign, onApply }: Props) => {
  const { t } = useTranslation();
  const isCreator = useUserStore((state) => state.accountType === "creator");

  if (!campaign) return null;

  const {
    name,
    description,
    status,
    budget,
    goal,
    type,
    niches = [],
    platforms = [],
    contentTypes = [],
    start_date,
    company_logo,
    isUrgent,
    deliverables,
    application_deadline,
    min_followers,
    requirements,
  } = campaign;

  const startDate = formatDate(start_date);
  const deadline = formatDate(application_deadline);

  const facts = [
    {
      icon: DollarSign,
      label: t("mvpCampaignBrief.budget"),
      value: `$${Number(budget || 0).toLocaleString()}`,
    },
    {
      icon: Calendar,
      label: t("mvpCampaignBrief.startDate"),
      value: startDate ?? t("mvpCampaignBrief.notSpecified"),
    },
    {
      icon: Clock,
      label: t("mvpCampaignBrief.applyBy"),
      value: deadline ?? t("mvpCampaignBrief.notSpecified"),
    },
    {
      icon: Users,
      label: t("mvpCampaignBrief.minFollowers"),
      value: min_followers ? `${Number(min_followers).toLocaleString()}+` : t("mvpCampaignBrief.notSpecified"),
    },
  ];

  const tagGroups = [
    { label: t("mvpCampaignBrief.platforms"), items: platforms, platform: true },
    { label: t("mvpCampaignBrief.contentTypes"), items: contentTypes },
    { label: t("mvpCampaignBrief.niches"), items: niches },
  ].filter((g) => g.items?.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] w-[95vw] max-w-2xl flex-col gap-0 p-0 overflow-hidden z-[50000]">
        {/* HERO */}
        <div className="relative h-32 shrink-0 bg-gradient-to-br from-secondary via-primary/60 to-tertiary">
          <div className="absolute left-7 top-4 flex flex-wrap gap-2 sm:left-9">
            <Badge className="border border-white/30 bg-white/20 text-white capitalize backdrop-blur-sm mt-5">
              {status || "Open"}
            </Badge>
            {isUrgent && (
              <Badge className="gap-1 border border-amber-300/40 bg-amber-100/90 text-amber-700">
                <Clock className="h-3 w-3" />
                {t("mvpCampaignBrief.urgent")}
              </Badge>
            )}
          </div>
          {/* Logo */}
          <div className="absolute -bottom-10 left-7 sm:left-9">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-card shadow-lg">
              {company_logo ? (
                <img src={`${API_BASE}${company_logo}`} alt={name} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-9 w-9 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* SCROLL BODY */}
        <div className="flex-1 overflow-y-auto px-7 pb-12 pt-14 sm:px-9">
          {/* Title */}
          <div className="mb-5">
            <h2 className="text-xl font-bold leading-tight text-foreground">{name}</h2>
            {type && <p className="text-sm capitalize text-muted-foreground">{type}</p>}
          </div>

          {/* About */}
          <section className="mb-6">
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              {t("mvpCampaignBrief.about")}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description || t("mvpCampaignBrief.noDescription")}
            </p>
          </section>

          {/* Key facts */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                <f.icon className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="text-sm font-bold text-foreground">{f.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{f.label}</p>
              </div>
            ))}
          </div>

          {/* What's needed */}
          <section className="mb-6 space-y-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <ListChecks className="h-4 w-4 text-primary" />
              {t("mvpCampaignBrief.whatsNeeded")}
            </h3>

            {goal && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{t("mvpCampaignBrief.goal")}:</span>
                <span className="capitalize">{goal}</span>
              </div>
            )}

            {deliverables && (
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  {t("mvpCampaignBrief.deliverables")}
                </p>
                <p className="text-sm text-foreground">{deliverables}</p>
              </div>
            )}

            {tagGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item: string) => (
                    <Badge key={item} variant="secondary" className="gap-1 text-xs font-medium">
                      {group.platform && <PlatformIcon platform={item} />}
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Requirements */}
          {requirements && (
            <section className="mb-2">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
                <ClipboardList className="h-4 w-4 text-primary" />
                {t("mvpCampaignBrief.requirements")}
              </h3>
              <p className="whitespace-pre-line rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                {requirements}
              </p>
            </section>
          )}
        </div>

        {/* FOOTER */}
        {isCreator && (
          <div className="shrink-0 border-t border-border bg-card/50 p-4 pb-8 sm:px-9 sm:py-12">
            <Button
              className="w-full bg-gradient-to-br from-tertiary via-secondary to-primary"
              disabled={campaign.hasApplied}
              onClick={() => {
                onApply?.(campaign.id);
                onOpenChange(false);
              }}
            >
              {campaign.hasApplied ? t("mvpCampaignBrief.applied") : t("mvpCampaignBrief.apply")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
