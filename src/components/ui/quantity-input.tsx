"use client";

import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const StepperInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, defaultValue, ...props }, ref) => {
    const [value, setValue] = React.useState<number>(Number(defaultValue) || 0);

    const handleIncrement = () => setValue((prev) => prev + 1);
    const handleDecrement = () => setValue((prev) => (prev > 0 ? prev - 1 : 0));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "" || /^\d+$/.test(val)) {
        setValue(val === "" ? 0 : parseInt(val, 10));
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
          value={value}
          onChange={handleInputChange}
          className="h-12 flex-1 rounded-full border border-neutral-200 bg-white text-center text-sm font-semibold text-neutral-800 outline-none transition-all focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
          placeholder="0"
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