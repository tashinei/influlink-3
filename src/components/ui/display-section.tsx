import { PhoneMockup } from "./phone-mockup";
import { CollaborationChat } from "./collaboration-chat";
import { useTranslation } from "@/hooks/useTranslation";

interface DisplaySectionProps {
  accountType?: "creator" | "brand";
}

export function DisplaySection({ accountType = "creator" }: DisplaySectionProps) {
  const isCreator = accountType === "creator";
  const { t } = useTranslation();

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-[white]">
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Column: Statement with Gradient Text */}
        <div className="order-1 lg:pl-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {isCreator ? (
              <>
                <span className="block text-4xl text-foreground">{t("creatorAbout.displayCards.title")}</span>
                <span className="block text-3xl sm:text-4xl md:text-5xl mt-2 bg-gradient-to-r from-secondary to-primary text-gradient">
                  {t("creatorAbout.displayCards.coloredTitle")}
                </span>
              </>
            ) : (
              <>
                <span className="block text-4xl text-foreground">{t("brandAbout.displayCards.title")}</span>
                <span className="block text-3xl sm:text-4xl md:text-5xl mt-2 bg-gradient-to-r from-secondary to-primary text-gradient">
                  {t("brandAbout.displayCards.coloredTitle")}
                </span>
              </>
            )}
          </h2>

          <p className="mt-6 sm:mt-8 text-xl sm:text-2xl font-semibold text-foreground max-w-lg">
            {isCreator
              ? t("creatorAbout.displayCards.subtitle")
              : t("brandAbout.displayCards.subtitle")}
          </p>

          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-lg">
            {isCreator
              ? t("creatorAbout.displayCards.description")
              : t("brandAbout.displayCards.description")}
          </p>
        </div>

        {/* Right Column: Phone Mockup with Analytics */}
        <div className="order-2 flex justify-center lg:justify-end">
          <PhoneMockup>
            <CollaborationChat userType={accountType}/>
          </PhoneMockup>
        </div>
      </div>
    </section>
  );
}
