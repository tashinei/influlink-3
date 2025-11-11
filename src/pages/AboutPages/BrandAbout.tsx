import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Benefits } from "@/components/Benefits";
import { DisplayCards } from "@/components/DisplayCards";
import waitlistHero from "@/assets/hero-gradient-portrait.jpg";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

const BrandAbout = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Example FAQ and Values for brands
  const faqs = [
    {
      question: "Какво е InfluLink?",
      answer:
        "Платформа за свързване на брандове с инфлуенсъри, за да постигнете автентични маркетингови резултати.",
    },
    {
      question: "Как мога да се свържа с инфлуенсъри?",
      answer:
        "Изберете подходящите инфлуенсъри по ниша и аудитория, след което стартирайте кампании лесно през платформата.",
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Мисия",
      description:
        "Да улесним брандовете в намирането на правилните инфлуенсъри и постигане на измерими резултати.",
    },
    {
      icon: Heart,
      title: "Ценности",
      description:
        "Прозрачност, ефективност и автентичност в кампаниите, които създаваме за вас.",
    },
    {
      icon: Zap,
      title: "Визия",
      description:
        "Да бъдем водещата платформа за инфлуенсър маркетинг, която помага на бизнеса да расте чрез истински връзки.",
    },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ position: "relative", top: "-80px" }}>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-gray to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            За брандове
          </h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Свържете се с правилните инфлуенсъри и изградете успешни маркетингови кампании
          </p>
        </div>
      </section>

      <DisplayCards />

      {/* Waitlist Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="md:max-w-[60%] 2xl:max-w-[50%] p-0 overflow-hidden">
          <div className="p-8 flex flex-col items-center justify-center">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl">Запишете се в чакащата листа</DialogTitle>
              <DialogDescription>Получете ранен достъп до платформата</DialogDescription>
            </DialogHeader>
            <Button onClick={() => setIsDialogOpen(false)}>Затвори</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Benefits Section */}
      <section className="py-20 bg-background text-center">
        <h2 className="text-4xl font-bold mb-6">Ползи за брандове</h2>
        <Benefits />
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Какво ни движи</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="rounded-2xl border-border hover:border-primary transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 mb-6 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Често задавани въпроси</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-primary rounded-2xl px-6 data-[state=open]:border-secondary transition-all">
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-semibold pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-base">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default BrandAbout;
