import React from "react";
import { cn } from "@/lib/utils";

export default function CTASection({handleClickCta}) {
    return (
        <section className="relative w-full max-w-6xl mx-auto overflow-hidden lg:rounded-[2.5rem] bg-[#1a4d6b] shadow-2xl group/section">
            <div
                className="absolute inset-0 z-0 opacity-60"
                style={{
                    background: `radial-gradient(circle at 15% 50%, #4facfe 0%, transparent 50%), 
                                 radial-gradient(circle at 85% 30%, #00f2fe 0%, transparent 50%)`
                }}
            />
            <div
                className="absolute inset-0 z-10 opacity-30 mix-blend-overlay grayscale contrast-150"
                style={{
                    backgroundImage: `url('/firstPlaceholder.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            <div className="absolute left-[-5%] top-0 h-full w-full pointer-events-none overflow-hidden z-20">
                <div
                    className={cn(
                        "absolute top-[-10%] left-[-10%] w-[80%] h-[120%]",
                        "bg-[#4facfe] rounded-[100%] blur-[60px] rotate-[-15deg] opacity-40",
                        "animate-pulse duration-[8s]"
                    )}
                />

                <div
                    className={cn(
                        "absolute top-[15%] left-[0%] w-[70%] h-[70%]",
                        "border-l-[25px] border-[#00f2fe]/40 rounded-[100%]",
                        "blur-[30px] rotate-[-20deg]"
                    )}
                />

                <div
                    className={cn(
                        "absolute top-[35%] left-[-5%] w-[50%] h-[40%]",
                        "bg-gradient-to-r from-white/30 via-white/10 to-transparent",
                        "rounded-full blur-[50px] rotate-[-12deg]"
                    )}
                />
            </div>

            <div className="relative z-30 flex flex-col md:flex-row items-center justify-between px-10 py-16 md:px-16 md:py-24 gap-12 text-white">

                <div className="max-w-xl space-y-6 text-left">
                    <h2 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                        Ready to reach <br />
                        <span className="text-secondary brightness-150 drop-shadow-sm">
                            the right audience?
                        </span>
                    </h2>
                    <p className="text-lg text-gray/30 max-w-md font-medium leading-relaxed">
                        Launch your next campaign or start earning from your content.
                        We provide the tools to help you create real progress.
                    </p>
                </div>

                <button
                    className={cn(
                        "group relative flex items-center gap-6 rounded-full px-10 py-5 xl:px-12 xl:py-8 shrink-0",
                        "backdrop-blur-md bg-gradient-to-r from-tertiary/80 via-secondary/30 to-primary/40",
                        "border border-white/20 text-white text-2xl lg:text-xl font-bold transition-all duration-300",
                        "hover:scale-[1.03] hover:bg-white/10 active:scale-[0.98]",
                        "hover:shadow-[0_0_40px_rgba(0,242,254,0.5)]",
                        "shadow-inner shadow-white/10"
                    )}
                    onClick={handleClickCta}
                >
                    <span className="relative z-10">Join us now</span>

                    <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40 group-hover:animate-shimmer" />
                    </div>
                </button>
            </div>
        </section>
    );
}