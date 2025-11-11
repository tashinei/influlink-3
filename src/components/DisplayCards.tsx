"use client";

import DisplayCardProps from "./ui/display-cards";
import { Sparkles, TrendingUp, Zap, Users, Shield, Target } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

// Cards for creators (influencers)
const creatorCards = [
  {
    icon: <Sparkles className="size-4 text-white" />,
    title: "Незабавно сътрудничество",
    description: "Бъдете избрани от стотици бизнеси веднага.",
    date: "InfluLink",
    iconClassName: "text-primary",
    titleClassName: "text-white",
    className:
      "[grid-area:stack] translate-x-0 hover:-translate-y-20 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <TrendingUp className="size-4 text-white" />,
    title: "Лесно управление",
    description: "Всички кампании и плащания на едно място.",
    date: "InfluLink",
    iconClassName: "text-primary",
    titleClassName: "text-white",
    className:
      "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Zap className="size-4 text-white" />,
    title: "Бърз старт",
    description: "Започнете кариерата си като инфлуенсър сега.",
    date: "InfluLink",
    iconClassName: "text-secondary",
    titleClassName: "text-white",
    className:
      "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-5",
  },
];

// Cards for brands
const brandCards = [
  {
    icon: <Users className="size-4 text-white" />,
    title: "Достъп до общност",
    description: "Свържете се с хиляди инфлуенсъри за кампании.",
    date: "InfluLink",
    iconClassName: "text-primary",
    titleClassName: "text-white",
    className:
      "[grid-area:stack] translate-x-0 hover:-translate-y-20 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Shield className="size-4 text-white" />,
    title: "Сигурност и прозрачност",
    description: "Всички транзакции и кампании са защитени.",
    date: "InfluLink",
    iconClassName: "text-secondary",
    titleClassName: "text-white",
    className:
      "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Target className="size-4 text-white" />,
    title: "Персонализирани кампании",
    description: "Създавайте кампании, които съответстват на вашия бранд.",
    date: "InfluLink",
    iconClassName: "text-primary",
    titleClassName: "text-white",
    className:
      "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-5",
  },
];

export function DisplayCards() {
  const isCreator = useUserStore((state) => state.accountType) === "creator";
  const isBrand = useUserStore((state) => state.accountType) === "brand";

  const sectionCards = isCreator ? creatorCards : brandCards;

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Column: Statement with Gradient Text */}
        <div className="lg:pl-10">
          <h2
            className="text-4xl md:text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight
            bg-gradient-to-r from-secondary to-primary text-gradient"
          >
            {isCreator ? (
              <>
                <span className="block">Не чакайте с месеци.</span>
                <span className="block text-5xl bg-gradient-to-l from-secondary to-primary text-gradient">
                  Започнете кариерата си сега.
                </span>
              </>
            ) : (
              <>
                <span className="block">Не губете време.</span>
                <span className="block text-5xl bg-gradient-to-l from-primary to-secondary text-gradient">
                  Свържете се с инфлуенсъри моментално.
                </span>
              </>
            )}
          </h2>

          <p className="mt-8 text-2xl font-semibold text-muted-foreground max-w-lg">
            {isCreator
              ? "Бъдете избрани от стотици бизнеси."
              : "Управлявайте кампаниите си ефективно и лесно."}
          </p>

          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            {isCreator
              ? "Нашата платформа свързва инфлуенсъри и брандове моментално, елиминирайки дългите преговори и забавяния. Фокусирайте се върху създаването на съдържание, а ние ще се погрижим за сътрудничеството и плащанията."
              : "Нашата платформа улеснява брандовете да откриват подходящи инфлуенсъри, създават кампании и управляват плащанията бързо и прозрачно."}
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
