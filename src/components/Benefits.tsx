import { BenefitsSection } from "./ui/benefits-section";
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
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

const creatorBenefits = [
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
    description: "Ексклузивни оферти за инфлуенсъри",
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
    description: "Стартирайте кампании за минути",
    iconColor: "text-secondary",
    borderColor: "border-secondary/20"
  },
  {
    icon: Award,
    title: "VIP статус",
    description: "Специални привилегии за първите",
    iconColor: "text-secondary",
    borderColor: "border-secondary/20"
  }
];

const brandBenefits = [
  {
    icon: Target,
    title: "Персонализация",
    description: "Съдържание и кампании пригодени за вашия бизнес",
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
    description: "Свържете се с други брандове и партньори",
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
    icon: Clock,
    title: "Спестете време",
    description: "Автоматизирайте рутинните задачи",
    iconColor: "text-primary",
    borderColor: "border-primary/20"
  }
];

export function Benefits() {
  const accountType = useUserStore((state) => state.accountType);
  let benefitsToShow = [];

  if (accountType === "creator") benefitsToShow = creatorBenefits;
  else if (accountType === "brand") benefitsToShow = brandBenefits;

  return <BenefitsSection benefits={benefitsToShow} className="mb-12" />;
}
