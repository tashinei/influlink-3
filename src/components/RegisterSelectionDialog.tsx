import React from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { User, Briefcase, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegisterSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AccountOption {
  type: "creator" | "brand";
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  features: string[];
}

const accountOptions: AccountOption[] = [
  {
    type: "creator",
    title: "Creator",
    description: "Monetize your content and grow your personal brand",
    icon: User,
    href: "/register/creator",
    features: ["Find campaigns", "Set your rates", "Get paid directly"],
  },
  {
    type: "brand",
    title: "Brand / Agency",
    description: "Discover influencers and launch powerful campaigns",
    icon: Briefcase,
    href: "/register/brand",
    features: ["Post campaigns", "Find creators", "Track performance"],
  },
];

export default function RegisterSelectionDialog({
  open,
  onOpenChange,
}: RegisterSelectionDialogProps) {
  const handleOptionClick = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl overflow-hidden border-0 bg-gradient-to-br from-primary via-primary to-secondary p-8 shadow-2xl sm:rounded-3xl">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-foreground/5 blur-3xl" />
        </div>

        <div className="relative z-10 p-8 pt-0" style={{display:"flex", flexDirection:"column", justifyContent:"center"}}>
          <DialogHeader className="space-y-3 text-center">
            <DialogTitle className="text-3xl font-bold tracking-tight text-primary-foreground">
              Join InfluLink
            </DialogTitle>
            <DialogDescription className="text-base text-primary-foreground/70">
              Select your account type to get started
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {accountOptions.map((option) => (
              <AccountOptionCard
                key={option.type}
                option={option}
                onClick={handleOptionClick}
              />
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-primary-foreground/50">
            Already have an account?{" "}
            <Link
              to="/login"
              onClick={handleOptionClick}
              className="font-medium text-primary-foreground/80 underline-offset-4 transition-colors hover:text-primary-foreground hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AccountOptionCardProps {
  option: AccountOption;
  onClick: () => void;
}

function AccountOptionCard({ option, onClick }: AccountOptionCardProps) {
  const Icon = option.icon;

  return (
    <Link
      to={option.href}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-2xl bg-gradient-to-b from-secondary via-primary to-transparent p-6 backdrop-blur-sm shadow-md shadow-white",
        "transition-all duration-300 ease-out",
        "hover:border-secondary/20 hover:bg-secondary/10",
        "hover:shadow-lg hover:shadow-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      )}
    >
      {/* Icon */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-foreground/20 to-primary-foreground/5 shadow-inner transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-7 w-7 text-primary-foreground" />
      </div>

      {/* Title & Description */}
      <h3 className="mb-1 text-xl font-semibold text-primary-foreground">
        {option.title}
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-primary-foreground/60">
        {option.description}
      </p>

      {/* Features list */}
      <ul className="mb-6 flex-1 space-y-2">
        {option.features.map((feature, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-sm text-primary-foreground/70"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/40" />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="flex items-center justify-between border-t border-primary-foreground/10 pt-4">
        <span className="text-sm font-medium text-primary-foreground/80 transition-colors group-hover:text-primary-foreground">
          Create account
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary-foreground/20">
          <ArrowRight className="h-4 w-4 text-white" />
        </div>
      </div>
    </Link>
  );
}
