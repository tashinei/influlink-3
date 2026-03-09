import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DockProps {
  className?: string;
  items: {
    icon: any; // Changed to any to support the custom Bell+Badge component
    label: string;
    onClick?: () => void;
    href?: string;
    isActive?: boolean;
  }[];
}

export const Dock = ({ items, className }: DockProps) => {
  return (
    <div className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 z-50", className)}>
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-xl bg-background/50 shadow-2xl relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/80 via-primary/50 to-primary border-2 border-primary/30 opacity-90" />

        <div className="relative z-10 flex items-center gap-[1rem]">
          {items.map((item) => (
            <DockItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

const DockItem = ({ icon: Icon, label, onClick, href, isActive }: any) => {
  const Wrapper = href ? "a" : "button";

  return (
    <Wrapper
      onClick={onClick}
      href={href}
      className="group relative flex items-center transition-all duration-300 ease-out"
    >
      <div
        className={cn(
          "flex items-center h-12 px-3 rounded-xl cursor-pointer transition-all duration-300",
          "text-white hover:bg-white/20",
          isActive && "bg-white/30 border border-white/50 shadow-lg -translate-y-1"
        )}
      >
        <div className="w-6 h-6 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          {typeof Icon === "function" ? <Icon className="w-6 h-6" /> : Icon}
        </div>

        <span
          className={cn(
            "overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out",
            "max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 group-hover:ml-2",
            "lg:max-w-[200px] lg:opacity-100 lg:ml-2"
          )}
        >
          {label}
        </span>
      </div>
    </Wrapper>
  );
};