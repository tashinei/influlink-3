"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─────────────────────────────────────────────
   STYLES (UNCHANGED — KEEP YOURS)
───────────────────────────────────────────── */
const STYLES = `/* KEEP YOUR ORIGINAL STYLES HERE */`;

/* ─────────────────────────────────────────────
   STEP DATA (UNCHANGED)
───────────────────────────────────────────── */
const STEPS = [
    {
        number: "01",
        label: "Discovery & Matching",
        headline: "Find the perfect\ncreators for your brand.",
        description:
            "Advanced filters, AI-powered audience matching, and verified engagement metrics — so you never guess who the right creator is.",
        mockup: null, // keep your MockStep1
    },
    {
        number: "02",
        label: "Campaign Management",
        headline: "Manage campaigns,\nall in one place.",
        description:
            "Briefs, approvals, messaging, and content scheduling live side-by-side.",
        mockup: null, // keep your MockStep2
    },
    {
        number: "03",
        label: "Secure Payments",
        headline: "Send & receive\npayments — transparently.",
        description:
            "Milestone-based escrow, automatic invoicing, and multi-currency support.",
        mockup: null, // keep your MockStep3
    },
    {
        number: "04",
        label: "Analytics & Growth",
        headline: "Track performance\nand optimise ROI.",
        description:
            "Real-time dashboards, attribution modelling, and exportable reports.",
        mockup: null, // keep your MockStep4
    },
];

/* ─────────────────────────────────────────────
   STEP CONTROLLER
───────────────────────────────────────────── */
function useStepController(stepCount: number) {
    const [activeStep, setActiveStep] = useState(0);

    const getStepFromProgress = (progress: number) =>
        Math.min(stepCount - 1, Math.max(0, Math.floor(progress * stepCount)));

    return { activeStep, setActiveStep, getStepFromProgress };
}

/* ─────────────────────────────────────────────
   GSAP ANIMATION ENGINE
───────────────────────────────────────────── */
function useStepAnimation(
    containerRef: React.RefObject<HTMLDivElement>,
    setActiveStep: (n: number) => void,
    stepCount: number
) {
    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=9000",
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,

                    onUpdate: (self) => {
                        const index = Math.min(
                            stepCount - 1,
                            Math.floor(self.progress * stepCount)
                        );
                        setActiveStep(index);
                    },
                },
            });

            /* ─────────────
               INTRO
            ───────────── */
            tl.fromTo(
                ".hiw-main-card",
                { y: window.innerHeight + 120 },
                { y: 0, duration: 1.5, ease: "power3.out" }
            );

            tl.to(".hiw-main-card", {
                width: "100%",
                height: "100%",
                borderRadius: 0,
                duration: 1.2,
                ease: "power2.inOut",
            });

            /* ─────────────
               STEPS (clean + predictable)
            ───────────── */
            for (let i = 0; i < stepCount; i++) {
                const start = i * 1.8;

                tl.addLabel(`step-${i}`, start);

                tl.to(
                    `.hiw-step-${i}`,
                    {
                        autoAlpha: 1,
                        duration: 0.2,
                    },
                    `step-${i}`
                )
                    .fromTo(
                        `.hiw-step-text-${i}`,
                        { autoAlpha: 0, x: -24 },
                        {
                            autoAlpha: 1,
                            x: 0,
                            duration: 1.2,
                            ease: "expo.out",
                        },
                        `step-${i}`
                    )
                    .fromTo(
                        `.hiw-step-mock-${i}`,
                        { autoAlpha: 0, x: 24, scale: 0.96 },
                        {
                            autoAlpha: 1,
                            x: 0,
                            scale: 1,
                            duration: 1.2,
                            ease: "expo.out",
                        },
                        `step-${i}+=0.1`
                    );
            }

            /* ─────────────
               CTA
            ───────────── */
            tl.to(".hiw-cta-panel", {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
            });

            tl.to(".hiw-main-card", {
                y: -window.innerHeight - 200,
                duration: 1.5,
                ease: "power3.in",
            });
        }, containerRef);

        return () => ctx.revert();
    }, [containerRef, setActiveStep, stepCount]);
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export function InfluLinkHowItWorksSection({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { activeStep, setActiveStep } = useStepController(STEPS.length);

    useStepAnimation(containerRef, setActiveStep, STEPS.length);

    return (
        <div
            ref={containerRef}
            className={cn(
                "hiw-root relative w-screen h-screen overflow-hidden bg-[#f4f8fd]",
                className
            )}
        >
            <style dangerouslySetInnerHTML={{ __html: STYLES }} />

            {/* background */}
            <div className="hiw-dots absolute inset-0 pointer-events-none" />

            {/* MAIN CARD */}
            <div className="hiw-main-card hiw-card relative w-[82vw] h-[82vh] rounded-3xl overflow-hidden">

                {/* STEPS */}
                {STEPS.map((step, i) => (
                    <div
                        key={step.number}
                        className={`hiw-step-${i} absolute inset-0`}
                        style={{
                            opacity: activeStep === i ? 1 : 0,
                            pointerEvents: activeStep === i ? "auto" : "none",
                        }}
                    >
                        <div className="grid grid-cols-2 h-full">

                            {/* TEXT */}
                            <div className={`hiw-step-text-${i} flex flex-col justify-center p-12`}>
                                <p className="text-xs text-slate-400 mb-2">
                                    {step.number} — {step.label}
                                </p>

                                <h2 className="text-3xl font-semibold whitespace-pre-line">
                                    {step.headline}
                                </h2>

                                <p className="mt-4 text-sm text-slate-500 max-w-md">
                                    {step.description}
                                </p>
                            </div>

                            {/* MOCK */}
                            <div className={`hiw-step-mock-${i} flex items-center justify-center`}>
                                {/* Replace with your real mockups */}
                                <div className="text-slate-400 text-sm">
                                    Mockup {i + 1}
                                </div>
                            </div>

                        </div>
                    </div>
                ))}

                {/* CTA */}
                <div className="hiw-cta-panel absolute inset-0 flex items-center justify-center opacity-0 translate-y-10">
                    <button className="hiw-cta-btn-primary">
                        Get started
                    </button>
                </div>

            </div>
        </div>
    );
}