import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onSelectionChange: (newSelection: string[]) => void;
  maxSelection?: number;
}

const MultiSelectListBox = React.memo(function MultiSelectListBox({
  label,
  options,
  selected,
  onSelectionChange,
  maxSelection = 2,
}: MultiSelectProps) {

  const toggleSelection = useCallback(
    (option: string) => {
      const isSelected = selected.includes(option);

      if (isSelected) {
        onSelectionChange(selected.filter((t) => t !== option));
      } else {
        if (selected.length < maxSelection) {
          onSelectionChange([...selected, option]);
        }
      }
    },
    [selected, onSelectionChange, maxSelection]
  );

  const isLimitReached = selected.length >= maxSelection;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 max-h-60 overflow-y-auto">
        {options.map((option, index) => {
          const isSelected = selected.includes(option);
          
          const isDisabled = !isSelected && isLimitReached;

          return (
            <div
              key={option}
              onMouseDown={(e) => {
                e.preventDefault();
                if (!isDisabled) {
                  toggleSelection(option);
                }
              }}
              className={`
                flex justify-between items-center p-3 text-base select-none
                transition duration-150 ease-in-out
                ${index < options.length - 1 ? "border-b border-gray-200" : ""}
                
                ${/* 3. Dynamic Styling based on state */ ""}
                ${
                  isSelected
                    ? "bg-gradient-to-r from-primary to-secondary text-white font-medium cursor-pointer"
                    : isDisabled 
                      ? "text-gray-400 bg-gray-100 cursor-not-allowed opacity-70" // Disabled look
                      : "text-gray-800 hover:bg-gray-100 cursor-pointer" // Normal look
                }
              `}
            >
              {option}
              {isSelected && <Check className="w-6 h-6 font-bold text-white" />}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-2 text-right">
        Избрани: {selected.length} от {maxSelection}
      </p>
    </div>
  );
});

export default MultiSelectListBox;