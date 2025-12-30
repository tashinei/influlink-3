import React, { useState, useEffect } from 'react';
import RegistrationForm from '@/components/AuthForm';
import { User } from 'lucide-react';

import staticBgImage from '../assets/registerBack5.jpg';

import { MeshGradient } from '@paper-design/shaders-react';

const VerticalWaveSeparator: React.FC = () => {
    return (
        <div className="absolute inset-y-0 right-0 w-16 lg:w-20 z-10 overflow-hidden pointer-events-none">
            <svg
                className="h-full w-full animate-wave-shift" // Apply the animation here
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 1000"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
            >
                <path
                    d="
                      M 100 0
                      C 60 150, 20 150, 60 333
                      C 100 516, 20 516, 70 666
                      C 100 833, 30 833, 60 1000
                      L 100 1000
                      L 100 0
                      Z
                    "
                    fill="white" // Ensure the fill color is black/dark to contrast the image
                />
            </svg>
        </div>
    );
};

const useFormContainerDimensions = () => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const FORM_MAX_WIDTH = 672; // Max-width for max-w-md

    useEffect(() => {
        const updateDimensions = () => {
            const availableWidth = window.innerWidth / 2;
            const formWidth = Math.min(availableWidth, FORM_MAX_WIDTH);

            setDimensions({
                width: formWidth,
                height: window.innerHeight
            });
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);
    return dimensions;
};

const RegisterCreator = () => {
    const dimensions = useFormContainerDimensions();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isRegister, setIsRegister] = useState(true);

    useEffect(() => {
        // Use a slight delay to ensure the component is fully rendered before animation starts
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSetFormMode=()=>{
        setIsRegister(!isRegister);
    }

    const colors = ["#1E88E5", "#6EC5E9", "#90d5f3ff"];
    const distortion = 2.5;
    const swirl = 1.5;
    const speed = 0.9;
    const offsetX = 0.5;
    const overlayColor = "black"; // Deep blue/black overlay
    const veilOpacity = "opacity-40"; // Sufficiently dark to let the form content (white text) stand out

    const transitionClasses = "transition-all duration-700 ease-in-out";

    const leftPanelTransform = isLoaded ? 'translate-x-0' : '-translate-x-full lg:translate-x-0';

    const rightPanelTransform = isLoaded ? 'translate-x-0' : 'translate-x-full lg:translate-x-0';

    const leftContentClasses = isLoaded
        ? 'opacity-100 translate-y-0 duration-[1500ms] delay-[700ms]'
        : 'opacity-0 translate-y-8 duration-[1500ms]';

    const formContentClasses = isLoaded
        ? 'opacity-100 translate-y-0 duration-[1500ms] delay-[900ms]'
        : 'opacity-0 translate-y-8 duration-[1500ms]';

    return (
        <div className="flex h-screen overflow-hidden">

            {/* 🖼️ Left Panel: Static Image with Overlay (55% Width) */}
            <div className={`hidden lg:block lg:w-[55%] relative bg-cover bg-center ${transitionClasses} ${leftPanelTransform}`}
                style={{ backgroundImage: `url('${staticBgImage}')` }}
            >
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent p-16 flex flex-col justify-end`}>
                    <h1 className={`text-5xl font-extrabold text-white mb-3 leading-tight ${transitionClasses} ${leftContentClasses}`}>
                        Amplify Your Influence
                    </h1>
                    <p className={`text-lg text-white/80 max-w-md ${transitionClasses} ${leftContentClasses}`}>
                        Connect with leading brands and turn your content into opportunities.
                    </p>
                </div>

                <VerticalWaveSeparator />
            </div>

            {/* 📝 Right Panel: Form Container with Mesh Gradient (50% Width) */}
            <div className={`w-full lg:w-1/2 flex items-center justify-center bg-[white] overflow-y-auto ${transitionClasses} ${rightPanelTransform}`}>

                {/* --- Form Box with Mesh Gradient Background --- */}
                <div className="relative w-full max-w-2xl h-[95vh] sm:h-[85dvh] sm:max-h-[90vh] overflow-hidden rounded-[60px] justify-center shadow-2xl shadow-black" style={{ alignItems: "center" }}>

                    {/* 1. Mesh Gradient Background Layer (Behind the form content) */}
                    <div className="absolute inset-0 z-0">
                        <MeshGradient
                            width={dimensions.width}
                            height={dimensions.height}
                            colors={colors}
                            distortion={distortion}
                            swirl={swirl}
                            grainMixer={0}
                            grainOverlay={0}
                            speed={speed}
                            offsetX={offsetX}
                        />

                        {/* 2. Dark Overlay/Veil */}
                        <div
                            className={`absolute inset-0 pointer-events-none ${veilOpacity}`}
                            style={{ backgroundColor: overlayColor }}
                        />
                    </div>

                    {/* 3. Form Content Layer (Above the gradient) */}
                    <div className="flex justify-center align-middle relative z-10 p-8 sm:p-10 text-white overflow-y-auto h-full shadow-2xl">

                        {/* Animated Form Content Wrapper */}
                        <div className={`transform ${transitionClasses} ${formContentClasses}`}>
                            <RegistrationForm
                                accountType="creator"
                                title={isRegister ? "Become a Creator!" : "Welcome back!"}
                                description={isRegister ? "Sign up in seconds to start connecting with leading brands." : "Login and start connecting with leading brands immediately."}
                                icon={<User className="h-6 w-6 text-white" />}
                                changeFormMode={handleSetFormMode}
                            />
                        </div>
                    </div>
                </div>
                {/* --- End Form Box --- */}

            </div>
        </div>
    );
};

export default RegisterCreator;