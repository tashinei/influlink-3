import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/hooks/useTranslation";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"];

const FaqSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            {t("mvpFaq.title")}
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("mvpFaq.subtitle")}
          </p>
        </div>

        <Accordion type="single" collapsible className="flex flex-col gap-4 md:gap-6">
          {FAQ_KEYS.map((key) => (
            <AccordionItem
              key={key}
              value={key}
              className="border-none rounded-2xl bg-card/60 px-5 md:px-6"
            >
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-foreground hover:no-underline py-5">
                {t(`mvpFaq.${key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {t(`mvpFaq.${key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
