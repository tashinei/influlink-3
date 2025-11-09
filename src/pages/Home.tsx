import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSection } from "@/components/ui/hero-section-with-smooth-bg-shader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  Upload,
  TicketCheck,
  Gift,
  HeadphonesIcon,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import waitlistHero from "@/assets/hero-gradient-portrait.jpg";
import { Benefits } from "@/components/Benefits";
import { DisplayCards } from "@/components/DisplayCards";

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
      const response = await fetch(
        "http://localhost:8080/influlink/send-email.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Присъединете се към бъдещето на"
        highlightText="инфлуенсър маркетинга"
        description="Запишете се в чакащата листа за ранен достъп до първата българска платформа"
        buttonText="Запишете се сега"
        onButtonClick={() => setIsDialogOpen(true)}
        colors={["#1E88E5", "#6EC5E9","#1E88E5"]}
        distortion={2.5}
        speed={0.8}
        swirl={1.5}
        veilOpacity="bg-black/40 dark:bg-black/40"
      />

      {/* Waitlist Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="md:max-w-[60%] 2xl:max-w-[50%] p-0 overflow-hidden">
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
                  <h3 className="text-2xl font-bold mb-2">
                    Присъединете се към революцията
                  </h3>
                  <p className="text-white/90">
                    Първата българска платформа за инфлуенсър маркетинг
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div
              className="p-8"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl">
                  Запишете се в чакащата листа
                </DialogTitle>
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
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
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
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accountType: e.target.value,
                          })
                        }
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              businessName: e.target.value,
                            })
                          }
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
                      <Label htmlFor="followers">
                        Брой последователи (ако сте инфлуенсър)
                      </Label>
                      <select
                        id="followers"
                        value={formData.followers}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            followers: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setFormData({ ...formData, niche: e.target.value })
                        }
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
    </div>
  );
};

export default Home;
