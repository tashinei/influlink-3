import React, { useState, useEffect } from 'react';
import RegistrationForm from '@/components/AuthForm'; // Step 1
import {
    ArrowRight,
    ChevronLeft,
    Globe,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import staticBgImage from '../assets/registerBackLatest2.jpg';
import { MeshGradient } from '@paper-design/shaders-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { BsQuestionCircleFill } from 'react-icons/bs';
import { useCreatorNiches } from '@/data/mockCreators';

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
                <span className="font-semibold text-white">Why this matters:</span> {benefit}
            </p>
        </div>
    </div>
);

const RegisterCreator = () => {
    const colors = ["#90d5f3ff", "#6EC5E9", "#1E88E5"];
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });
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

    const encodeData = (data) => btoa(JSON.stringify(data));
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
    const [isRegister, setIsRegister] = useState(true);
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
    const { setUser, setRegistered, setAccountType, setToken } = useUserStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedData = sessionStorage.getItem('registration_draft');
        if (savedData) {
            const decoded = decodeData(savedData);
            if (decoded) {
                setFormData(decoded);
                if (decoded.handle) setStep(3);
                else if (decoded.email) setStep(2);
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

            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Important for cookies/sessions
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed at the final step.");
            }

            setUser({
                id: data.user.id,
                email: data.user.email,
                username: data.user.handle || data.user.username, // Using handle as username
                profileImage: data.user.profileImage || '',
                isVIP: data.user.isVIP || false,
                accountType: data.user.accountType
            });

            setToken(data.token || null);
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

    const [agreed, setAgreed] = useState(false);

    const primaryButtonClass = 'bg-gradient-to-br from-primary to-secondary text-white hover:bg-primary/90';
    const creatorNiches = useCreatorNiches();
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <RegistrationForm
                        accountType="creator"
                        isMultiStep={true} // This tells the form "Don't hit the DB yet!"
                        title={isRegister ? "Become a Creator!" : "Welcome Back"}
                        description="First, let's secure your account."
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
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full p-10">
                        {/* Top Section: Header */}
                        <StepHeader
                            step={2}
                            title="Your Identity"
                            benefit="A professional handle and location help brands find you in local search results and verify your audience reach."
                        />

                        {/* Middle Section: Inputs (This fills the space) */}
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <InputWrapper label="Full Name">
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
                                            className="step-input pl-8"
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

                            <InputWrapper label="Location (City, Country)">
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                    <input
                                        className="step-input pl-11"
                                        placeholder="London, UK"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </InputWrapper>
                        </div>

                        {/* Bottom Section: Buttons (Anchored) */}
                        <div className="flex gap-3 pt-8 mt-auto">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                className="text-white hover:bg-white/10 h-12 px-8"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={nextStep}
                                disabled={!formData.name || !formData.handle}
                                className={`flex-1 bg-white text-black hover:bg-white/90 font-bold h-12 rounded-xl disabled:opacity-50 ${primaryButtonClass}`}
                            >
                                Next Step <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full p-10">
                        {/* Top Section */}
                        <StepHeader
                            step={3}
                            title="Your Niche"
                            benefit="Defining your category and bio lets our AI match you with campaigns that fit your actual content style, increasing your acceptance rate."
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

                            <InputWrapper label="Short Bio">
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
                                Back
                            </Button>
                            <Button
                                onClick={nextStep}
                                disabled={!formData.niche || (formData.niche === 'other' && !formData.otherNiche)}
                                className={`flex-1 bg-white text-black hover:bg-white/90 font-bold h-12 rounded-xl ${primaryButtonClass}`}
                            >
                                Almost There <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full text-center p-10">
                        {/* Top Section */}
                        <StepHeader
                            step={4}
                            title="Ready to Join"
                            benefit="By joining, you gain access to our campaign marketplace and creator analytics suite."
                        />

                        {/* Middle Section (Content) */}
                        <div className="flex-1">
                            {error && <p className="text-red-400 text-sm mb-4 bg-red-400/10 py-2 rounded-lg">{error}</p>}

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6 text-left">
                                <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Review Summary</h3>
                                <ul className="text-sm text-white/60 space-y-2">
                                    <li><span className="text-white/40">Name:</span> {formData.name}</li>
                                    <li><span className="text-white/40">Handle:</span> @{formData.handle.replace(/^@/, '')}</li>
                                    <li>
                                        <span className="text-white/40">Niche:</span> {
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
                                    I agree to the{" "}
                                    <a href="/terms" target="_blank" className="text-white underline hover:text-blue-400">Terms of Service</a>
                                    {" "}and{" "}
                                    <a href="/privacy" target="_blank" className="text-white underline hover:text-blue-400">Privacy Policy</a>.
                                    I acknowledge the use of essential cookies for account security.
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
                                {isSubmitting ? "Creating Account..." : "Confirm & Enter InfluLink"}
                            </Button>

                            <button
                                onClick={prevStep}
                                disabled={isSubmitting}
                                className="mt-4 text-white/40 text-xs hover:text-white underline disabled:opacity-50 pb-2"
                            >
                                Back to details
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-end overflow-hidden bg-black font-sans">
            
            {/* 🖼️ FULL PAGE BACKGROUND IMAGE */}
            <div 
                className={`absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[3000ms] ease-out ${isLoaded ? 'scale-105' : 'scale-110'}`}
                style={{ backgroundImage: `url('${staticBgImage}')`}}
            >
                {/* Vignette/Overlay: 
                   - Darker on the right (via black/60) to provide contrast for the form.
                   - Clearer on the left to see the influencer.
                */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-transparent" />
            </div>

            <div className={`hidden lg:flex absolute left-20 bottom-20 z-10 flex-col space-y-4 max-w-xl transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <h1 className="text-7xl font-black text-white leading-tight drop-shadow-2xl">
                    Your Content.<br />Your Career.
                </h1>
                <p className="text-xl text-white/80 max-w-md drop-shadow-lg">
                    The most powerful way for creators to bridge the gap between content and commerce.
                </p>
            </div>

            <div className={`relative z-20 w-full lg:w-[40vw] flex justify-center lg:justify-end lg:pr-32 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div 
                    id="form-card-container" 
                    className="w-full h-[80vh] relative overflow-hidden rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
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

                    <div className="relative z-10 p-10 h-full overflow-y-auto custom-scrollbar">
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