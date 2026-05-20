"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { CreditCard, Lock } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .bg-grid-theme {
      background-size: 60px 60px;
      background-image: 
          linear-gradient(to right, color-mix(in srgb, var(--color-foreground) 5%, transparent) 1px, transparent 1px),
          linear-gradient(to bottom, color-mix(in srgb, var(--color-foreground) 5%, transparent) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .text-silver-matte {
      background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter: drop-shadow(0px 10px 20px rgba(0,0,0,0.3));
  }

  .iphone-bezel {
      background-color: #111;
      box-shadow: 
          inset 0 0 0 2px #52525B, 
          inset 0 0 0 7px #000, 
          0 40px 80px -15px rgba(0,0,0,0.9);
      transform-style: preserve-3d;
  }

  .hardware-btn {
      background: linear-gradient(90deg, #404040 0%, #171717 100%);
      box-shadow: -2px 0 5px rgba(0,0,0,0.8);
  }
  
  .screen-glare {
      background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .widget-depth {
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      border: 1px solid rgba(255,255,255,0.03);
  }

  .floating-ui-badge {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%);
      backdrop-filter: blur(24px); 
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  }

  .btn-modern-light {
      background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
      color: #0F172A;
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-modern-light:hover { transform: translateY(-3px); }

  .btn-modern-dark {
      background: linear-gradient(180deg, #27272A 0%, #18181B 100%);
      color: #FFFFFF;
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-modern-dark:hover { transform: translateY(-3px); }
`;

export interface InfluLinkMatchSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    onCreatorCta?: () => void;
    onBrandCta?: () => void;
}

export function InfluLinkMatchSection({
    onCreatorCta,
    onBrandCta,
    className,
    ...props
}: InfluLinkMatchSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const internalStageRef = useRef<HTMLDivElement>(null);
    const mockupRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);
    const [activeStep, setActiveStep] = useState(0);

    // 1. Inertial Mouse Tracking Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current || !mockupRef.current) return;
            cancelAnimationFrame(requestRef.current);

            requestRef.current = requestAnimationFrame(() => {
                const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
                const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

                gsap.to(mockupRef.current, {
                    rotationY: xVal * 12,
                    rotationX: -yVal * 12,
                    ease: "power3.out",
                    duration: 1.2,
                });
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // 2. Cinematic Single-Point Pinned Scrolling Sequence
    useEffect(() => {
        const ctx = gsap.context(() => {
            const blocks = gsap.utils.toArray(".feature-sequence-block");

            // Initially hide all blocks except first
            gsap.set(blocks, { opacity: 0, y: 30, filter: "blur(10px)", pointerEvents: "none" });
            gsap.set(blocks[0], { opacity: 1, y: 0, filter: "blur(0px)", pointerEvents: "auto" });

            // Creating the Master Timeline that triggers sequential card updates inside a fixed space
            const masterTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: `+=${blocks.length * 1000}`, // Balanced virtual scrolling performance depth
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                }
            });

            blocks.forEach((block: any, index: number) => {
                if (index === 0) {
                    masterTimeline.to({}, { duration: 1, onStart: () => setActiveStep(0), onReverseComplete: () => setActiveStep(0) });
                    return;
                }

                masterTimeline.to(blocks[index - 1], {
                    opacity: 0,
                    y: -30,
                    filter: "blur(10px)",
                    pointerEvents: "none",
                    duration: 0.8,
                    ease: "power2.inOut"
                });

                masterTimeline.to(blocks[index], {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    pointerEvents: "auto",
                    duration: 0.8,
                    ease: "power2.out",
                    onStart: () => setActiveStep(index),
                    onReverseComplete: () => setActiveStep(index - 1)
                }, "-=0.2");

                masterTimeline.to({}, { duration: 1 });
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full h-screen bg-[white] text-white select-none overflow-hidden flex items-center justify-center",
                className
            )}
            style={{ perspective: "1500px" }}
            {...props}
        >
            <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
            <div className="film-grain" aria-hidden="true" />
            <div className="bg-grid-theme absolute inset-0 z-0 pointer-events-none opacity-40" aria-hidden="true" />

            {/* FIXED POSITIONED CONTENT ASSEMBLY MATRIX */}
            <div ref={internalStageRef} className="w-full max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12 items-center justify-center relative z-10 px-4 sm:px-8 md:px-12 lg:px-24 h-full">

                {/* CENTER AREA: INTERACTIVE PHONE FRAME */}
                <div className="w-full lg:col-span-5 flex flex-col items-center justify-center relative order-1 lg:order-2 h-[45vh] lg:h-full min-h-[300px] lg:min-h-0 pt-[8rem] lg:pt-[1rem]">

                    {/* Background Massive Ambient String */}
                    <div className="absolute text-[14vw] lg:text-[7.5rem] font-black tracking-tighter text-black/[0.1] select-none pointer-events-none uppercase mix-blend-plus-lighter transition-all duration-700 ease-in-out z-0 whitespace-nowrap">
                        {activeStep === 0 && "DISCOVER"}
                        {activeStep === 1 && "MANAGE"}
                        {activeStep === 2 && "SECURE"}
                        {activeStep === 3 && "ANALYZE"}
                        {activeStep === 4 && "GROWTH"}
                    </div>

                    {/* Scale optimized container to fit smaller height mobile screens safely */}
                    <div className="relative scale-[0.7] sm:scale-[0.8] md:scale-[0.85] lg:scale-100 transition-transform duration-300 w-[280px] h-[540px] flex items-center justify-center z-10">
                        <div
                            ref={mockupRef}
                            className="relative w-[280px] h-[540px] rounded-[3rem] iphone-bezel flex flex-col will-change-transform transform-style-3d pointer-events-auto"
                        >
                            {/* Device Physical Buttons */}
                            <div className="absolute top-[110px] -left-[3px] w-[3px] h-[22px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                            <div className="absolute top-[150px] -left-[3px] w-[3px] h-[40px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                            <div className="absolute top-[200px] -left-[3px] w-[3px] h-[40px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                            <div className="absolute top-[160px] -right-[3px] w-[3px] h-[65px] hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />

                            {/* Inner Screen Canvas */}
                            <div className="absolute inset-[7px] bg-gradient-to-br from-secondary/20 to-primary/40 rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10">
                                <div className="absolute inset-0 screen-glare z-40 pointer-events-none" aria-hidden="true" />

                                {/* Dynamic Notch Integration */}
                                <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[26px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                                </div>

                                <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col justify-between">

                                    {/* Top Bar Context Info */}
                                    <div className="flex justify-between items-center opacity-80">
                                        <div className="flex flex-col">
                                            <span className="text-[7px] text-white uppercase tracking-widest font-bold">InfluLink</span>
                                            <span className="text-[11px] font-bold tracking-tight text-white mt-0.5 transition-all duration-300">
                                                {activeStep === 0 && "AI Match Engine"}
                                                {activeStep === 1 && "Campaign Control"}
                                                {activeStep === 2 && "Escrow System"}
                                                {activeStep === 3 && "Analytics"}
                                                {activeStep === 4 && "Step by step onboarding"}
                                            </span>
                                        </div>
                                        <img
                                            src="/favicon.png"
                                            alt="Logo"
                                            className="w-8 h-8 rounded-[30%] border border-white/10 shadow-md object-cover"
                                        />
                                    </div>

                                    {/* Dynamic Internal Graphics Layer */}
                                    <div className="relative my-auto flex flex-col items-center justify-center py-2 min-h-[220px]">

                                        {activeStep === 0 && (
                                            <div className="space-y-4 w-full px-1 duration-500 animate-in fade-in zoom-in-95">

                                                {/* Mini filter sidebar */}
                                                <div className="rounded-xl border border-secondary bg-white overflow-hidden text-[9px]">

                                                    {/* Sidebar header */}
                                                    <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-white/10 bg-white/[0.02]">
                                                        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                            <line x1="1" y1="3" x2="11" y2="3" strokeLinecap="round" />
                                                            <line x1="3" y1="6" x2="9" y2="6" strokeLinecap="round" />
                                                            <line x1="5" y1="9" x2="7" y2="9" strokeLinecap="round" />
                                                        </svg>
                                                        <span className="text-secondary uppercase tracking-widest font-bold">Filters</span>
                                                        <span className="ml-auto text-blue-400 font-bold">3 active</span>
                                                    </div>

                                                    <div className="divide-y divide-secondary">

                                                        {/* Niche */}
                                                        <div className="px-2.5 py-2 space-y-1.5">
                                                            <p className="text-secondary uppercase tracking-widest font-bold">Niche</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {["Fashion", "Beauty", "Lifestyle"].map(tag => (
                                                                    <span key={tag} className="px-1.5 py-0.5 rounded-full bg-white text-secondary border border-secondary font-bold">{tag}</span>
                                                                ))}
                                                                <span className="px-1.5 py-0.5 rounded-full bg-secondary text-white border border-white/10 font-bold">Travel</span>
                                                                <span className="px-1.5 py-0.5 rounded-full bg-secondary text-white border border-white/10 font-bold">Food</span>
                                                            </div>
                                                        </div>

                                                        {/* Followers */}
                                                        <div className="px-2.5 py-2 space-y-1.5">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-secondary uppercase tracking-widest font-bold">Followers</p>
                                                                <span className="text-secondary font-bold">50K – 500K</span>
                                                            </div>
                                                            <div className="relative h-1 rounded-full bg-[gray]">
                                                                <div className="absolute left-[15%] right-[30%] h-full rounded-full bg-secondary" />
                                                                <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-blue-400 shadow" />
                                                                <div className="absolute right-[30%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-blue-400 shadow" />
                                                            </div>
                                                        </div>

                                                        {/* Engagement */}
                                                        <div className="px-2.5 py-2 space-y-1.5">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-secondary uppercase tracking-widest font-bold">Eng. Rate</p>
                                                                <span className="text-blue-300 font-bold">≥ 3.5%</span>
                                                            </div>
                                                            <div className="flex gap-0.5">
                                                                {[40, 65, 80, 100, 85, 60, 45].map((h, i) => (
                                                                    <div key={i} className="flex-1 rounded-sm" style={{ height: 16, background: `rgba(59,130,246,${h / 100 * 0.7 + 0.1})` }} />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Platform */}
                                                        <div className="px-2.5 py-2 space-y-1.5">
                                                            <p className="text-secondary uppercase tracking-widest font-bold">Platform</p>
                                                            <div className="flex gap-1">
                                                                {[
                                                                    { label: "IG", active: true },
                                                                    { label: "TT", active: true },
                                                                    { label: "YT", active: false },
                                                                    { label: "PIN", active: false },
                                                                ].map(({ label, active }) => (
                                                                    <span key={label} className={`px-1.5 py-0.5 rounded font-bold border ${active ? "bg-secondary text-white border-blue-400/30" : "bg-white text-secondary border-secondary"}`}>
                                                                        {label}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>

                                                <div className="widget-depth rounded-xl p-2 text-center uppercase text-[10px] text-white font-bold !bg-gradient-to-br from-secondary to-primary">
                                                    Advanced filter search system
                                                </div>
                                            </div>
                                        )}

                                        {activeStep === 1 && (
                                            <div className="w-full space-y-3 px-1 text-left duration-500 animate-in fade-in slide-in-from-bottom-4">
                                                <span className="text-[8px] font-bold text-white uppercase tracking-widest px-0.5">Live Campaign Status</span>

                                                {/* Campaign card */}
                                                <div className="widget-depth rounded-xl overflow-hidden !bg-gradient-to-br from-secondary to-primary">

                                                    {/* Header row */}
                                                    <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-white/10">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="relative flex h-1.5 w-1.5">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                                            </span>
                                                            <span className="text-[8px] font-bold text-white uppercase tracking-widest">Live</span>
                                                        </div>
                                                        <span className="text-[8px] text-emerald-400 font-bold">Approved</span>
                                                    </div>

                                                    <div className="px-3 py-2 space-y-2.5">

                                                        {/* Asset name + type */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded bg-white flex items-center justify-center flex-shrink-0">
                                                                <svg viewBox="0 0 12 12" className="w-3 h-3 text-secondary" fill="currentColor">
                                                                    <path d="M2 2.5A.5.5 0 012.5 2h4.793L10 4.707V9.5a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5v-7z" opacity=".4" />
                                                                    <path d="M5 6.5l2.5-1.5L5 3.5v3z" />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[9px] text-white font-semibold truncate">Asset_Package_v2.mp4</p>
                                                                <p className="text-[8px] text-white/40">Video · 128 MB</p>
                                                            </div>
                                                        </div>

                                                        {/* Stats row */}
                                                        <div className="grid grid-cols-3 gap-1 text-center">
                                                            {[
                                                                { label: "Reach", value: "24.6K" },
                                                                { label: "Clicks", value: "1.8K" },
                                                                { label: "CTR", value: "7.3%" },
                                                            ].map(({ label, value }) => (
                                                                <div key={label} className="rounded-lg bg-white/[0.07] py-1.5">
                                                                    <p className="text-[10px] font-black text-white">{value}</p>
                                                                    <p className="text-[7px] text-white uppercase tracking-widest">{label}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Progress */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[8px]">
                                                                <span className="text-white/50 font-medium">Campaign progress</span>
                                                                <span className="text-white font-bold">Day 18 / 30</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                <div className="h-full bg-white rounded-full" style={{ width: "60%" }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeStep === 2 && (
                                            <div className="w-full space-y-3 px-1 text-center duration-500 animate-in fade-in zoom-in-95">
                                                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary text-white rounded-full flex items-center justify-center mx-auto text-base shadow-inner">
                                                    <Lock />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] tracking-widest text-white uppercase font-bold">Escrow Account Secure</p>
                                                    <p className="text-xl font-black text-white mt-0.5 tracking-tight">$4,250.00</p>
                                                </div>
                                                <div className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-gradient-to-br from-secondary to-primary text-white text-[8px] font-bold uppercase tracking-wider mx-auto">
                                                    Tranche Active
                                                </div>
                                            </div>
                                        )}

                                        {activeStep === 3 && (
                                            <div className="w-full space-y-4 px-1 text-left duration-500 animate-in fade-in slide-in-from-bottom-4">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[8px] tracking-widest text-white uppercase font-bold">Followers gained</p>
                                                        <p className="text-2xl font-black text-white mt-0.5 tracking-tighter">4.8K</p>
                                                    </div>
                                                    <span className="text-[12px] font-bold text-white bg-gradient-to-br to-secondary from-primary px-1 py-0.5 rounded mb-0.5">▲ +24%</span>
                                                </div>
                                                <div className="w-full h-14 flex items-end gap-1 px-1.5 bg-white border border-white/[0.03] rounded-xl py-2 shadow-inner">
                                                    <div className="w-full h-[30%] bg-gradient-to-br from-secondary to-primary rounded-sm" />
                                                    <div className="w-full h-[55%] bg-gradient-to-br to-secondary from-primary  rounded-sm" />
                                                    <div className="w-full h-[45%] bg-gradient-to-br from-secondary to-primary rounded-sm" />
                                                    <div className="w-full h-[75%] bg-gradient-to-br to-secondary from-primary rounded-sm" />
                                                    <div className="w-full h-[100%] bg-gradient-to-br from-secondary to-primary rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                </div>
                                            </div>
                                        )}

                                        {activeStep === 4 && (
                                            <div className="w-full text-center space-y-2.5 px-1 duration-500 animate-in fade-in scale-in">

                                                {/* Hero label */}
                                                <div className="rounded-xl bg-gradient-to-r from-primary to-secondary px-3 py-3">
                                                    <p className="text-xs font-black text-white uppercase tracking-widest">Founding Member</p>
                                                    <p className="text-[10px] text-white mt-1">Be among the first on the platform</p>
                                                </div>

                                                {/* Benefits list */}
                                                <div className="rounded-xl overflow-hidden border border-white/10 text-left divide-y divide-white/[0.06]">
                                                    {[
                                                        { icon: "★", label: "Priority placement", sub: "Top visibility from day one", accent: "primary" },
                                                        { icon: "◈", label: "Founding rate locked", sub: "Never pay full price", accent: "secondary" },
                                                        { icon: "◎", label: "Early campaign access", sub: "First pick on brand deals", accent: "primary" },
                                                        { icon: "⬡", label: "Shape the product", sub: "Direct feedback to our team", accent: "secondary" },
                                                    ].map(({ icon, label, sub, accent }, i) => (
                                                        <div
                                                            key={label}
                                                            className="flex items-center gap-3 px-3 py-2.5"
                                                            style={{
                                                                background: i % 2 === 0
                                                                    ? "rgba(255,255,255,0.03)"
                                                                    : "rgba(255,255,255,0.015)"
                                                            }}
                                                        >
                                                            <div
                                                                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                                                style={{
                                                                    background: `color-mix(in srgb, var(--color-${accent}) 20%, transparent)`,
                                                                    border: `1px solid color-mix(in srgb, var(--color-${accent}) 30%, transparent)`
                                                                }}
                                                            >
                                                                <span className="text-sm" style={{ color: `var(--color-${accent})` }}>{icon}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] text-white font-bold leading-tight">{label}</p>
                                                                <p className="text-[9px] text-white/35 leading-tight mt-0.5">{sub}</p>
                                                            </div>
                                                            <div
                                                                className="w-1 h-5 rounded-full flex-shrink-0"
                                                                style={{ background: `linear-gradient(to bottom, var(--color-${accent}), transparent)` }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Micro Footer Bar */}
                                    <div className="w-full h-7 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-center px-3 justify-between widget-depth">
                                        <div className="w-12 h-1 bg-neutral-600 rounded-full" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* External High-Performance Floating Badges (Hidden on micro mobile, visible from sm up) */}
                        <div className="hidden sm:flex absolute top-11 left-[20px] lg:left-[-30px] floating-ui-badge rounded-2xl p-3 items-center gap-3 z-30 scale-90 lg:scale-100 shadow-2xl">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-secondary to-primary flex items-center justify-center border border-blue-400/30 shadow-inner">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="8" r="3.5" />
                                    <path d="M4.5 20c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white text-xs font-bold tracking-tight">Verified Profiles</p>
                                <p className="text-blue-200/50 text-[10px] font-medium">100% Audited</p>
                            </div>
                        </div>

                        <div className="hidden sm:flex absolute bottom-6 right-[-50px] lg:right-[-60px] floating-ui-badge rounded-2xl p-3 items-center gap-3 z-30 scale-90 lg:scale-100 shadow-2xl">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-inner">
                                <CreditCard className="!h-5 !w-5"></CreditCard>
                            </div>
                            <div>
                                <p className="text-white text-xs font-bold tracking-tight">Secure Payments</p>
                                <p className="text-white/70 text-[10px] font-medium">Clear Tracking</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* SIDE AREA: ABSOLUTE LAYER STACK FOR "SCROLLING IN PLACE" */}
                <div className="w-full lg:col-span-7 relative flex items-center justify-center lg:justify-start h-[45vh] lg:h-full order-2 lg:order-1 px-2 sm:px-6 lg:px-0">
                    <div className="relative w-full h-full flex items-center justify-center lg:justify-start">

                        {/* BLOCK 1 */}
                        <div className="feature-sequence-block absolute inset-x-0 flex flex-col justify-center text-left lg:text-left max-w-xl mx-auto lg:mx-0">
                            <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-primary">Easy discovery & Matching</span>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mt-2 lg:mt-3 mb-4 lg:mb-6 text-black leading-tight">
                                Find the perfect creators for your brand
                            </h2>
                            <div className="space-y-2 sm:space-y-4 border-t-2 lg:border-t-0 lg:border-l-2 border-black/30 pt-3 lg:pt-0 lg:pl-6">
                                <p className="text-sm sm:text-md text-black"><strong className="text-black">Advanced search filters:</strong> Narrow metrics instantly to filter high-conversion profiles.</p>
                                <p className="text-sm sm:text-md text-black"><strong className="text-black">AI Demographic Mapping:</strong> Match real talent profiles to complex audience datasets.</p>
                            </div>
                        </div>

                        {/* BLOCK 2 */}
                        <div className="feature-sequence-block absolute inset-x-0 flex flex-col justify-center text-left lg:text-left max-w-xl mx-auto lg:mx-0">
                            <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-primary">Global reach. Local impact.</span>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mt-2 lg:mt-3 mb-4 lg:mb-6 text-black leading-tight">
                                Manage campaigns all in one place
                            </h2>
                            <div className="space-y-2 sm:space-y-4 border-t-2 lg:border-t-0 lg:border-l-2 border-black/30 pt-3 lg:pt-0 lg:pl-6">
                                <p className="text-sm sm:text-md text-black"><strong className="text-black">Built-in Collaboration:</strong> Connect with asset feedback loops instantly inside secure chat pools.</p>
                                <p className="text-sm sm:text-md text-black"><strong className="text-black">Workflow Automation:</strong> Keep control over creative pipelines from onboarding up to final publishing metrics.</p>
                            </div>
                        </div>

                        {/* BLOCK 3 */}
                        <div className="feature-sequence-block absolute inset-x-0 flex flex-col justify-center text-left lg:text-left max-w-xl mx-auto lg:mx-0">
                            <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-secondary">Transparent Protocols</span>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mt-2 lg:mt-3 mb-4 lg:mb-6 text-black leading-tight">
                                Send & Receive payments
                            </h2>
                            <div className="space-y-2 sm:space-y-4 border-t-2 lg:border-t-0 lg:border-l-2 border-black/30 pt-3 lg:pt-0 lg:pl-6">
                                <p className="text-sm sm:text-md text-black"><strong className="text-black">Escrow Safeguards:</strong> Funds remain completely locked until designated performance thresholds show completion.</p>
                                <p className="text-sm sm:text-md text-black"><strong className="text-black">Automated Tax Tracking:</strong> Exportable accounting statements fully prepared for multi-border compliance.</p>
                            </div>
                        </div>

                        {/* BLOCK 4 */}
                        <div className="feature-sequence-block absolute inset-x-0 flex flex-col justify-center text-left lg:text-left max-w-xl mx-auto lg:mx-0">
                            <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-primary">Telemetry & Mapping</span>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mt-2 lg:mt-3 mb-4 lg:mb-6 text-black leading-tight">
                                Track performance and optimize ROI
                            </h2>
                            <div className="space-y-2 sm:space-y-4 border-t-2 lg:border-t-0 lg:border-l-2 border-black/30 pt-3 lg:pt-0 lg:pl-6">
                                <p className="text-sm sm:text-md text-black"><strong className="text-black">Real-Time Data Loops:</strong> View conversion spikes directly on comprehensive layout maps instantly.</p>
                                <p className="text-sm sm:text-md text-black"><strong className="text-black">Attribution Models:</strong> Check clear breakdown arrays detailing precise traffic generation tracks.</p>
                            </div>
                        </div>

                        {/* BLOCK 5 (CTA) */}
                        <div className="feature-sequence-block absolute inset-x-0 flex flex-col justify-center text-left lg:text-left max-w-xl mx-auto lg:mx-0">
                            <h2 className="mt-[100px] lg:mt-[0] text-3xl sm:text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text leading-tight lg:leading-none">
                                Ready to build partnerships that grow?
                            </h2>

                            <p className="text-md sm:text-sm md:text-md text-black mt-2 lg:mt-4 mb-4 lg:mb-8 leading-relaxed">
                                Find the right creators, launch high-performing campaigns, and turn every collaboration into measurable growth.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto lg:mx-0">

                                <button
                                    onClick={onCreatorCta}
                                    className="
            w-full sm:w-auto
            px-6 py-4 sm:py-3.5
            rounded-2xl sm:rounded-full
            bg-gradient-to-r from-primary to-secondary
            text-white
            font-semibold
            text-sm
            tracking-wide
            transition duration-300 ease-in-out
            hover:scale-[1.03] active:scale-[0.98]
            shadow-md hover:shadow-lg
            flex items-center justify-center gap-2
            min-h-[48px]
        "
                                >
                                    Join as Creator
                                </button>

                                <button
                                    onClick={onBrandCta}
                                    className="
            w-full sm:w-auto
            px-6 py-4 sm:py-3.5
            rounded-2xl sm:rounded-full
            bg-gradient-to-r from-secondary to-primary
            text-white
            font-semibold
            text-sm
            tracking-wide
            transition duration-300 ease-in-out
            hover:scale-[1.03] active:scale-[0.98]
            shadow-md hover:shadow-lg
            flex items-center justify-center gap-2
            min-h-[48px]
        "
                                >
                                    Join as Brand
                                </button>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}