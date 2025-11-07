import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSection } from "@/components/ui/hero-section-with-smooth-bg-shader";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Upload, TicketCheck, Gift, HeadphonesIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import waitlistHero from "@/assets/hero-gradient-portrait.jpg";
import { Benefits } from "@/components/Benefits";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizStep, setQuizStep] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    accountType: "",
    businessName: "",
    followers: "",
    niche: "",
  });

  const sendEmail = async () => {
    try {
      const response = await fetch("http://localhost:8080/influlink/send-email.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Формата е изпратена успешно!",
          description: "Ще получите потвърждение по имейл.",
          className: "bg-green-600 text-white border-none",
        });
      } else {
        toast({
          title: "Грешка при изпращане",
          description: "Моля, опитайте отново по-късно.",
          className: "bg-yellow-600 text-white border-none",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Възникна грешка",
        description: "Проверете интернет връзката си и опитайте пак.",
        className: "bg-red-600 text-white border-none",
      });
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quizStep < 3) {
      setQuizStep(quizStep + 1);
    } else {
      toast({
        title: "Успешно се записахте!",
        description: "Ще се свържем с вас скоро.",
      });
      await sendEmail();
      setIsDialogOpen(false);
      setQuizStep(1);
      setFormData({
        name: "",
        email: "",
        accountType: "",
        businessName: "",
        followers: "",
        niche: "",
      });
    }
  };

  const faqs = [
    {
      question: "Какво е InfluLink?",
      answer: "Първата платформа в България, която свързва брандове с инфлуенсъри за автентични кампании.",
    },
    {
      question: "Кога ще стартира платформата?",
      answer: "Очаквайте старта в началото на 2026. Запишете се в чакащата листа за ранен достъп.",
    },
    {
      question: "Как работи специалният акаунт?",
      answer: "Публикувайте нашето видео в Instagram story и получете отстъпка при одобрение.",
    },
    {
      question: "Има ли такса за регистрация?",
      answer: "Регистрацията е безплатна. Таксите се прилагат само при активни кампании.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Присъединете се към бъдещето на"
        highlightText="инфлуенсър маркетинга"
        description="Запишете се в чакащата листа за ранен достъп до първата българска платформа"
        buttonText="Запишете се сега"
        onButtonClick={() => setIsDialogOpen(true)}
        colors={["#1C3D5A", "#A7C7E7", "#E8C39E", "#F9F9F9"]}
        distortion={1.2}
        speed={0.6}
        swirl={0.8}
        veilOpacity="bg-black/30 dark:bg-black/40"
      />

      {/* Waitlist Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left side - Image */}
            <div className="hidden md:block relative bg-gradient-to-br from-primary to-secondary">
              <img
                src={waitlistHero}
                alt="InfluLink Platform"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">Присъединете се към революцията</h3>
                  <p className="text-white/90">Първата българска платформа за инфлуенсър маркетинг</p>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="p-8"
              style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl">Запишете се в чакащата листа</DialogTitle>
                <DialogDescription>
                  Стъпка {quizStep} от 3: Помогнете ни да ви опознаем по-добре
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleQuizSubmit} className="space-y-5">
                {quizStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Име</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Вашето име"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Имейл</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </>
                )}

                {quizStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="accountType">Тип акаунт</Label>
                      <select
                        id="accountType"
                        value={formData.accountType}
                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        required
                      >
                        <option value="">Изберете...</option>
                        <option value="brand">Бранд</option>
                        <option value="influencer">Инфлуенсър</option>
                        <option value="both">И двете</option>
                      </select>
                    </div>
                    {formData.accountType === "brand" && (
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Име на бизнеса</Label>
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="Име на компанията"
                          required
                        />
                      </div>
                    )}
                  </>
                )}

                {quizStep === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="followers">Брой последователи (ако сте инфлуенсър)</Label>
                      <select
                        id="followers"
                        value={formData.followers}
                        onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="">Изберете...</option>
                        <option value="1k-10k">1K - 10K</option>
                        <option value="10k-50k">10K - 50K</option>
                        <option value="50k-100k">50K - 100K</option>
                        <option value="100k+">100K+</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="niche">Ниша / Индустрия</Label>
                      <Input
                        id="niche"
                        value={formData.niche}
                        onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                        placeholder="Например: мода, технологии, храна..."
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-6">
                  {quizStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setQuizStep(quizStep - 1)}
                      className="flex-1 rounded-full"
                    >
                      Назад
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 rounded-full">
                    {quizStep === 3 ? "Изпрати" : "Напред"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waitlist Section */}
      <section className="flex py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Бъдете първите <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"></span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Запишете се в чакащата листа и получете ранен достъп до платформата
            </p>

            <Benefits></Benefits>

            <Button
              size="lg"
              onClick={() => setIsDialogOpen(true)}
              className="rounded-full text-lg px-12 w-[60%] md:w-[20%] h-14"
            >
              Запишете се
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Станете <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">VIP член</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Получете специални привилегии и отстъпки
              </p>
            </div>

            <Card className="border-2 border-primary/20 rounded-3xl overflow-hidden">
              <CardContent className="p-6 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4">Как да станете VIP?</h3>
                    <ol className="space-y-4 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">1</span>
                        <span>Свалете нашето брандирано видео (ще го получите след записване)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">2</span>
                        <span>Публикувайте го в Instagram и Facebook story с таг @influlink.bg</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">3</span>
                        <span>Нашият екип ще прегледа и одобри акаунта ви</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">4</span>
                        <span>Получете VIP статус с 30% отстъпка за първите 3 месеца</span>
                      </li>
                    </ol>
                  </div>

                  <div className="flex-1">
                    <div className="relative group bg-gradient-to-br from-primary to-secondary p-9 rounded-2xl text-white w-full">
                      <h4 className="text-xl font-bold mb-4">VIP Привилегии:</h4>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>30% отстъпка за 3 месеца</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Приоритет при избор на кампании</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Ексклузивни партньорства</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Персонален акаунт мениджър</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>VIP бадж на профила</span>
                        </li>
                      </ul>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-foreground/55 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button onClick={()=>setIsDialogOpen(true)} size="lg" variant="secondary" className="text-lg font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                          Получи видео
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-accent to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Готови да се присъедините?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Запишете се сега и бъдете част от революцията в инфлуенсър маркетинга
          </p>
          <Button
            size="lg"
            onClick={() => setIsDialogOpen(true)}
            className="bg-primary text-muted text-lg px-12 rounded-full transition duration-300 ease-in-out hover:scale-105 "
          >
            Запишете се безплатно
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
              Често задавани въпроси<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"></span>
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-primary rounded-2xl px-6 data-[state=open]:border-secondary transition-all"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
