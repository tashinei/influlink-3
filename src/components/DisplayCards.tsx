"use client";

import DisplayCardProps from "./ui/display-cards";
import { Sparkles, TrendingUp, Zap, Users, Shield, Target } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useTranslation } from "@/hooks/useTranslation";
// Cards for creators (influencers)

export function DisplayCards({ isCreator }) {
  const { t } = useTranslation();

  const brandCards = [
    {
      icon: <Sparkles className="size-4 text-white" />,
      title: t("brandAbout.displayCardsDesktop.card3.title"),
      description: t("brandAbout.displayCardsDesktop.card3.subtitle"),
      date: "InfluLink",
      iconClassName: "text-primary",
      titleClassName: "text-white",
      className:
        "[grid-area:stack] translate-x-0 hover:-translate-y-20 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <TrendingUp className="size-4 text-white" />,
      title: t("brandAbout.displayCardsDesktop.card2.title"),
      description: t("brandAbout.displayCardsDesktop.card2.subtitle"),
      date: "InfluLink",
      iconClassName: "text-primary",
      titleClassName: "text-white",
      className:
        "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Zap className="size-4 text-white" />,
      title: t("brandAbout.displayCardsDesktop.card1.title"),
      description: t("brandAbout.displayCardsDesktop.card1.subtitle"),
      date: "InfluLink",
      iconClassName: "text-secondary",
      titleClassName: "text-white",
      className:
        "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-5",
    },
  ];

  // Cards for brands
  const creatorCards = [
    {
      icon: <Users className="size-4 text-white" />,
      title: t("creatorAbout.displayCardsDesktop.card3.title"),
      description: t("creatorAbout.displayCardsDesktop.card3.subtitle"),
      date: "InfluLink",
      iconClassName: "text-primary",
      titleClassName: "text-white",
      className:
        "[grid-area:stack] translate-x-0 hover:-translate-y-20 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Shield className="size-4 text-white" />,
      title: t("creatorAbout.displayCardsDesktop.card2.title"),
      description: t("creatorAbout.displayCardsDesktop.card2.subtitle"),
      date: "InfluLink",
      iconClassName: "text-secondary",
      titleClassName: "text-white",
      className:
        "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Target className="size-4 text-white" />,
      title: t("creatorAbout.displayCardsDesktop.card1.title"),
      description: t("creatorAbout.displayCardsDesktop.card1.subtitle"),
      date: "InfluLink",
      iconClassName: "text-primary",
      titleClassName: "text-white",
      className:
        "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-5",
    },
  ];

  const sectionCards = isCreator ? creatorCards : brandCards;

  return (
    <section className="py-24 md:py-32 bg-[white]">
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Column: Statement with Gradient Text */}
        <div className="lg:pl-10">
          <h2
            className="text-4xl md:text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight
            bg-gradient-to-r from-secondary to-primary text-gradient"
          >
            {isCreator ? (
              <>
                <span className="block">{t("creatorAbout.displayCards.title")}</span>
                <span className="block text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight
            bg-gradient-to-r from-secondary to-primary text-gradient" style={{fontSize:"50px"}}>
                  {t("creatorAbout.displayCards.coloredTitle")}
                </span>
              </>
            ) : (
              <>
                <span className="block">{t("brandAbout.displayCards.title")}</span>
                <span className="block text-5xl bg-gradient-to-l from-primary to-secondary text-gradient">
                  {t("brandAbout.displayCards.coloredTitle")}
                </span>
              </>
            )}
          </h2>

          <p className="mt-8 text-2xl font-semibold text-[#2b2b2b] max-w-lg">
            {isCreator
              ? t("creatorAbout.displayCards.subtitle")
              : t("brandAbout.displayCards.subtitle")}
          </p>

          <p className="mt-4 text-lg text-[#2b2b2b] max-w-lg">
            {isCreator
              ? t("creatorAbout.displayCards.description")
              : t("brandAbout.displayCards.description")}
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="scale-90 md:scale-100">
            <DisplayCardProps cards={sectionCards} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function useT(accesor) {
  const { t } = useTranslation();
  return t(accesor);
}
