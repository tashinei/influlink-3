import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/store/useUserStore";
import { MeshGradient } from "@paper-design/shaders-react";
import { ArrowDown, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
    onExploreClick: () => void;
    onJoinClick: () => void;
}

const HeroSection = ({ onExploreClick, onJoinClick }: HeroSectionProps) => {
    const colors = ["#90d5f3ff", "#6EC5E9", "#1E88E5"];
    const veilOpacity = "bg-black/5"
    const overlayColor = "rgba(0,0,0,0.35)";
    const { t } = useTranslation();

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

    useEffect(() => {
        setMounted(true);
        const container = document.getElementById("hero-container");

        if (!container) return;

        const observer = new ResizeObserver(updateDimensions);

        // Start observing the container
        observer.observe(container);

        if (container.offsetWidth > 0) {
            updateDimensions([{ contentRect: container.getBoundingClientRect() } as ResizeObserverEntry]);
        }

        return () => {
            observer.unobserve(container);
            observer.disconnect();
        };
    }, []);

    const navigate = useNavigate();

    // 3. Get user data from store
    const { token, user, isRegistered } = useUserStore();

    const handlePrimaryAction = () => {
        if (token && user) {
            navigate(`/profile/me`);
        } else {
            onJoinClick();
        }
    };

    return (
        <section
            id="hero-container"
            className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden"
        >
            <div className="absolute inset-0 w-full h-full"
                style={{ willChange: "transform" }}>
                {mounted && dimensions.width > 0 && dimensions.height > 0 && (
                    <>
                        <MeshGradient
                            width={dimensions.width}
                            height={dimensions.height}
                            colors={colors}
                            distortion={2.5}
                            swirl={0.5}
                            grainMixer={0}
                            grainOverlay={0}
                            speed={0.8}
                            offsetX={0.08}
                        />
                        <div
                            className={`absolute inset-0 pointer-events-none ${veilOpacity}`}
                            style={{ backgroundColor: overlayColor }}
                        />
                    </>
                )}
            </div>

            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="relative z-10 container mx-auto px-4 text-center">
                {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border mb-8">
                    <span className="text-sm font-medium text-foreground">Global Reach. Local impact.</span>
                </div> */}

                <h1 className="text-5xl md:text-7xl font-bold text-[white] mb-6 leading-tight mt-8">
                    {t("mvpHero.titleFirst")} <span className="bg-gradient-to-br from-tertiary via-secondary to-primary bg-clip-text text-transparent">{t("mvpHero.titleSecond")}</span> {t("mvpHero.titleThird")} <span className="bg-gradient-to-tr from-tertiary via-secondary to-primary bg-clip-text text-transparent">{t("mvpHero.titleFourth")}</span>
                </h1>

                <p className="text-xl md:text-2xl text-[white] max-w-3xl mx-auto mb-12">
                    {t("mvpHero.subtext")}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        size="lg"
                        onClick={onExploreClick}
                        className="border-2 border-primary hover:border-primary hover:bg-primary/5 hover:text-[white] px-8 py-6 text-lg rounded-[50px] bg-transparent text-[white]"
                    >
                        {t("mvpHero.secondaryButton")}
                        <ArrowDown className="ml-2 w-5 h-5" />
                    </Button>

                    <Button
                        size="lg"
                        onClick={handlePrimaryAction}
                        className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-[white] px-8 py-6 text-lg shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 rounded-[50px]"
                    >
                        {token ? t("mvpHero.profileButton") : t("mvpHero.primaryButton")}
                    </Button>
                </div>
            </div>

            {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <ArrowDown className="w-6 h-6 text-white" />
            </div> */}
        </section>
    );
};

export default HeroSection;