import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    ChevronRight,
    ArrowRightLeft,
    ExternalLink,
    ShieldCheck,
    AlertCircle,
    HelpCircle,
    BookOpen,
    MousePointer2,
    Badge,
    ThumbsUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const HowToConnect = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { id: 1, title: t("howToConnect.stepper.instagram"), description: t("howToConnect.stepper.accountType") },
        { id: 2, title: t("howToConnect.stepper.facebook"), description: t("howToConnect.stepper.connection") },
        { id: 3, title: t("howToConnect.stepper.influLink"), description: t("howToConnect.stepper.auth") },
    ];

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    return (
        <div className="bg-slate-50/50 min-h-screen pb-20">
            <div className="container max-w-3xl mx-auto pt-12 px-4">

                {/* PROGRESS BAR */}
                <div className="flex justify-between items-start mb-10 relative px-6">
                    <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-200 -z-10" />
                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center text-center space-y-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all shadow-sm",
                                currentStep >= step.id ? "bg-gradient-to-tr from-primary via-secondary to-tertiary text-white border-transparent" : "bg-white text-slate-400 border-slate-200"
                            )}>
                                {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                            </div>
                            <div className="hidden sm:block">
                                <p className={cn("text-[10px] font-bold uppercase tracking-tighter", currentStep >= step.id ? "text-slate-900" : "text-slate-400")}>
                                    {step.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MAIN CARD */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
                    <div className="p-8 md:p-12">

                        {/* STEP 1: INSTAGRAM PROFESSIONAL */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t("howToConnect.step1.title")}</h2>
                                    <p className="text-slate-500">{t("howToConnect.step1.description")}</p>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="group p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-pink-200 transition-all">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                                            <MousePointer2 className="w-4 h-4 text-pink-500" /> {t("howToConnect.step1.instructionTitle")}
                                        </h4>
                                        <ul className="space-y-4">
                                            <li className="text-sm text-slate-600 flex items-start gap-3">
                                                <span className="w-5 h-5 rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-slate-200 text-[10px] font-bold text-slate-400">1</span>
                                                <span dangerouslySetInnerHTML={{ __html: t("howToConnect.step1.tip1") }} />
                                            </li>
                                            <li className="text-sm text-slate-600 flex items-start gap-3">
                                                <span className="w-5 h-5 rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-slate-200 text-[10px] font-bold text-slate-400">2</span>
                                                <span dangerouslySetInnerHTML={{ __html: t("howToConnect.step1.tip2") }} />
                                            </li>
                                            <li className="text-sm text-slate-600 flex items-start gap-3">
                                                <span className="w-5 h-5 rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-slate-200 text-[10px] font-bold text-slate-400">3</span>
                                                <span dangerouslySetInnerHTML={{ __html: t("howToConnect.step1.tip3") }} />
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Button className="w-full h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-tertiary text-white font-bold text-lg" onClick={() => window.open('https://www.instagram.com/accounts/convert/to/professional/', '_blank')}>
                                            {t("howToConnect.step1.button")} <ExternalLink className="w-4 h-4 ml-2" />
                                        </Button>
                                        <a href="https://help.instagram.com/502981923235522" target="_blank" className="text-xs text-center text-slate-400 hover:text-primary transition-colors italic">
                                            {t("howToConnect.step1.helpLink")}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: FACEBOOK PAGE */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t("howToConnect.step2.title")}</h2>
                                    <p className="text-slate-500">{t("howToConnect.step2.description")}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-5 rounded-2xl border border-blue-50 bg-blue-50/30">
                                        <p className="text-sm text-blue-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: t("howToConnect.step2.mainTip") }} />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex gap-4 p-4 rounded-xl border border-slate-100 items-center">
                                            <BookOpen className="w-8 h-8 text-slate-300" />
                                            <div className="text-sm">
                                                <p className="font-bold text-slate-800 tracking-tight">{t("howToConnect.step2.noPageTitle")}</p>
                                                <a href="https://www.facebook.com/pages/create" target="_blank" className="text-blue-600 underline" dangerouslySetInnerHTML={{ __html: t("howToConnect.step2.createPageLink") }} />
                                            </div>
                                        </div>

                                        <Button className="w-full h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-tertiary text-white font-bold text-lg" onClick={() => window.open('https://www.facebook.com/business/help/399237913753231', '_blank')}>
                                            {t("howToConnect.step2.button")} <ExternalLink className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SUCCESS */}
                        {currentStep === 3 && (
                            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 py-4">
                                <div className="text-center space-y-4">
                                    <div className="relative inline-block">
                                        <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 animate-pulse" />
                                        <div className="relative w-24 h-24 bg-gradient-to-br from-primary via-secondary to-tertiary rounded-3xl flex items-center justify-center mx-auto border-2 border-green-100 shadow-xl">
                                            <ThumbsUp className="w-12 h-12 text-white" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-primary via-secondary to-tertiary text-white p-1.5 rounded-full border-4 border-white">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t("howToConnect.step3.title")}</h2>
                                        <p className="text-slate-500 text-sm max-w-sm mx-auto">{t("howToConnect.step3.description")}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 max-w-md mx-auto">
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{t("howToConnect.step3.check1")}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{t("howToConnect.step3.check2")}</span>
                                    </div>
                                </div>

                                <div className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-tertiary border border-amber-100 p-6 rounded-[2rem] flex gap-4 text-white">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                    <div className="space-y-1 relative z-10">
                                        <strong className="text-sm">{t("howToConnect.step3.warningTitle")}</strong>
                                        <p className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: t("howToConnect.step3.warningDesc") }} />
                                    </div>
                                </div>

                                <div className="space-y-4 flex flex-col items-center">
                                    <Button
                                        className="max-w-fit px-8 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary via-secondary to-tertiary text-white font-black text-xl shadow-[0_10px_40px_rgba(118,56,250,0.3)] hover:scale-[1.03] active:scale-95 transition-all duration-300 uppercase"
                                        onClick={() => navigate('/profile/me')}
                                    >
                                        {t("howToConnect.step3.finalButton")}
                                        <ArrowRightLeft className="w-6 h-6 ml-3" />
                                    </Button>
                                    <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                                        {t("howToConnect.step3.loadingText")}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ACTION FOOTER */}
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={currentStep === 1 ? () => navigate(-1) : prevStep}
                            className="font-bold text-slate-400 hover:text-slate-900"
                        >
                            {currentStep === 1 ? t("common.cancel") : t("common.back")}
                        </Button>

                        {currentStep < 3 && (
                            <Button
                                onClick={nextStep}
                                className="bg-gradient-to-br from-primary via-secondary to-tertiary text-white rounded-xl px-8 font-bold"
                            >
                                {t("common.nextStep")} <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* GUIDANCE FOOTER */}
                <div className="mt-8 flex justify-center gap-8 text-slate-400">
                    <div className="flex items-center gap-2 text-[11px] font-medium">
                        <HelpCircle className="w-4 h-4" /> {t("howToConnect.footer.help")}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium">
                        <ShieldCheck className="w-4 h-4" /> {t("howToConnect.footer.security")}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowToConnect;