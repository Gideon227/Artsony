"use client";

import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number;
  onValueChange?: (value: number) => void;
}

const StepperInput = React.forwardRef<HTMLInputElement, StepperInputProps>(
  ({ className, value = 0, onValueChange, ...props }, ref) => {
    
    const handleIncrement = () => onValueChange?.(value + 1);
    const handleDecrement = () => onValueChange?.(value > 0 ? value - 1 : 0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "" || /^\d+$/.test(val)) {
        onValueChange?.(val === "" ? 0 : parseInt(val, 10));
      }
    };

    return (
      <div className={cn("flex items-center gap-3 w-full", className)}>
        {/* Plus Button (Left) */}
        <button
          type="button"
          onClick={handleIncrement}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white outline-none hover:border-primary-600 transition-colors group"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#535864] text-white group-hover:bg-primary-600 transition-colors">
            <Plus className="h-4 w-4" strokeWidth={3} />
          </div>
        </button>

        {/* Numeric Input */}
        <input
          ref={ref}
          type="text"
          value={value === 0 && props.placeholder ? "" : value} // Show placeholder if 0
          onChange={handleInputChange}
          className="h-12 flex-1 rounded-full border border-neutral-200 bg-white text-center text-sm font-semibold text-neutral-800 outline-none transition-all focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
          {...props}
        />

        {/* Minus Button (Right) */}
        <button
          type="button"
          onClick={handleDecrement}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white outline-none hover:border-primary-600 transition-colors group"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#535864] text-white group-hover:bg-primary-600 transition-colors">
            <Minus className="h-4 w-4" strokeWidth={3} />
          </div>
        </button>
      </div>
    );
  }
);
StepperInput.displayName = "StepperInput";

export { StepperInput };