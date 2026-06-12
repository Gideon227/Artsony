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
        type="number"
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

// ADDED PROPS HERE
interface DimensionsRowProps {
  values: { length?: number; breadth?: number; height?: number; weight?: number };
  onChange: (key: string, value: number) => void;
}

export default function DimensionsRow({ values, onChange }: DimensionsRowProps) {
  return (
    <div className="flex items-center gap-4 w-full max-w-md">
      <DimensionInput 
        label="Length" 
        value={values?.length || ""} 
        onChange={(e) => onChange("length", Number(e.target.value))} 
      />
      <DimensionInput 
        label="Breadth" 
        value={values?.breadth || ""} 
        onChange={(e) => onChange("breadth", Number(e.target.value))} 
      />
      <DimensionInput 
        label="Height" 
        value={values?.height || ""} 
        onChange={(e) => onChange("height", Number(e.target.value))} 
      />
      <DimensionInput 
        label="Weight" 
        value={values?.weight || ""} 
        onChange={(e) => onChange("weight", Number(e.target.value))} 
      />
    </div>
  );
}