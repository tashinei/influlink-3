import { cn } from "@/lib/utils"
import { BenefitCard } from "./benefit-card"
import { LucideIcon } from "lucide-react"

export interface Benefit {
  icon: LucideIcon
  title: string
  description: string
  iconColor?: string
  borderColor?: string
}

interface BenefitsSectionProps {
  benefits: Benefit[]
  className?: string
}

export function BenefitsSection({ 
  benefits,
  className 
}: BenefitsSectionProps) {
  return (
    <div style={{justifySelf:"center"}} className={cn("relative flex w-[90vw] flex-col items-center justify-center overflow-hidden", className)}>
      <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
        <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
          {[...Array(4)].map((_, setIndex) => (
            benefits.map((benefit, i) => (
              <BenefitCard 
                key={`${setIndex}-${i}`}
                {...benefit}
              />
            ))
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
    </div>
  )
}
