import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export interface BenefitCardProps {
  icon: LucideIcon
  title: string
  description: string
  iconColor?: string
  borderColor?: string
  className?: string
}

export function BenefitCard({ 
  icon: Icon,
  title,
  description,
  iconColor = "text-secondary",
  borderColor = "border-primary/20",
  className
}: BenefitCardProps) {
  return (
    <Card className={cn(
      "border-2 rounded-2xl",
      "max-w-[320px] sm:max-w-[320px]",
      "transition-colors duration-300",
      borderColor,
      className
    )}>
      <CardContent className="p-6 text-center">
        <Icon className={cn("w-12 h-12 mx-auto mb-4", iconColor)} />
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
