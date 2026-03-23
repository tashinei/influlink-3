import React, { useState, useEffect, useMemo } from 'react';
import RegistrationForm from '@/components/AuthForm'; // Step 1
import {
    ArrowRight,
    ChevronLeft,
    Globe,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import staticBgImage from '../assets/registerBackLatest4.jpg';
import { MeshGradient } from '@paper-design/shaders-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { BsQuestionCircleFill } from 'react-icons/bs';
import { useCreatorNiches } from '@/data/mockCreators';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/useTranslation';
import { Helmet } from 'react-helmet-async';

const RegisterCreator = () => {
    const StepHeader = ({ step, title, benefit }: { step: number, title: string, benefit: string }) => (
        <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white hover:bg-white/20 backdrop-blur-md border-white/10">
                    Step {step} of 4
                </Badge>
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white">{title}</h2>
            <div className="flex gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <BsQuestionCircleFill className="h-5 w-5 text-white shrink-0" />
                <p className="text-sm text-blue-100/80 leading-relaxed">
                    <span className="font-semibold text-white">{t("mvpLogin.whyThisMatters")}:</span> {benefit}
                </p>
            </div>
        </div>
    );

    const LANGUAGE_OPTIONS = [
        "English", "Spanish", "French", "German", "Chinese",
        "Arabic", "Hindi", "Portuguese", "Japanese", "Russian",
        "Italian", "Turkish", "Korean", "Dutch"
    ];
    const colors = ["#90d5f3ff", "#6EC5E9", "#1E88E5"];
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });
    const [mounted, setMounted] = useState(false);

    const isMobile = useIsMobile();

    const updateDimensions = (entries: ResizeObserverEntry[]) => {
        const entry = entries[0];
        if (entry) {
            setDimensions({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        }
    };

    const { t } = useTranslation();

    const encodeData = (data: any) => {
        const jsonString = JSON.stringify(data);
        return btoa((encodeURIComponent(jsonString)));
    };
    const decodeData = (encoded) => {
        try {
            return JSON.parse(atob(encoded));
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        setMounted(true);
        const container = document.getElementById("form-card-container");

        if (!container) return;

        const observer = new ResizeObserver(updateDimensions);

        observer.observe(container);

        if (container.offsetWidth > 0) {
            updateDimensions([{ contentRect: container.getBoundingClientRect() } as ResizeObserverEntry]);
        }

        return () => {
            observer.unobserve(container);
            observer.disconnect();
        };
    }, []);
    const [isLoaded, setIsLoaded] = useState(false);

    const [searchParams] = useSearchParams();
    const [isRegister, setIsRegister] = useState(
        searchParams.get('mode') !== 'login' // Initialize based on URL
    );
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        handle: '',
        location: '',
        niche: '',
        otherNiche: '',
        bio: '',
        platforms: [],
        languages: [],
        content_types: [],
        collab_types: []
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const navigate = useNavigate();
    const { setUser, setRegistered, setAccountType } = useUserStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedData = sessionStorage.getItem('registration_draft');
        if (savedData) {
            const decoded = decodeData(savedData);
            if (decoded) {
                setFormData(decoded);
            }
        }
    }, []);

    useEffect(() => {
        if (formData.email || formData.name) {
            sessionStorage.setItem('registration_draft', encodeData(formData));
        }
    }, [formData]);

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const payload = {
                ...formData,
                accountType: 'creator'
            };

            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    setStep(2);
                    throw new Error(data.message || "This handle is already taken.");
                }
                throw new Error(data.message || "Registration failed.");
            }

            setUser({
                id: data.user.id,
                email: data.user.email,
                username: data.user.username || data.user.handle,
                profileImage: data.user.profileImage || '',
                isVIP: data.user.isVIP || false,
                accountType: data.user.accountType
            });

            setRegistered(true);
            setAccountType(data.user.accountType as "creator" | "brand");

            sessionStorage.removeItem('registration_draft');
            navigate('/profile/me');

        } catch (err: any) {
            console.error("Final Submission Error:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fromGoogle = searchParams.get("fromGoogle");
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        if (fromGoogle) {
            const handleGoogleExchange = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/auth/exchange-google-token`, {
                        credentials: 'include'
                    });

                    if (res.ok) {
                        const data = await res.json();

                        setUser(data.user);
                        setAccountType('creator');

                        setFormData(prev => ({
                            ...prev,
                            email: data.user.email,
                            name: data.user.name
                        }));

                        setStep(2);

                        const cleanUrl = window.location.pathname + "?isGoogleAuth=true";
                        window.history.replaceState({}, document.title, cleanUrl);
                    } else {
                        navigate('/register/creator?error=session_expired');
                    }
                } catch (err) {
                    console.error("Exchange error:", err);
                    setError("Google sync failed. Please try again.");
                }
            };
            handleGoogleExchange();
        }
    }, [searchParams]);

    useEffect(() => {
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const isGoogleAuth = searchParams.get('isGoogleAuth');

        if (isGoogleAuth === 'true') {
            setAccountType('creator');

            setFormData(prev => ({
                ...prev,
                email: email || prev.email,
                name: name || prev.name,
            }));

            setStep(2);

            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, [searchParams, setAccountType]);

    const [agreed, setAgreed] = useState(false);

    const primaryButtonClass = 'bg-gradient-to-br from-primary to-secondary text-white hover:bg-primary/90';
    const creatorNiches = useCreatorNiches();
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <RegistrationForm
                        accountType="creator"
                        isMultiStep={true}
                        title={isRegister ? t("mvpLogin.becomeCreator") : t("mvpLogin.welcomeBack")}
                        description={isRegister ? t("mvpLogin.letsSecureFirst") : t("mvpLogin.descLoginCreators")}
                        initialData={{ name: formData.name, email: formData.email }}
                        onSuccess={(step1Data: any) => {
                            setFormData(prev => ({ ...prev, ...step1Data, accountType: 'creator' }));
                            setStep(2);
                        }}
                        changeFormMode={() => setIsRegister(!isRegister)}
                    />
                );
            case 2:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full lg:p-10">
                        {/* Top Section: Header */}
                        <StepHeader
                            step={2}
                            title={t("mvpLogin.yourIdentity")}
                            benefit={t("mvpLogin.step2Benefit")}
                        />

                        {/* Middle Section: Inputs (This fills the space) */}
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <InputWrapper label={t("mvpLogin.fullName")}>
                                    <input
                                        className="step-input"
                                        placeholder="Alex Rivera"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </InputWrapper>
                                <InputWrapper label="Handle">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">@</span>
                                        <input
                                            className="step-input !pl-[35px]"
                                            placeholder="alex_creates"
                                            value={formData.handle.replace(/^@/, '')}
                                            onChange={e => {
                                                const cleanValue = e.target.value.replace(/[^a-zA-Z0-9_.]/g, '');
                                                setFormData({ ...formData, handle: cleanValue });
                                            }}
                                        />
                                    </div>
                                </InputWrapper>
                            </div>

                            <InputWrapper label={`${t("mvpLogin.location")} (${t("mvpLogin.countryCity")})`}>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                    <input
                                        className="step-input !pl-[40px]"
                                        placeholder="London, UK"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </InputWrapper>
                            <InputWrapper label={t("mvpLogin.languages")}>
                                <div className="relative group">
                                    <select
                                        className="step-input appearance-none w-full h-14 px-4 bg-white/40 border border-white/20 rounded-xl text-white/40 focus:outline-none cursor-pointer"
                                        value=""
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val && !formData.languages.includes(val)) {
                                                setFormData({
                                                    ...formData,
                                                    languages: [...formData.languages, val]
                                                });
                                            }
                                        }}
                                    >
                                        <option value="" className="bg-gray-900 !text-white/10">{t("mvpLogin.anyLanguages")}...</option>
                                        {LANGUAGE_OPTIONS.map((lang) => (
                                            <option key={lang} value={lang} className="bg-gray-900">{lang}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                                        <ChevronLeft className="-rotate-90 h-4 w-4" />
                                    </div>
                                </div>

                                {/* Selected Language Badges */}
                                <div className="flex flex-wrap gap-2 mt-3 min-h-[32px]">
                                    {formData.languages.length === 0 ? (
                                        <span className="text-[12px] text-white ml-1">{t("mvpLogin.pleaseSelectOneLanguage")}</span>
                                    ) : (
                                        formData.languages.map((lang) => (
                                            <Badge
                                                key={lang}
                                                className="bg-white/20 hover:bg-red-500/40 text-white cursor-pointer transition-colors border-white/10 py-1.5 px-3 animate-in zoom-in-95 duration-200"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    languages: formData.languages.filter(l => l !== lang)
                                                })}
                                            >
                                                {lang} <span className="ml-2 opacity-50 text-[10px]">✕</span>
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </InputWrapper>
                        </div>

                        <div className="flex gap-3 pt-8 mt-auto">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                className="text-white hover:bg-white/10 h-12 px-8"
                            >
                                {t("mvpLogin.back")}
                            </Button>
                            <Button
                                onClick={nextStep}
                                disabled={!formData.name || !formData.handle || formData.languages.length === 0}
                                className={`flex-1 bg-white text-black hover:bg-white/90 font-bold h-12 rounded-xl disabled:opacity-50 ${primaryButtonClass}`}
                            >
                                {t("mvpLogin.nextStep")} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full lg:p-10">
                        {/* Top Section */}
                        <StepHeader
                            step={3}
                            title={t("mvpLogin.yourNiche")}
                            benefit={t("mvpLogin.step3Benefit")}
                        />

                        {/* Middle Section (Elastic) */}
                        <div className="flex-1 space-y-4">
                            <InputWrapper label="Primary Niche">
                                <div className="relative group">
                                    <select
                                        className="step-input appearance-none w-full h-14 px-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all cursor-pointer"
                                        value={formData.niche}
                                        onChange={e => setFormData({ ...formData, niche: e.target.value })}
                                    >
                                        <option value="" className="bg-gray-900 text-white/50">Select your specialty...</option>
                                        {creatorNiches.map((niche) => (
                                            <option key={niche} value={niche} className="bg-gray-900">
                                                {niche}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white/70 transition-colors">
                                        <ChevronLeft className="-rotate-90 h-4 w-4" />
                                    </div>
                                </div>
                            </InputWrapper>

                            {formData.niche === 'other' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <InputWrapper label="Specify your Niche">
                                        <input
                                            type="text"
                                            className="step-input w-full h-14 px-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/30"
                                            placeholder="e.g., Underwater Basket Weaving"
                                            value={formData.otherNiche}
                                            onChange={e => setFormData({ ...formData, otherNiche: e.target.value })}
                                            autoFocus
                                        />
                                    </InputWrapper>
                                </div>
                            )}

                            <InputWrapper label={t("mvpLogin.shortBio")} >
                                <textarea
                                    className="step-input min-h-[140px] pt-3 resize-none"
                                    placeholder="Tell brands what makes your content unique..."
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </InputWrapper>
                        </div>

                        {/* Bottom Section (Anchored) */}
                        <div className="flex gap-3 pt-8 mt-auto">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                className="text-white hover:bg-white/10 h-12 px-8"
                            >
                                {t("mvpLogin.back")}
                            </Button>
                            <Button
                                onClick={nextStep}
                                disabled={!formData.niche || (formData.niche === 'other' && !formData.otherNiche)}
                                className={`flex-1 bg-white text-black hover:bg-white/90 font-bold h-12 rounded-xl ${primaryButtonClass}`}
                            >
                                {t("mvpLogin.almostThere")}  <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full text-center lg:p-10">
                        {/* Top Section */}
                        <StepHeader
                            step={4}
                            title="Ready to Join"
                            benefit={t("mvpLogin.step4Benefit")}
                        />

                        {/* Middle Section (Content) */}
                        <div className="flex-1">
                            {error && <p className="text-red-400 text-sm mb-4 bg-red-400/10 py-2 rounded-lg">{error}</p>}

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6 text-left">
                                <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">{t("mvpLogin.reviewSummary")} </h3>
                                <ul className="text-sm text-white/60 space-y-2">
                                    <li><span className="text-white/40">{t("mvpLogin.name")} :</span> {formData.name}</li>
                                    <li><span className="text-white/40">{t("mvpLogin.handle")} :</span> @{formData.handle.replace(/^@/, '')}</li>
                                    <li>
                                        <span className="text-white/40">{t("mvpLogin.niche")} :</span> {
                                            formData.niche === 'other'
                                                ? formData.otherNiche
                                                : (formData.niche || 'Not specified')
                                        }
                                    </li>
                                </ul>
                            </div>

                            {/* Legal Consent Field */}
                            <div className="flex items-start gap-3 px-2 text-left mb-6">
                                <div className="relative flex items-center h-5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-primary transition-all cursor-pointer accent-white"
                                    />
                                </div>
                                <label htmlFor="terms" className="text-xs text-white/60 leading-relaxed cursor-pointer select-none">
                                    {t("mvpLogin.iAgreeToThe")} {" "}
                                    <a href="/terms" target="_blank" className="text-white underline hover:text-blue-400">{t("mvpLogin.termsOfService")} </a>
                                    {" "}{t("mvpLogin.and")}{" "}
                                    <a href="/privacy" target="_blank" className="text-white underline hover:text-blue-400">{t("mvpLogin.privacy")} </a>.
                                    {t("mvpLogin.acknowledgeUse")}
                                </label>
                            </div>
                        </div>

                        {/* Bottom Section (Anchored Actions) */}
                        <div className="mt-auto pt-6">
                            <Button
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting || !agreed}
                                className={`w-full h-14 rounded-2xl font-extrabold text-lg shadow-xl transition-all ${agreed
                                    ? `bg-white text-black hover:bg-gray-200 ${primaryButtonClass}`
                                    : "bg-white/10 text-white/20 cursor-not-allowed"
                                    }`}
                            >
                                {isSubmitting ? t("mvpLogin.creatingAccount") : t("mvpLogin.confirmAndEnter")}
                            </Button>

                            <button
                                onClick={prevStep}
                                disabled={isSubmitting}
                                className="mt-4 text-white/40 text-xs hover:text-white underline disabled:opacity-50 pb-2"
                            >
                                {t("mvpLogin.backToDetails")}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    const seoTitle = useMemo(() => `${t("mvpLogin.startGrowing")} | InfluLink`, [t]);

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-end overflow-hidden bg-black font-sans">
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={t("mvpRegisterBrand.crossBridgeBetween")} />
            </Helmet>
            {!isMobile && (
                <>

                    <div
                        className={`absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[3000ms] ease-out ${isLoaded ? 'scale-105' : 'scale-110'}`}
                        style={{ backgroundImage: `url('${staticBgImage}')` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                    </div>

                    <div className={`hidden lg:flex absolute left-20 bottom-20 z-10 flex-col space-y-4 max-w-xl transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                        <h1 className="text-7xl font-black text-white leading-tight drop-shadow-2xl">
                            {t("mvpLogin.quitWaiting")} ,<br />{t("mvpLogin.startGrowing")} .
                        </h1>
                        <p className="text-xl text-white/80 max-w-md drop-shadow-lg text-left">
                            The most powerful way for creators to bridge the gap between content and commerce.
                            {t("mvpLogin.mostPowerfulWay")}
                        </p>
                    </div>
                </>
            )}

            <div className={`relative z-20 w-full lg:w-[40vw] flex justify-center lg:justify-end lg:pr-32 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div
                    id="form-card-container"
                    className=" w-full
                        h-screen lg:h-[90vh] 2xl:h-[80vh]
                        relative
                        overflow-hidden
                        rounded-none lg:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                    <div className="absolute inset-0 z-0">
                        <MeshGradient
                            width={dimensions.width} height={dimensions.height} colors={colors} distortion={2.5}
                            swirl={0.5}
                            grainMixer={0}
                            grainOverlay={0}
                            speed={0.8}
                            offsetX={0.08}
                        />
                        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
                    </div>

                    <div className="relative z-10 p-5 lg:p-10 h-full overflow-y-auto custom-scrollbar">
                        {renderStepContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const InputWrapper = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col space-y-2">
        {/* h-[15px] ensures the label "row" is always the same height */}
        <label className="h-[15px] text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 ml-1 flex items-center">
            {label}
        </label>
        <div className="relative">
            {children}
        </div>
    </div>
);

export default RegisterCreator;