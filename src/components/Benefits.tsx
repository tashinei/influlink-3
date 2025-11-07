import { BenefitsSection } from "./ui/benefits-section"
import { 
  TicketCheck, 
  Gift, 
  HeadphonesIcon, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp,
  Award,
  Clock,
  Target
} from "lucide-react"

const benefits = [
  {
    icon: TicketCheck,
    title: "Ранен достъп",
    description: "Използвайте платформата преди официалния старт",
    iconColor: "text-primary",
    borderColor: "border-primary/20"
  },
  {
    icon: Gift,
    title: "Специални условия",
    description: "Ексклузивни отстъпки за ранни потребители",
    iconColor: "text-secondary",
    borderColor: "border-secondary/20"
  },
  {
    icon: HeadphonesIcon,
    title: "Приоритетна поддръжка",
    description: "Директен достъп до нашия екип",
    iconColor: "text-primary",
    borderColor: "border-primary/20"
  },
  {
    icon: Zap,
    title: "Бързо внедряване",
    description: "Стартирайте за минути, не за месеци",
    iconColor: "text-secondary",
    borderColor: "border-secondary/20"
  },
  {
    icon: Shield,
    title: "Гарантирана сигурност",
    description: "Вашите данни са защитени с най-висок стандарт",
    iconColor: "text-primary",
    borderColor: "border-primary/20"
  },
  {
    icon: Users,
    title: "Общност",
    description: "Свържете се с други ранни потребители",
    iconColor: "text-secondary",
    borderColor: "border-secondary/20"
  },
  {
    icon: TrendingUp,
    title: "Постоянни подобрения",
    description: "Получавайте нови функции първи",
    iconColor: "text-primary",
    borderColor: "border-primary/20"
  },
  {
    icon: Award,
    title: "VIP статус",
    description: "Специални привилегии за първите",
    iconColor: "text-secondary",
    borderColor: "border-secondary/20"
  },
  {
    icon: Clock,
    title: "Спестете време",
    description: "Автоматизирайте рутинните задачи",
    iconColor: "text-primary",
    borderColor: "border-primary/20"
  },
  {
    icon: Target,
    title: "Персонализация",
    description: "Съдържание пригодено за вашия бизнес",
    iconColor: "text-secondary",
    borderColor: "border-secondary/20"
  }
]

export function Benefits() {
  return (
    <BenefitsSection benefits={benefits} className="mb-12" />
  )
}
