import { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
}

export function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div className="relative mx-auto w-[280px] h-[560px] sm:w-[300px] sm:h-[600px] group">
      {/* Phone frame */}
      <div className="absolute inset-0 bg-foreground rounded-[3rem] shadow-2xl transition-transform duration-500 group-hover:scale-105">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gradient-to-b from-primary to-secondary rounded-b-3xl z-10" />
        
        {/* Screen */}
        <div className="absolute inset-3 bg-background rounded-[2.5rem] overflow-hidden">
          {/* Status bar */}
          <div className="h-12 bg-muted flex items-center justify-between px-6 pt-2">
            <span className="text-xs font-medium text-muted-foreground">9:41</span>
            <div className="flex gap-1 items-center">
              <div className="w-4 h-3 border border-muted-foreground rounded-sm relative">
                <div className="absolute inset-0.5 bg-muted-foreground rounded-sm" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="h-[calc(100%-3rem)] overflow-hidden">
            {children}
          </div>
        </div>
        
        {/* Side buttons */}
        <div className="absolute -right-1 top-24 w-1 h-12 bg-foreground/80 rounded-l" />
        <div className="absolute -right-1 top-40 w-1 h-16 bg-foreground/80 rounded-l" />
        <div className="absolute -left-1 top-28 w-1 h-8 bg-foreground/80 rounded-r" />
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
    </div>
  );
}
