import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, AtSign, CheckCircle2, Info, Sparkles, Target, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/useUserStore";

import { HeroSection } from "@/components/ui/hero-section-with-smooth-bg-shader";
import MultiSelectListBox from "@/components/MultiSelectListBox";
import CountryPickerModal from "@/components/CountryPickerModal";

import waitlistHero from "@/assets/hero-grad3.jpg";
import { Textarea } from "@/components/ui/textarea";

const creatorNiches = ["Мода", "Красота", "Технологии", "Пътувания", "Фитнес", "Храна", "Гейминг", "Образование", "Комедия", "Друго"];
const brandCategories = ["Дрехи", "Козметика", "Технологии", "Храни", "Услуги", "Друго"];
const creatorCollabOptions = ["Продуктово ревю", "Гласова реклама", "UGC видео", "Публикация", "Стори", "Друго"];
const brandCollabOptions = ["Кратко видео", "Ревю", "Ънбоксинг", "UGC реклама", "Фото пост", "Гласово видео", "Друго"];

const stepNames: Record<"creator" | "brand", string[]> = {
  creator: [
    "Нека ви опознаем",
    "Основни ниши / категории",
    "Държави и аудитория",
    "Предпочитани колаборации",
    "Основна платформа и последователи",
    "Аудитория и защо да работят с вас",
  ],
  brand: [
    "Нека ви опознаем",
    "Категория на продукт / услуга",
    "Целеви държави / бюджет",
    "Предпочитан формат / съдържание",
    "Перфектен клиент / аудитория",
  ],
};

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const setRegistered = useUserStore(state => state.setRegistered);
  const isRegistered = useUserStore(state => state.isRegistered);

  const [accountType, setAccountType] = useState<"creator" | "brand" | null>(null);
  const [step, setStep] = useState(1);
  const [stepName, setStepName] = useState("Нека ви опознаем");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [businessCountryModalOpen, setBusinessCountryModalOpen] = useState(false);

  const [stepError, setStepError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    followers: "",
    niche: "",
    goals: "",
    topCountries: [] as any[],
    targetCountries: [] as any[],
    collabTypes: [] as string[],
    contentTypes: [] as string[],
    audience: "",
    idealClient: "",
    platform: "",
    niches: [] as string[],
    businessCategories: [] as string[],
    socialTag: "",
    otherCollab: "",
    otherNiche: "",
    otherCategory: "",
    yourCountry: "",
  });

  // Update step title on step/accountType change
  useEffect(() => {
    if (!accountType) return;
    setStepName(stepNames[accountType][step - 1]);
  }, [step, accountType]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      businessName: "",
      followers: "",
      niche: "",
      goals: "",
      topCountries: [],
      targetCountries: [],
      collabTypes: [],
      contentTypes: [],
      audience: "",
      idealClient: "",
      platform: "",
      niches: [],
      businessCategories: [],
      socialTag: "",
      otherCollab: "",
      otherNiche: "",
      otherCategory: "",
      yourCountry: "",
    });
    setStep(1);
    setStepError(null);
  };

  const handleOpenDialog = (type: "creator" | "brand") => {
    setAccountType(type);
    resetForm();
    setIsDialogOpen(true);
  };

  const validateStep = () => {
    if (step === 1 && (!formData.name.trim() || !formData.email.trim())) {
      setStepError("Моля, въведете име и имейл");
      return false;
    }

    if (step === 2) {
      if (accountType === "creator" && formData.niches.length === 0) {
        setStepError("Моля, изберете поне една ниша");
        return false;
      }
      if (accountType === "brand" && formData.businessCategories.length === 0) {
        setStepError("Моля, изберете поне една категория");
        return false;
      }
    }

    if (step === 3) {
      if (accountType === "creator" && formData.topCountries.length === 0) {
        setStepError("Моля, въведете поне една държава");
        return false;
      }
      if (accountType === "brand" && formData.targetCountries.length === 0) {
        setStepError("Моля, изберете поне една държава");
        return false;
      }
    }

    if (step === 4 && formData.collabTypes.length === 0) {
      setStepError("Моля, изберете поне един вид сътрудничество");
      return false;
    }

    if (step === 5) {
      if (accountType === "creator" && (!formData.platform || !formData.followers)) {
        setStepError("Моля, изберете платформа и въведете последователи");
        return false;
      }
      if (accountType === "brand" && !formData.idealClient.trim()) {
        setStepError("Моля, опишете Вашия идеален клиент");
        return false;
      }
    }

    if (step === 6 && accountType === "creator" && !formData.audience.trim()) {
      setStepError("Моля, опишете Вашата аудитория");
      return false;
    }

    setStepError(null);
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep()) return;
    const maxStep = accountType === "creator" ? 6 : 5;
    if (step < maxStep) setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const maxStep = accountType === "creator" ? 6 : 5;
    if (step < maxStep) return handleNextStep();

    try {
      const finalData = { ...formData, accountType };
      // await fetch(...) send data
      setIsDialogOpen(false);
      setIsSuccessModalOpen(true);
      setRegistered(true);
      useUserStore.getState().setAccountType(accountType);
      resetForm();
    } catch (err) {
      console.error(err);
      toast({ title: "Възникна грешка", description: "Опитайте пак", className: "bg-red-600 text-white" });
    }
  };

  return (
    <div className="min-h-screen">
      <HeroSection
        title="Присъединете се към бъдещето на"
        highlightText="инфлуенсър маркетинга"
        description="Запишете се в чакащата листа за ранен достъп до първата българска платформа"
        buttonText="Създател"
        secondaryButtonText="Бизнес"
        onButtonClick={() => !isRegistered ? handleOpenDialog("creator") : setIsSuccessModalOpen(true)}
        onSecondaryButtonClick={() => !isRegistered ? handleOpenDialog("brand") : setIsSuccessModalOpen(true)}
        colors={["#90d5f3ff", "#6EC5E9", "#1E88E5"]}
        distortion={2.5}
        speed={0.8}
        swirl={1.5}
        veilOpacity="bg-black/40"
      />

      {!isRegistered && accountType && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] md:max-w-[45%] p-0 overflow-hidden rounded-xl bg-white border-none">
            <div className="grid md:grid-cols-2 gap-0 h-full">

              <div className="hidden md:block relative bg-gray-100 p-4">
                <img
                  src={waitlistHero}
                  alt="InfluLink"
                  className="w-full h-full object-cover opacity-90 absolute inset-0"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                <div className="absolute inset-0 flex flex-col items-start justify-end p-8 pl-[2rem] pr-0 pb-16">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg text-left max-w-xl">
                    Станете част от бъдещето
                  </h1>
                  <p className="text-md text-white/90 max-w-xl drop-shadow-md text-left pr-2">
                    Свържете се с най-добрите {accountType === "brand" ? "създатели на съдържание" : "марки"} в България.
                  </p>
                </div>
              </div>
              <div className="flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar bg-white">
                <div className="p-[3rem] md:p-8 flex flex-col justify-center min-h-full">

                  <DialogHeader className="mb-6 text-left">
                    <DialogTitle className="text-xl md:text-2xl font-bold">
                      {accountType === "creator" ? "Регистрация за създатели" : "Регистрация за бизнеси"}
                    </DialogTitle>
                    <DialogDescription className="text-sm mt-1">
                      Стъпка {step} от {accountType === "creator" ? 6 : 5}: <span className="text-primary font-medium">{stepName}</span>
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col md:max-h-[50%]">
                    <div className="flex-1">
                      {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div>
                            <Label>Име</Label>
                            <Input
                              placeholder={accountType === "creator" ? "Вашите имена..." : "Име на бизнеса..."}
                              value={formData.name}
                              onChange={e => setFormData({ ...formData, name: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              placeholder="Вашият имейл..."
                              value={formData.email}
                              onChange={e => setFormData({ ...formData, email: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <MultiSelectListBox
                            label={accountType === "creator" ? "Вашата ниша/категория" : "Категории на бизнес"}
                            options={accountType === "creator" ? creatorNiches : brandCategories}
                            selected={accountType === "creator" ? formData.niches : formData.businessCategories}
                            onSelectionChange={newSelection => {
                              if (accountType === "creator") setFormData({ ...formData, niches: newSelection });
                              else setFormData({ ...formData, businessCategories: newSelection });
                            }}
                          />
                        </div>
                      )}

                      {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex gap-4 flex-col">
                          <div>
                            <Label>Вашата държава</Label>
                            <Input
                              placeholder="Например: България"
                              value={formData.yourCountry}
                              onChange={e => setFormData({ ...formData, yourCountry: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label className="mb-1.5 block">Целеви държави</Label>
                            <div
                              onClick={() =>
                                accountType === "creator" ? setCountryModalOpen(true) : setBusinessCountryModalOpen(true)
                              }
                              className="group justify-center cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md p-3 min-h-[3rem] flex flex-wrap gap-2 items-center transition-colors"
                            >
                              {(() => {
                                const list = accountType === "creator" ? formData.topCountries : formData.targetCountries;
                                const safeList = Array.isArray(list) ? list : [];

                                if (safeList.length === 0) {
                                  return (
                                    <span className="text-muted-foreground text-sm flex items-center gap-2">
                                      + Изберете до 3 държави
                                    </span>
                                  );
                                }

                                return safeList.map((c: any) => (
                                  <span key={c.code} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                    <img src={c.flag} alt="" className="w-3.5 h-2.5 object-cover rounded-[1px]" />
                                    {c.name}
                                  </span>
                                ));
                              })()}
                            </div>
                          </div>

                          <CountryPickerModal
                            open={countryModalOpen}
                            onClose={() => setCountryModalOpen(false)}
                            selected={formData.topCountries || []}
                            setSelected={(newCountries) =>
                              setFormData({ ...formData, topCountries: Array.isArray(newCountries) ? newCountries : [] })
                            }
                            onSave={() => setCountryModalOpen(false)}
                          />
                          <CountryPickerModal
                            open={businessCountryModalOpen}
                            onClose={() => setBusinessCountryModalOpen(false)}
                            selected={formData.targetCountries || []}
                            setSelected={(newCountries) =>
                              setFormData({ ...formData, targetCountries: Array.isArray(newCountries) ? newCountries : [] })
                            }
                            onSave={() => setBusinessCountryModalOpen(false)}
                          />
                        </div>
                      )}

                      {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <MultiSelectListBox
                            label="Предпочитани колаборации"
                            options={accountType === "creator" ? creatorCollabOptions : brandCollabOptions}
                            selected={formData.collabTypes}
                            onSelectionChange={newSelection => setFormData({ ...formData, collabTypes: newSelection })}
                          />
                        </div>
                      )}

                      {accountType === "creator" && step === 5 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Платформа</Label>
                              <div className="relative">
                                <select
                                  value={formData.platform}
                                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                  <option value="" disabled>Изберете...</option>
                                  <option value="Instagram">Instagram</option>
                                  <option value="TikTok">TikTok</option>
                                  <option value="YouTube">YouTube</option>
                                  <option value="Facebook">Facebook</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1" /></svg>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Потребителско име</Label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><AtSign className="h-4 w-4" /></div>
                                <Input value={formData.socialTag} onChange={(e) => setFormData({ ...formData, socialTag: e.target.value })} placeholder="username" className="pl-9" />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Брой последователи</Label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Users className="h-4 w-4" /></div>
                              <Input value={formData.followers} onChange={(e) => setFormData({ ...formData, followers: e.target.value })} placeholder="Например: 15k" className="pl-9" />
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">Приблизителен брой последователи.</p>
                          </div>
                        </div>
                      )}

                      {accountType === "brand" && step === 5 && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-center justify-between">
                            <Label className="text-base flex items-center gap-2">Вашият идеален клиент</Label>
                            <span className="text-xs text-muted-foreground">{formData.idealClient.length}/400</span>
                          </div>
                          <Textarea
                            value={formData.idealClient}
                            onChange={(e) => setFormData({ ...formData, idealClient: e.target.value })}
                            placeholder="Опишете Вашиата целева персона..."
                            className="min-h-[140px] resize-none text-[15px] p-4"
                            maxLength={400}
                          />
                          <div className="bg-transparent rounded-lg p-3 flex gap-3 items-center">
                            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-500">Ще използваме тази информация, за да създадем по-добри съвпадения за Вас.</p>
                          </div>
                        </div>
                      )}

                      {accountType === "creator" && step === 6 && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-center justify-between">
                            <Label className="text-base">Опишете Вашата аудитория</Label>
                            <span className="text-xs text-muted-foreground">{formData.audience.length}/300</span>
                          </div>
                          <Textarea
                            value={formData.audience}
                            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                            placeholder="Предимно жени (18-24)..."
                            className="min-h-[120px] resize-none text-[15px] p-4"
                            maxLength={300}
                          />
                          <div className="bg-transparent rounded-lg p-3 flex gap-3 items-center">
                            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-500">Ще използваме тази информация, за да Ви предложим на подходящи бизнеси.</p>
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {stepError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {stepError}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6 pt-2 border-t border-gray-100 md:border-none">
                      {step > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 border-2"
                          onClick={() => setStep(step - 1)}
                        >
                          Назад
                        </Button>
                      )}
                      <Button type="submit" className={`flex-1 ${step === 1 ? 'w-full' : ''}`}>
                        {step === (accountType === "creator" ? 6 : 5) ? "Изпрати" : "Напред"}
                      </Button>
                    </div>

                  </form>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )
      }

      {
        isSuccessModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999] animate-fade-in"
            onClick={() => setIsSuccessModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-2xl p-10 text-center w-[90%] sm:w-[450px] border-2 border-primary/20 overflow-visible animate-modal-pop"
            >

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
        )
      }
    </div >
  );
};

export default Home;
