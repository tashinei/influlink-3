import React, { useState, useEffect, useMemo } from 'react';
import RegistrationForm from '@/components/AuthForm';
import { ArrowRight, Globe, Building2, Briefcase, ChevronLeft, AlertCircle } from 'lucide-react';
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

// Brand-specific industries instead of creator niches

const RegisterBrand = () => {
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
                    <span className="font-semibold text-white">{t("mvpRegisterBrand.brandAdvantage")}:</span> {benefit}
                </p>
            </div>
        </div>
    );
    // 🎨 Professional Brand Palette: Deep Slates and Navys
    const colors = ["#90d5f3ff", "#6EC5E9", "#1E88E5"];
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isLoaded, setIsLoaded] = useState(false);
    const [step, setStep] = useState(1);
    const [isRegister, setIsRegister] = useState(true);
    const BRAND_INDUSTRIES = useCreatorNiches();
    const isMobile = useIsMobile();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const updateDimensions = (entries: ResizeObserverEntry[]) => {
        const entry = entries[0];
        if (entry) {
            setDimensions({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
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

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        handle: '',
        location: '',
        niche: '',
        otherNiche: '',
        bio: '',
        accountType: 'brand'
    });

    const navigate = useNavigate();
    const { setUser, setRegistered, setAccountType, setToken } = useUserStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        const container = document.getElementById("form-card-container");
        if (container) setDimensions({ width: container.offsetWidth, height: container.offsetHeight });
    }, []);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

            const token = useUserStore.getState().token;
            const isGoogleAuth = !!token;

            const payload = {
                ...formData,
                accountType: 'brand'
            };

            // 3. API Request
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(isGoogleAuth && { 'Authorization': `Bearer ${token}` })
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    setStep(2);
                    throw new Error(data.message || "This brand handle is already taken.");
                }
                throw new Error(data.message || "Registration failed.");
            }

            setUser({
                id: data.user.id,
                email: data.user.email,
                username: data.user.username || data.user.handle,
                profileImage: data.user.profileImage || '',
                isVIP: data.user.isVIP || false,
                accountType: 'brand'
            });

            if (data.token) setToken(data.token);

            setRegistered(true);
            setAccountType("brand");

            // 6. Cleanup
            sessionStorage.removeItem('registration_draft');
            navigate('/profile/me');

        } catch (err: any) {
            console.error("Brand Final Submission Error:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fromGoogle = searchParams.get("fromGoogle");
        const token = searchParams.get('token');
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        if (fromGoogle) {
            const handleGoogleExchange = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/auth/exchange-google-token`, {
                        credentials: 'include'
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setToken(data.token);
                        setUser(data.user);
                        setAccountType('brand');
                        setFormData(prev => ({
                            ...prev,
                            email: data.user.email,
                            name: data.user.name || ''
                        }));
                        setStep(2);
                        window.history.replaceState({}, document.title, window.location.pathname + "?isGoogleAuth=true");
                    } else {
                        navigate('/register/creator?error=session_expired');
                    }
                } catch (err) {
                    setError("Google sync failed. Please try again.");
                }
            };
            handleGoogleExchange();
        } else if (token && searchParams.get('isGoogleAuth') === 'true') {
            setToken(token);
            setAccountType('brand');
            setFormData(prev => ({
                ...prev,
                email: searchParams.get('email') || prev.email,
                name: searchParams.get('name') || prev.name,
            }));
            setStep(2);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [searchParams]);

    const primaryButtonClass = 'bg-gradient-to-br from-primary to-secondary text-white hover:bg-primary/90';
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <RegistrationForm
                        accountType="brand"
                        isMultiStep={true}
                        title={isRegister ? t("mvpRegisterBrand.launchYourBrand") : t("mvpRegisterBrand.welcomeBack")}
                        description={isRegister ? t("mvpLogin.letsSecureFirst") : t("mvpRegisterBrand.descLoginCreators")}
                        onSuccess={(step1Data: any) => {
                            setFormData(prev => ({ ...prev, ...step1Data }));
                            setStep(2);
                        }}
                        changeFormMode={() => setIsRegister(!isRegister)}
                    />
                );
            case 2:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full lg:p-10">
                        <StepHeader
                            step={2}
                            title={t("mvpRegisterBrand.businessIdentity")}
                            benefit={t("mvpRegisterBrand.benefit1")}
                        />
                        <div className="flex-1 space-y-6">
                            <InputWrapper label={t("mvpRegisterBrand.companyName")}>
                                <input className="step-input" placeholder="e.g. Acme Corp" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </InputWrapper>
                            <InputWrapper label={t("mvpRegisterBrand.brandUsername")}>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">@</span>
                                    <input className="step-input !pl-10" placeholder="acme_official" value={formData.handle} onChange={e => setFormData({ ...formData, handle: e.target.value })} />
                                </div>
                            </InputWrapper>
                            <InputWrapper label={`${t("mvpRegisterBrand.headquarters")} (${t("mvpRegisterBrand.cityCountry")})`}>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                    <input className="step-input !pl-10" placeholder="New York, USA" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                            </InputWrapper>
                        </div>
                        <div className="flex gap-3 pt-8 mt-auto">
                            <Button variant="ghost" onClick={prevStep} className="text-white hover:bg-white/10 h-12 px-8">{t("mvpRegisterBrand.back")}</Button>
                            <Button onClick={nextStep} disabled={!formData.name || !formData.handle} className={`flex-1 bg-white text-black font-bold h-12 rounded-xl ${primaryButtonClass}`}>{t("mvpRegisterBrand.nextStep")} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full lg:p-10">
                        <StepHeader
                            step={3}
                            title={t("mvpRegisterBrand.industryFocus")}
                            benefit={t("mvpRegisterBrand.benefit2")}
                        />
                        <div className="flex-1 space-y-4">
                            <InputWrapper label={t("mvpRegisterBrand.primaryIndustry")}>
                                <div className="relative group">
                                    <select
                                        className="step-input appearance-none w-full h-14 px-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all cursor-pointer"
                                        value={formData.niche}
                                        onChange={e => setFormData({ ...formData, niche: e.target.value })}
                                    >
                                        <option value="" className="bg-gray-900 text-white/50">{t("mvpRegisterBrand.selectYourIndustry")}...</option>
                                        {BRAND_INDUSTRIES.map((niche) => (
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
                            <InputWrapper label={t("mvpRegisterBrand.companyBioMission")}>
                                <textarea className="step-input min-h-[140px] pt-3 resize-none" placeholder={`${t("mvpRegisterBrand.tellCreatorsWhatStand")}...`} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                            </InputWrapper>
                        </div>
                        <div className="flex gap-3 pt-8 mt-auto">
                            <Button variant="ghost" onClick={prevStep} className="text-white hover:bg-white/10 h-12 px-8">{t("mvpRegisterBrand.back")}</Button>
                            <Button onClick={nextStep} disabled={!formData.niche} className={`flex-1 bg-white text-black font-bold h-12 rounded-xl ${primaryButtonClass}`}>{t("mvpRegisterBrand.finalize")} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full text-center lg:p-10">
                        <StepHeader step={4} title={t("mvpRegisterBrand.partnerWithPros")} benefit={t("mvpRegisterBrand.benefit3")} />
                        <div className="flex-1">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6 text-left">
                                <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">{t("mvpRegisterBrand.businessSummary")}</h3>
                                <ul className="text-sm text-white/60 space-y-2">
                                    <li><span className="text-white/40">{t("mvpRegisterBrand.brand")}:</span> {formData.name}</li>
                                    <li><span className="text-white/40">{t("mvpRegisterBrand.industry")}:</span> {formData.niche}</li>
                                </ul>
                            </div>
                            <div className="flex items-start gap-3 px-2 text-left mb-6">
                                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-5 h-5" />
                                <label className="text-xs text-white/60">{t("mvpRegisterBrand.agreeTermsPolicy")}</label>
                            </div>
                        </div>
                        <div className="mt-auto pt-6">
                            <Button onClick={handleFinalSubmit} disabled={isSubmitting || !agreed} className={`w-full h-14 rounded-2xl font-extrabold text-lg bg-white text-black ${primaryButtonClass}`}>
                                {isSubmitting ? t("mvpRegisterBrand.creatingBrandProfile") : t("mvpRegisterBrand.confirmLaunch")}
                            </Button>
                            <button onClick={prevStep} className="mt-4 text-white/40 text-xs underline">{t("mvpRegisterBrand.backDetails")}</button>
                        </div>
                    </div>
                );
        }
    };

    const seoTitle = useMemo(() => `${t("mvpRegisterBrand.launchYourBrand")} | InfluLink`, [t]);

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const isGoogleAuth = searchParams.get('isGoogleAuth');

        if (token && isGoogleAuth === 'true') {
            setToken(token);
            setAccountType('brand');

            setFormData(prev => ({
                ...prev,
                email: email || prev.email,
                name: name || prev.name,
            }));

            setStep(2);

            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, [searchParams, setToken, setAccountType]);

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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-transparent" />
                    </div>

                    <div className={`hidden lg:flex absolute left-20 bottom-20 z-10 flex-col space-y-4 max-w-xl transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                        <h1 className="text-7xl font-black text-white leading-tight drop-shadow-2xl">
                            {t("mvpRegisterBrand.buildYour")}<br />{t("mvpRegisterBrand.brandLegacy")}.
                        </h1>
                        <p className="text-xl text-white/80 max-w-md drop-shadow-lg">
                            {t("mvpRegisterBrand.crossBridgeBetween")}
                        </p>
                    </div>
                </>
            )}

            <div className={`relative z-20 w-full lg:w-[40vw] flex justify-center lg:justify-end lg:pr-32 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div id="form-card-container" className="w-full
                        h-screen lg:h-[90vh] 2xl:h-[80vh]
                        relative
                        overflow-hidden
                        rounded-none lg:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-0 z-0">
                        <MeshGradient
                            width={dimensions.width} height={dimensions.height} colors={colors} distortion={2.5}
                            swirl={0.5} speed={0.8} offsetX={0.08}
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

const InputWrapper = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 ml-1">{label}</label>
        {children}
    </div>
);

export default RegisterBrand;