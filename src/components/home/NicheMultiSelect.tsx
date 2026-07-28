import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  niches: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
};

const NicheMultiSelect = ({ niches, selected, onChange, placeholder }: Props) => {
  const toggle = (niche: string) => {
    if (selected.includes(niche)) {
      onChange(selected.filter((n) => n !== niche));
    } else {
      onChange([...selected, niche]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-between gap-2 rounded-xl border-2 border-border bg-background px-3 text-sm transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <span className={cn("truncate", selected.length ? "text-foreground" : "text-muted-foreground")}>
            {selected.length ? selected.join(", ") : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-0"
      >
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-border p-3">
            {selected.map((niche) => (
              <Badge
                key={niche}
                variant="default"
                className="cursor-pointer gap-1 py-1 pl-2.5 pr-1.5"
                onClick={() => toggle(niche)}
              >
                {niche}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
        <div className="max-h-60 overflow-y-auto p-1">
          {niches.map((niche) => {
            const isSel = selected.includes(niche);
            return (
              <button
                key={niche}
                type="button"
                onClick={() => toggle(niche)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                  isSel && "text-primary font-medium",
                )}
              >
                <span className="truncate">{niche}</span>
                {isSel && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NicheMultiSelect;
