"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DimensionFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const DimensionInput = React.forwardRef<HTMLInputElement, DimensionFieldProps>(
  ({ label, className, ...props }, ref) => (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-slate-500 pl-1">{label}</label>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder="00"
        className={cn(
          "h-12 w-full rounded-full border border-neutral-200 bg-white text-center text-sm font-medium text-slate-500 placeholder:text-slate-400 outline-none transition-colors focus:border-primary-600 focus:ring-1 focus:ring-primary-600",
          className
        )}
        {...props}
      />
    </div>
  )
);
DimensionInput.displayName = "DimensionInput";

// Group Component
export default function DimensionsRow() {
  return (
    <div className="flex items-center gap-4 w-full max-w-md">
      <DimensionInput label="Length" />
      <DimensionInput label="Breadth" />
      <DimensionInput label="Height" />
      <DimensionInput label="Weight" />
    </div>
  );
}