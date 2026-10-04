"use client";

import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/utils"; // update to "@/lib/utils" if that is your path

interface StepperInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'min' | 'max'> {
  value?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
}

const StepperInput = React.forwardRef<HTMLInputElement, StepperInputProps>(
  ({ className, value = 0, onValueChange, min = 0, max = 999, disabled, ...props }, ref) => {
    
    const handleIncrement = () => {
      if (disabled || value >= max) return;
      onValueChange?.(value + 1);
    };
    
    const handleDecrement = () => {
      if (disabled || value <= min) return;
      onValueChange?.(value - 1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const val = e.target.value;
      if (val === "" || /^\d+$/.test(val)) {
        const num = val === "" ? min : parseInt(val, 10);
        // Clamp the typed value between min and max
        const clamped = Math.min(Math.max(num, min), max);
        onValueChange?.(clamped);
      }
    };

    return (
      <div className={cn("flex items-center gap-2 w-full", disabled && "opacity-50 pointer-events-none", className)}>
        {/* Minus Button (Left) */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="flex cursor-pointer h-8 w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white outline-none hover:border-primary-600 transition-colors group disabled:opacity-50 disabled:hover:border-neutral-200"
        >
          <div className="flex h-6 w-6 lg:h-7 lg:w-7 items-center justify-center rounded-full bg-[#535864] text-white group-hover:bg-primary-600 transition-colors group-disabled:group-hover:bg-[#535864]">
            <Minus className="h-4 w-4" strokeWidth={3} />
          </div>
        </button>

        {/* Numeric Input */}
        <input
          ref={ref}
          type="text"
          disabled={disabled}
          value={value === 0 && props.placeholder ? "" : String(value).padStart(2, '0')} 
          onChange={handleInputChange}
          className="h-10 lg:h-12 w-full flex-1 rounded-full border border-neutral-200 bg-white text-center text-sm font-semibold text-neutral-800 outline-none transition-all focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 disabled:bg-neutral-50"
          {...props}
        />

        {/* Plus Button (Right) */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="flex cursor-pointer h-8 w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white outline-none hover:border-primary-600 transition-colors group disabled:opacity-50 disabled:hover:border-neutral-200"
        >
          <div className="flex h-6 w-6 lg:h-7 lg:w-7 items-center justify-center rounded-full bg-[#535864] text-white group-hover:bg-primary-600 transition-colors group-disabled:group-hover:bg-[#535864]">
            <Plus className="h-4 w-4" strokeWidth={3} />
          </div>
        </button>
      </div>
    );
  }
);
StepperInput.displayName = "StepperInput";

export { StepperInput };