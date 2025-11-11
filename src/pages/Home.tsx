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
import waitlistHero from "@/assets/hero-grad3.jpg";
import { Benefits } from "@/components/Benefits";
import { DisplayCards } from "@/components/DisplayCards";
import { useUserStore } from "@/store/useUserStore";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [accountType, setAccountType] = useState<"creator" | "brand" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    accountType: "",
    businessName: "",
    followers: "",
    niche: "",
  });

  const handleOpenDialog = (type: "creator" | "brand") => {
    setAccountType(type);
    setIsDialogOpen(true);
    setStep(1);
  };

  const handleOpenSuccesModal = () => {
    setIsSuccessModalOpen(true);
  }

  const setRegistered = useUserStore((state) => state.setRegistered);
  const isRegistered = useUserStore((state) => state.isRegistered);

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
        //
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return setStep(step + 1);

    // Close the modal and store registration info
    setIsDialogOpen(false);
    setIsSuccessModalOpen(true);
    useUserStore.getState().setRegistered(true);
    useUserStore.getState().setAccountType(accountType);

    // Reset form
    setFormData({ name: "", email: "", businessName: "", followers: "", niche: "", goals: "" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Присъединете се към бъдещето на"
        highlightText="инфлуенсър маркетинга"
        description="Запишете се в чакащата листа за ранен достъп до първата българска платформа"
        buttonText="Аз съм Създател"
        secondaryButtonText="Аз съм Бизнес"
        onButtonClick={() => !isRegistered ? handleOpenDialog("creator") : handleOpenSuccesModal()}
        onSecondaryButtonClick={() => !isRegistered ? handleOpenDialog("brand") : handleOpenSuccesModal()}
        colors={["#90d5f3ff", "#6EC5E9", "#1E88E5"]}
        distortion={2.5}
        speed={0.8}
        swirl={1.5}
        veilOpacity="bg-black/40 dark:bg-black/40"
      />

      {/* Waitlist Dialog */}
      {!isRegistered && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="md:max-w-[60%] 2xl:max-w-[50%] p-0 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left Image */}
              <div className="hidden md:block relative" style={{ borderTopRightRadius: "100px" }}>
                <img src={waitlistHero} alt="InfluLink" className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">
                      {accountType === "creator" ? "За създатели" : "За брандове"}
                    </h3>
                    <p className="text-white/90">
                      {accountType === "creator"
                        ? "Станете част от платформа, която ви свързва с правилните бизнеси."
                        : "Свържете се с подходящи инфлуенсъри и изградете автентични кампании."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Form */}
              <div className="p-8 flex flex-col justify-center">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl">
                    {accountType === "creator"
                      ? "Регистрация за създатели"
                      : "Регистрация за бизнеси"}
                  </DialogTitle>
                  <DialogDescription>
                    Стъпка {step} от 3: Нека ви опознаем
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Shared step 1 */}
                  {step === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label>Име</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Имейл</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Step 2 — different per type */}
                  {step === 2 && (
                    <>
                      {accountType === "creator" ? (
                        <>
                          <div className="space-y-2">
                            <Label>Брой последователи</Label>
                            <select
                              className="w-full rounded-md border px-3 py-2"
                              value={formData.followers}
                              onChange={(e) =>
                                setFormData({ ...formData, followers: e.target.value })
                              }
                            >
                              <option value="">Изберете...</option>
                              <option value="1k-10k">1K - 10K</option>
                              <option value="10k-50k">10K - 50K</option>
                              <option value="50k-100k">50K - 100K</option>
                              <option value="100k+">100K+</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Ниша / Тематика</Label>
                            <Input
                              value={formData.niche}
                              onChange={(e) =>
                                setFormData({ ...formData, niche: e.target.value })
                              }
                              placeholder="Мода, технологии, храна..."
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label>Име на бизнеса</Label>
                            <Input
                              value={formData.businessName}
                              onChange={(e) =>
                                setFormData({ ...formData, businessName: e.target.value })
                              }
                              placeholder="Име на компанията"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Индустрия</Label>
                            <Input
                              value={formData.niche}
                              onChange={(e) =>
                                setFormData({ ...formData, niche: e.target.value })
                              }
                              placeholder="Например: козметика, технологии, храни..."
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Step 3 — both types */}
                  {step === 3 && (
                    <div className="space-y-2">
                      <Label>
                        Какви са вашите цели в платформата?
                      </Label>
                      <Input
                        value={formData.goals}
                        onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                        placeholder={
                          accountType === "creator"
                            ? "Искам да работя с брандове..."
                            : "Искам да намеря инфлуенсъри за..."
                        }
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-6">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        className="flex-1 rounded-full"
                      >
                        Назад
                      </Button>
                    )}
                    <Button type="submit" className="flex-1 rounded-full">
                      {step === 3 ? "Изпрати" : "Напред"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999] animate-fade-in"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-2xl p-10 text-center w-[90%] sm:w-[450px] border-2 border-primary/20 overflow-visible animate-modal-pop"
          >
            {/* Splash Rings */}
            {/* <div className="absolute top-1/2 left-1/2 w-[300%] h-[300%] rounded-3xl border-4 border-primary/40 animate-splash-burst -z-10 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-[250%] h-[250%] rounded-3xl border-4 border-secondary/40 animate-splash-burst -z-10 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '0.1s' }} /> */}

            {[...Array(12)].map((_, i) => {
              const angle = i * 30; // starting angle in degrees
              const delay = 0.1 + i * 0.01;
              const color = i % 2 === 0 ? '#1E88E5' : '#6EC5E9';
              const size = 10 + (i % 4);

              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 rounded-full animate-spiral-burst"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: color,
                    '--angle': `${angle}deg`,
                    animationDelay: `${delay}s`,
                  } as React.CSSProperties}
                />
              );
            })}

            {/* Content */}
            <div className="relative z-10 bg-transparent rounded-3xl">
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CheckCircle2 className="mx-auto text-white mb-4 drop-shadow-lg animate-scale-in" size={64} />
              </div>

              <h2 className="text-2xl font-bold mb-2 text-white animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Успешно се регистрирахте!
              </h2>

              <p className="text-white mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                След одобрение ще получите имейл с повече информация.
              </p>

              <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <Button
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    const accountType = useUserStore.getState().accountType;
                    if (accountType === "creator") navigate("/creator/about");
                    else if (accountType === "brand") navigate("/brand/about");
                  }}
                  className="bg-white text-black rounded-full px-8 py-6 text-[16px] font-semibold shadow-md shadow-primary transition duration-300 ease-in-out hover:scale-105 hover:bg-null"
                >
                  Вижте повече
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
