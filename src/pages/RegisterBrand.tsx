import React, { useState, useEffect } from 'react';
import RegistrationForm from '@/components/AuthForm';
import { ArrowRight, Globe, Building2, Briefcase, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import staticBgImage from '../assets/registerBack5.jpg';
import { MeshGradient } from '@paper-design/shaders-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { BsQuestionCircleFill } from 'react-icons/bs';
import { useCreatorNiches } from '@/data/mockCreators';

// Brand-specific industries instead of creator niches

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
                <span className="font-semibold text-white">Brand Advantage:</span> {benefit}
            </p>
        </div>
    </div>
);

const RegisterBrand = () => {
    // 🎨 Professional Brand Palette: Deep Slates and Navys
    const colors = ["#90d5f3ff", "#6EC5E9", "#1E88E5"];
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isLoaded, setIsLoaded] = useState(false);
    const [step, setStep] = useState(1);
    const [isRegister, setIsRegister] = useState(true);
    const BRAND_INDUSTRIES = useCreatorNiches();

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
        const container = document.getElementById("hero-container");
        if (container) setDimensions({ width: container.offsetWidth, height: container.offsetHeight });
    }, []);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Registration failed.");

            setUser({
                id: data.user.id,
                email: data.user.email,
                username: data.user.handle,
                accountType: 'brand',
                isVIP: false
            });
            setToken(data.token || null);
            setRegistered(true);
            setAccountType("brand");
            navigate('/profile/me');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const primaryButtonClass = 'bg-gradient-to-br from-primary to-secondary text-white hover:bg-primary/90';
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <RegistrationForm
                        accountType="brand"
                        isMultiStep={true}
                        title={isRegister ? "Launch Your Brand" : "Welcome Back"}
                        description="Let's set up your business account."
                        onSuccess={(step1Data: any) => {
                            setFormData(prev => ({ ...prev, ...step1Data }));
                            setStep(2);
                        }}
                        changeFormMode={() => setIsRegister(!isRegister)}
                    />
                );
            case 2:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full p-10">
                        <StepHeader
                            step={2}
                            title="Business Identity"
                            benefit="Your brand name and headquarters location help us match you with creators who align with your regional market goals."
                        />
                        <div className="flex-1 space-y-6">
                            <InputWrapper label="Company Name">
                                <input className="step-input" placeholder="e.g. Acme Corp" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </InputWrapper>
                            <InputWrapper label="Brand Username">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">@</span>
                                    <input className="step-input pl-8" placeholder="acme_official" value={formData.handle} onChange={e => setFormData({ ...formData, handle: e.target.value })} />
                                </div>
                            </InputWrapper>
                            <InputWrapper label="Headquarters (City, Country)">
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                    <input className="step-input pl-11" placeholder="New York, USA" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                            </InputWrapper>
                        </div>
                        <div className="flex gap-3 pt-8 mt-auto">
                            <Button variant="ghost" onClick={prevStep} className="text-white hover:bg-white/10 h-12 px-8">Back</Button>
                            <Button onClick={nextStep} disabled={!formData.name || !formData.handle} className={`flex-1 bg-white text-black font-bold h-12 rounded-xl ${primaryButtonClass}`}>Next Step <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full p-10">
                        <StepHeader
                            step={3}
                            title="Industry Focus"
                            benefit="Selecting your industry allows our algorithm to recommend creators with a proven track record in your specific market segment."
                        />
                        <div className="flex-1 space-y-4">
                            <InputWrapper label="Primary Industry">
                                <div className="relative group">
                                    <select
                                        className="step-input appearance-none w-full h-14 px-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all cursor-pointer"
                                        value={formData.niche}
                                        onChange={e => setFormData({ ...formData, niche: e.target.value })}
                                    >
                                        <option value="" className="bg-gray-900 text-white/50">Select your industry...</option>
                                        {BRAND_INDUSTRIES.map((niche) => (
                                            <option key={niche} value={niche.toLowerCase()} className="bg-gray-900">
                                                {niche}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white/70 transition-colors">
                                        <ChevronLeft className="-rotate-90 h-4 w-4" />
                                    </div>
                                </div>
                            </InputWrapper>
                            <InputWrapper label="Company Bio / Mission">
                                <textarea className="step-input min-h-[140px] pt-3 resize-none" placeholder="Tell creators what your brand stands for..." value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                            </InputWrapper>
                        </div>
                        <div className="flex gap-3 pt-8 mt-auto">
                            <Button variant="ghost" onClick={prevStep} className="text-white hover:bg-white/10 h-12 px-8">Back</Button>
                            <Button onClick={nextStep} disabled={!formData.niche} className={`flex-1 bg-white text-black font-bold h-12 rounded-xl ${primaryButtonClass}`}>Finalize <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full text-center p-10">
                        <StepHeader step={4} title="Partner with Pros" benefit="By joining, you unlock the ability to post campaigns and use our automated creator contracting tools." />
                        <div className="flex-1">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6 text-left">
                                <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Business Summary</h3>
                                <ul className="text-sm text-white/60 space-y-2">
                                    <li><span className="text-white/40">Brand:</span> {formData.name}</li>
                                    <li><span className="text-white/40">Industry:</span> {formData.niche}</li>
                                </ul>
                            </div>
                            <div className="flex items-start gap-3 px-2 text-left mb-6">
                                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-5 h-5" />
                                <label className="text-xs text-white/60">I agree to the Terms for Business Partners and Privacy Policy.</label>
                            </div>
                        </div>
                        <div className="mt-auto pt-6">
                            <Button onClick={handleFinalSubmit} disabled={isSubmitting || !agreed} className={`w-full h-14 rounded-2xl font-extrabold text-lg bg-white text-black ${primaryButtonClass}`}>
                                {isSubmitting ? "Creating Brand Profile..." : "Confirm & Launch"}
                            </Button>
                            <button onClick={prevStep} className="mt-4 text-white/40 text-xs underline">Back to info</button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-black">
            <div className={`hidden lg:block lg:w-[55%] relative transition-all duration-1000 ${isLoaded ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ backgroundImage: `url('${staticBgImage}')`, backgroundSize: 'cover' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-20 flex flex-col justify-end">
                    <div className={`space-y-4 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h1 className="text-6xl font-black text-white leading-tight">Scale Your<br />Influence.</h1>
                        <p className="text-xl text-white/60 max-w-md">The streamlined platform for brands to discover, contract, and manage top-tier creator talent.</p>
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-[50%] flex items-center justify-center relative bg-white">
                <div className="w-full max-w-[70%] h-[80vh] relative z-10 overflow-hidden rounded-[40px] shadow-2xl">
                    <div id='hero-container' className="absolute inset-0 z-0">
                        <MeshGradient width={dimensions.width} height={dimensions.height} colors={colors} distortion={2.5}
                            swirl={0.5}
                            grainMixer={0}
                            grainOverlay={0}
                            speed={0.8}
                            offsetX={0.08} />
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                    </div>
                    <div className="relative z-10 p-12 overflow-y-auto h-full custom-scrollbar">
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