import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, AtSign, CheckCircle2, Info, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/useUserStore";

import { HeroSection } from "@/components/ui/hero-section-with-smooth-bg-shader";
import MultiSelectListBox from "@/components/MultiSelectListBox";
import CountryPickerModal from "@/components/CountryPickerModal";

import waitlistHero from "@/assets/hero-grad3.jpg";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const setRegistered = useUserStore(state => state.setRegistered);
  const isRegistered = useUserStore(state => state.isRegistered);

  const { t } = useTranslation();

  const [accountType, setAccountType] = useState<"creator" | "brand" | null>(null);

  const stepNamesKey = accountType === "creator"
    ? "form.stepNames.creator"
    : "form.stepNames.brand";

  const getArrayTranslation = (key: string): string[] => {
    // Use unknown first to satisfy strict TypeScript rules
    return t(key) as unknown as string[];
  };

  // Use the local stepNames array for the initial state and update in useEffect
  // const [stepName, setStepName] = useState("Основна информация");
  const stepNames = t(stepNamesKey) as unknown as string[];
  const [step, setStep] = useState(1);
  const [currentStepTitle, setCurrentStepTitle] = useState("Основна информация");

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

    const flowStepNames = getArrayTranslation(stepNamesKey);

    const newStepTitle = flowStepNames[step - 1];

    if (newStepTitle) {
      setCurrentStepTitle(newStepTitle);
    }
  }, [step, accountType, t, stepNamesKey]);

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

  // 4. Translated Validation Messages
  const validateStep = () => {
    if (step === 1 && (!formData.name.trim() || !formData.email.trim())) {
      setStepError(t("form.validation.nameEmailRequired") || "Моля, въведете име и имейл");
      return false;
    }

    if (step === 2) {
      if (accountType === "creator") {
        if (formData.niches.length === 0) {
          setStepError(t("form.validation.nicheRequired") || "Моля, изберете поне една ниша");
          return false;
        }
        if (formData.niches.includes("Друго") && !formData.otherNiche.trim()) {
          setStepError(t("form.validation.otherNicheRequired") || "Моля, опишете другата ниша");
          return false;
        }
      }

      if (accountType === "brand") {
        if (formData.businessCategories.length === 0) {
          setStepError(t("form.validation.categoryRequired") || "Моля, изберете поне една категория");
          return false;
        }
        if (formData.businessCategories.includes("Друго") && !formData.otherCategory.trim()) {
          setStepError(t("form.validation.otherCategoryRequired") || "Моля, опишете другата категория");
          return false;
        }
      }
    }

    if (step === 3) {
      if (accountType === "creator" && formData.topCountries.length === 0) {
        setStepError(t("form.validation.countriesRequired") || "Моля, въведете поне една държава");
        return false;
      }
      if (accountType === "brand" && formData.targetCountries.length === 0) {
        setStepError(t("form.validation.countriesRequired") || "Моля, изберете поне една държава");
        return false;
      }
    }

    if (step === 4) {
      if (formData.collabTypes.length === 0) {
        setStepError(t("form.validation.collabRequired") || "Моля, изберете поне един вид сътрудничество");
        return false;
      }
      if (formData.collabTypes.includes("Друго") && !formData.otherCollab.trim()) {
        setStepError(t("form.validation.otherCollabRequired") || "Моля, опишете другия вид колаборация");
        return false;
      }
    }

    if (step === 5) {
      if (accountType === "creator" && (!formData.platform || !formData.followers)) {
        setStepError(t("form.validation.platformFollowersRequired") || "Моля, изберете платформа и въведете последователи");
        return false;
      }
      if (accountType === "brand" && !formData.idealClient.trim()) {
        setStepError(t("form.validation.idealClientRequired") || "Моля, опишете Вашия идеален клиент");
        return false;
      }
    }

    // Creator Step 6 (is the confirmation step)
    if (step === 6 && accountType === "creator" && !formData.audience.trim()) {
      setStepError(t("form.validation.audienceRequired") || "Моля, опишете Вашата аудитория");
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

  useEffect(() => {
    window.scrollTo(0, 0);

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const maxStep = accountType === "creator" ? 6 : 5;

    if (!validateStep()) return;

    if (step < maxStep) return handleNextStep();

    if (!accountType) return;

    // ... (API submission logic remains the same)
    try {
      const payload = accountType === "creator" ? {
        full_name: formData.name,
        email: formData.email,
        base_country: formData.yourCountry,
        top_countries: formData.topCountries,
        niches: formData.niches.includes("Друго") && formData.otherNiche ? [...formData.niches.filter(n => n !== "Друго"), formData.otherNiche] : formData.niches,
        collab_types: formData.collabTypes.includes("Друго") && formData.otherCollab ? [...formData.collabTypes.filter(c => c !== "Друго"), formData.otherCollab] : formData.collabTypes,
        primary_platform: formData.platform,
        social_tag: formData.socialTag,
        followers: formData.followers,
        audience_description: formData.audience
      } : {
        full_name: formData.name,
        email: formData.email,
        base_country: formData.yourCountry,
        target_countries: formData.targetCountries,
        categories: formData.businessCategories.includes("Друго") && formData.otherCategory ? [...formData.businessCategories.filter(c => c !== "Друго"), formData.otherCategory] : formData.businessCategories,
        collab_types: formData.collabTypes.includes("Друго") && formData.otherCollab ? [...formData.collabTypes.filter(c => c !== "Друго"), formData.otherCollab] : formData.collabTypes,
        ideal_client_description: formData.idealClient
      };

      const endpoint = accountType === "creator" ? "https://influ-link.com/api/registerCreator.php" : "https://influ-link.com/api/registerBrand.php";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === "success") {
        setIsDialogOpen(false);
        setIsSuccessModalOpen(true);
        setRegistered(true);
        useUserStore.getState().setAccountType(accountType);
        resetForm();
      } else {
        toast({
          title: t("form.toast.errorTitle") || "Грешка",
          description: result.message || t("form.toast.registrationError") || "Възникна грешка при регистрацията",
          className: "bg-red-600 text-white",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: t("form.toast.errorTitle") || "Грешка",
        description: t("form.toast.serverConnectionError") || "Възникна проблем при връзката със сървъра",
        className: "bg-red-600 text-white",
      });
    }
  };

  return (
    <div className="min-h-dvh max-h-dvh w-full overflow-x-hidden">
      <HeroSection
        title={t("hero.title")}
        highlightText={t("hero.highlightText")}
        description={t("hero.description")}
        buttonText={t("hero.mainCta")}
        secondaryButtonText={t("hero.secondaryCta")}
        onButtonClick={() =>
          !isRegistered ? handleOpenDialog("creator") : setIsSuccessModalOpen(true)
        }
        onSecondaryButtonClick={() =>
          !isRegistered ? handleOpenDialog("brand") : setIsSuccessModalOpen(true)
        }
        colors={["#90d5f3ff", "#6EC5E9", "#1E88E5"]}
        distortion={2.5}
        speed={0.8}
        swirl={1.5}
        veilOpacity="bg-black/80"
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
                    {t("form.leftSide.title")}
                  </h1>
                  <p className="text-md text-white/90 max-w-xl drop-shadow-md text-left pr-2">
                    {accountType === "brand" ? t("form.leftSide.brandsSubText") : t("form.leftSide.creatorsSubText")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col max-h-[85dvh] overflow-y-auto custom-scrollbar bg-white">
                <div className="p-[3rem] md:p-8 flex flex-col justify-center min-h-full">

                  <DialogHeader className="mb-6 text-left">
                    <DialogTitle className="text-xl md:text-2xl font-bold">
                      {accountType === "creator" ? t("form.titles.creators") : t("form.titles.brands")}
                    </DialogTitle>
                    <DialogDescription className="text-sm mt-1">
                      {t("form.stepIndicator.step")} {step} {t("form.labels.of")} {accountType === "creator" ? 6 : 5}: <span className="text-primary font-medium">{currentStepTitle}</span>
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col md:max-h-[50%]">
                    <div className="flex-1">
                      {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div>
                            <Label>{t("form.labels.name")}</Label>
                            <Input
                              placeholder={accountType === "creator" ? t("form.placeholders.name") : t("form.placeholders.brandName")}
                              value={formData.name}
                              onChange={e => setFormData({ ...formData, name: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>{t("form.labels.email")}</Label>
                            <Input
                              type="email"
                              placeholder={t("form.placeholders.email")}
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
                            label={accountType === "creator" ? t("form.steps.creator2.title") : t("form.steps[2].title")} // "Категория и ниша"
                            options={
                              accountType === "creator"
                                ? getArrayTranslation("form.arrays.creatorNiches")
                                : getArrayTranslation("form.arrays.brandCategories")
                            }
                            selected={accountType === "creator" ? formData.niches : formData.businessCategories}
                            onSelectionChange={newSelection => {
                              if (accountType === "creator") setFormData({ ...formData, niches: newSelection });
                              else setFormData({ ...formData, businessCategories: newSelection });
                            }}
                          />

                          {accountType === "creator" && formData.niches.includes(t("form.misc.other")) && (
                            <div className="mt-2">
                              <Label>{t("form.misc.other")}</Label>
                              <Input
                                placeholder={t("form.placeholders.otherNiche") || "Напишете вашата ниша..."}
                                value={formData.otherNiche}
                                onChange={e => setFormData({ ...formData, otherNiche: e.target.value })}
                                className="mt-1.5"
                              />
                            </div>
                          )}

                          {accountType === "brand" && formData.businessCategories.includes(t("form.misc.other")) && (
                            <div className="mt-2">
                              <Label>{t("form.misc.other")}</Label>
                              <Input
                                placeholder={t("form.placeholders.otherCategory") || "Напишете вашата категория..."}
                                value={formData.otherCategory}
                                onChange={e => setFormData({ ...formData, otherCategory: e.target.value })}
                                className="mt-1.5"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex gap-4 flex-col">
                          <div>
                            <Label>{t("form.labels.country")}</Label>
                            <Input
                              placeholder={t("form.placeholders.country") || "Например: България"}
                              value={formData.yourCountry}
                              onChange={e => setFormData({ ...formData, yourCountry: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label className="mb-1.5 block">{t("form.labels.targetCountries") || "Целеви държави"}</Label>
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
                                      {t("form.placeholders.selectCountries") || "+ Изберете до 3 държави"}
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
                            shouldHaveOverlay={true}
                          />
                          <CountryPickerModal
                            open={businessCountryModalOpen}
                            onClose={() => setBusinessCountryModalOpen(false)}
                            selected={formData.targetCountries || []}
                            setSelected={(newCountries) =>
                              setFormData({ ...formData, targetCountries: Array.isArray(newCountries) ? newCountries : [] })
                            }
                            onSave={() => setBusinessCountryModalOpen(false)}
                            shouldHaveOverlay={true}
                          />
                        </div>
                      )}

                      {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <MultiSelectListBox
                            label={t("form.labels.collabTypes") || "Предпочитани колаборации"}
                            options={
                              accountType === "creator"
                                ? getArrayTranslation("form.arrays.creatorCollabOptions")
                                : getArrayTranslation("form.arrays.brandCollabOptions")
                            }
                            selected={formData.collabTypes}
                            onSelectionChange={newSelection => setFormData({ ...formData, collabTypes: newSelection })}
                          />

                          {formData.collabTypes.includes(t("form.misc.other")) && (
                            <div className="mt-2">
                              <Label>{t("form.misc.other")}</Label>
                              <Input
                                placeholder={t("form.placeholders.otherCollab") || "Опишете друг вид колаборация..."}
                                value={formData.otherCollab}
                                onChange={e => setFormData({ ...formData, otherCollab: e.target.value })}
                                className="mt-1.5"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {accountType === "creator" && step === 5 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{t("form.labels.platform") || "Платформа"}</Label>
                              <div className="relative">
                                <select
                                  value={formData.platform}
                                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                  <option value="" disabled>{t("form.placeholders.select") || "Изберете..."}</option>
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
                              <Label>{t("form.labels.username") || "Потребителско име"}</Label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><AtSign className="h-4 w-4" /></div>
                                <Input value={formData.socialTag} onChange={(e) => setFormData({ ...formData, socialTag: e.target.value })} placeholder="username" className="pl-9" />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>{t("form.labels.followers") || "Брой последователи"}</Label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Users className="h-4 w-4" /></div>
                              <Input value={formData.followers} onChange={(e) => setFormData({ ...formData, followers: e.target.value })} placeholder={t("form.placeholders.followers") || "Например: 15k"} className="pl-9" />
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">{t("form.helperText.followers") || "Приблизителен брой последователи."}</p>
                          </div>
                        </div>
                      )}

                      {/* Brand Step 5 (Confirmation/Ideal Client Description for validation) */}
                      {accountType === "brand" && step === 5 && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-center justify-between">
                            <Label className="text-base">{t("form.labels.audience")}</Label>
                            <span className="text-xs text-muted-foreground">{formData.idealClient.length}/400</span>
                          </div>
                          <Textarea
                            value={formData.idealClient}
                            onChange={(e) => setFormData({ ...formData, idealClient: e.target.value })}
                            placeholder={t("form.placeholders.audience")}
                            className="min-h-[140px] resize-none text-[15px] p-4"
                            maxLength={400}
                          />
                          <div className="bg-transparent rounded-lg p-3 flex gap-3 items-center">
                            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-500">
                              {t("form.steps[4].helperText") || "Ще използваме тази информация, за да Ви предложим най-подходящите профили."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Creator Step 6 (Confirmation/Audience Description for validation) */}
                      {accountType === "creator" && step === 6 && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-center justify-between">
                            <Label className="text-base">{t("form.labels.audience")}</Label>
                            <span className="text-xs text-muted-foreground">{formData.audience.length}/300</span>
                          </div>
                          <Textarea
                            value={formData.audience}
                            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                            placeholder={t("form.placeholders.audience")}
                            className="min-h-[120px] resize-none text-[15px] p-4"
                            maxLength={300}
                          />
                          <div className="bg-transparent rounded-lg p-3 flex gap-3 items-center">
                            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-500">
                              {t("form.steps.creator5.description") || "Опишете аудиторията си, за да Ви свържем с подходящи брандове."}
                            </p>
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
                          {t("common.back")}
                        </Button>
                      )}
                      <Button type="submit" className={`flex-1 ${step === 1 ? 'w-full' : ''}`}>
                        {step === (accountType === "creator" ? 6 : 5) ? t("common.submit") : t("common.next")}
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

      {/* Success Modal (content section only, assuming the modal wrapper is the same) */}
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999] animate-fade-in"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-2xl p-10 text-center w-[90%] sm:w-[450px] border-2 border-primary/20 overflow-visible animate-modal-pop"
          >

            {/* Animation elements (omitted for brevity, they are styling) */}

            {/* Content - Applied translations here */}
            <div className="relative z-10 bg-transparent rounded-3xl">
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CheckCircle2 className="mx-auto text-white mb-4 drop-shadow-lg animate-scale-in" size={64} />
              </div>

              <h2 className="text-2xl font-bold mb-2 text-white animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {t("successModal.title")}
              </h2>

              <p className="text-white mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                {t("successModal.description")}
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
                  {t("successModal.button")}
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