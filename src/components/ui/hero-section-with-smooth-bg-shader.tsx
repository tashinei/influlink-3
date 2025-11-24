import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";
import { ArrowRight, MailIcon, TrendingUpIcon, LucideUserRoundSearch } from "lucide-react";

interface HeroSectionProps {
  title?: string;
  highlightText?: string;
  description?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  colors?: string[];
  distortion?: number;
  swirl?: number;
  speed?: number;
  offsetX?: number;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  buttonClassName?: string;
  maxWidth?: string;
  veilOpacity?: string;
  fontFamily?: string;
  fontWeight?: number;
  overlayColor?: string;
}

export function HeroSection({
  title = "Intelligent AI Agents for",
  highlightText = "Smart Brands",
  description = "Transform your brand and evolve it through AI-driven brand guidelines and always up-to-date core components.",
  buttonText = "Join Waitlist",
  secondaryButtonText = "Свържете се с нас",
  onButtonClick,
  onSecondaryButtonClick,
  colors = ["#5b8dfb", "#1e3a8a", "#ffffff", "#f49b42",],
  distortion = 0.5,
  swirl = 0.5,
  speed = 0.3,
  offsetX = 0.08,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  buttonClassName = "",
  maxWidth = "max-w-6xl",
  veilOpacity = "bg-white/20 dark:bg-black/25",
  fontFamily = "inherit",
  fontWeight = 700,
  overlayColor = "rgba(0,0,0,0.55)",
}: HeroSectionProps) {
  const [dimensions, setDimensions] = useState({ width: 480, height: 270 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set dimensions once to the hero container size
    const container = document.getElementById("hero-container");
    if (container) {
      setDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    }
  }, []);


  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
  };

  const handleSecondaryButtonClick = () => {
    if (onSecondaryButtonClick) {
      onSecondaryButtonClick();
    }
  };

  return (
    <section
      id="hero-container"
      className={`relative w-full min-h-[100vh] overflow-hidden bg-background flex items-center justify-center ${className}`}
    >
      <div className="absolute inset-0 w-full h-full "
        style={{ willChange: "transform" }}>
        {mounted && (
          <>
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
            <div
              className={`absolute inset-0 pointer-events-none ${veilOpacity}`}
              style={{ backgroundColor: overlayColor }}
            />
          </>
        )}
      </div>

      <div style={{ paddingTop: "50px" }} className={`relative z-10 ${maxWidth} mx-auto px-6 w-full`}>
        <div className="text-center">
          <h1
            className={`text-white font-bold text-foreground text-balance text-[2.7rem] sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-[1.1] mb-6 ${titleClassName}`}
            style={{ fontFamily, fontWeight }}
          >
            {title}{" "}
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              {highlightText}
            </span>
          </h1>
          <p
            className={`text-white text-[1.15rem] sm:text-xl text-foreground text-pretty max-w-2xl mx-auto leading-relaxed mb-10 px-4 ${descriptionClassName}`}
          >
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{marginTop:"20px"}}>
            <button
              onClick={handleButtonClick}
              // Fixed: Removed redundant 'bg-primary' and added scale animation
              className={`
                bg-gradient-to-r from-secondary to-primary 
                px-8 py-5 md:px-10 md:py-5 rounded-full 
                text-primary-foreground 
                transition duration-300 ease-in-out 
                hover:scale-105 hover:shadow-lg
                text-[17px] font-medium w-[72%] md:w-[27%] md:text-[19px]
                ${buttonClassName}
            `} style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
              {buttonText}
              <LucideUserRoundSearch style={{ alignSelf: "center" }} height={20} size={20}></LucideUserRoundSearch>
            </button>
            {secondaryButtonText && (
              <button
                onClick={handleSecondaryButtonClick}
                className="
                bg-gradient-to-l from-secondary to-primary 
                px-8 py-5 md:px-10 md:py-5 rounded-full 
                text-primary-foreground 
                transition duration-300 ease-in-out 
                hover:scale-105 hover:shadow-lg
                text-[17px] font-medium w-[72%] md:w-[27%] md:text-[19px]"
                style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}
              >
                {secondaryButtonText}
                <TrendingUpIcon style={{ alignSelf: "center" }} height={20} size={22}></TrendingUpIcon>
              </button>
            )}
          </div>
        </div>
      </div>
    </section >
  );
}
