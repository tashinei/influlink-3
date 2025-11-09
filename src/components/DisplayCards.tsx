// components/CollaborationBenefitSection.tsx (Revised - CSS Class)
"use client";

import DisplayCardProps from "./ui/display-cards";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

// (Keep the sectionCards definition the same as before)
const sectionCards = [
  {
    icon: <Sparkles className="size-4 text-white" />,
    title: "Незабавно сътрудничество",
    description: "Бъдете избрани от стотици бизнеси ведната.",
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

export function DisplayCards() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Column: Display Cards */}

        {/* Right Column: Statement with Gradient Text */}
        <div className="lg:pl-10">
          <h2
            className="text-4xl md:text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight
                       bg-gradient-to-r from-secondary to-primary text-gradient" // <- KEY CHANGE HERE
          >
            <span className="block">Не чакайте с месеци.</span>
            <span className="block text-5xl bg-gradient-to-l from-secondary to-primary text-gradient">
              Започнете кариерата си сега.
            </span>
          </h2>
          {/* Subtitle/Secondary statement */}
          <p className="mt-8 text-2xl font-semibold text-muted-foreground max-w-lg">
            Бъдете избрани от стотици бизнеси.
          </p>

          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            Нашата платформа свързва{" "}
            <span className="bg-gradient-to-l from-secondary to-primary text-gradient font-bold">
              инфлуенсъри
            </span>{" "}
            и{" "}
            <span className="bg-gradient-to-l from-primary to-secondary text-gradient font-bold">
              брандове
            </span>{" "}
            моментално, елиминирайки дългите преговори и забавяния. Фокусирайте
            се върху създаването на{" "}
            <span className="bg-gradient-to-l from-secondary to-primary text-gradient font-bold">
              съдържание
            </span>
            , а ние ще се погрижим за сътрудничеството и плащанията.
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
