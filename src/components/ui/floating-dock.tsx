import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// --- Dock Component ---
interface DockProps {
  className?: string;
  items: {
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
    href?: string;
    isActive?: boolean;
  }[];
}

export const Dock = ({ items, className }: DockProps) => {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-4 px-4 py-2 rounded-2xl overflow-hidden",
          "backdrop-blur-xl bg-background/50",
          "shadow-[0_10px_30px_rgba(0,0,0,0.3)]",
          "transition-all duration-500 ease-out",
          "relative",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 z-0",
            "bg-gradient-to-r from-primary/80 via-primary/50 to-primary border-2 border-primary/30 rounded-br-md shadow-black/30",
            "bg-size-200% transition-all duration-[4s] ease-in-out",
            "hover:bg-pos-100% hover:shadow-inner"
          )}
          style={{
            backgroundSize: '200% 200%',
          }}
        />
        
        <div className="relative z-10 flex items-center gap-4">
          {items.map((item) => (
            <DockItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- DockItem Component ---
interface DockItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  isActive?: boolean;
}

const DockItem = ({ icon: Icon, label, onClick, href, isActive }: DockItemProps) => {
  const Wrapper = href ? "a" : "button";

  return (
    <Wrapper
      onClick={onClick}
      href={href}
      className={cn(
        "group relative flex items-center gap-0 p-0",
        "transition-all duration-300 ease-out",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center h-10 px-3 rounded-xl cursor-pointer",
          "transition-all duration-300 ease-out",

          // Base Styling
          "bg-transparent text-foreground/80",
          "text-[white]",

          "group-hover:-translate-y-1 group-hover:bg-accent/40 group-hover:shadow-lg",
          "hover:text-foreground",

          // --- Active/Selected state: Strong highlight ---
          isActive && [
            "bg-gradient-to-br from-primary/70 to-secondary/90 border-2 border-white/70 text-primary",
            "shadow-[0_0_12px_rgba(255,255,255,0.8)]", // Increased glow intensity
            "-translate-y-1" // Lock position at lifted state
          ]
        )}
      >
        {/* Icon - Now with Hover Pulse */}
        <Icon
          className={cn(
            "w-5 h-5 md:w-6 md:h-6 mr-2 transition-transform duration-200",
            // 🚀 Icon Pulse Animation: Subtle shake or pulse on hover
            "group-hover:rotate-1 group-hover:scale-105",
            // Note: If you have a custom 'animate-pulse' or 'animate-bounce' defined, 
            // you could use it here for a cooler effect.
            isActive ? "text-[white]" : "text-[white]" // Use primary text color when active
          )}
        />

        {/* Label (Text) */}
        <span
          className={cn(
            "text-sm md:text-[15px] font-medium",
            "transition-colors duration-300",
            "text-[white]",
            isActive && "font-semibold text-[white]"
          )}
        >
          {label}
        </span>
      </div>
    </Wrapper>
  );
};