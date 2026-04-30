// @/components/ui/form-label.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils"; // Assume clsx + tailwind-merge helper

// Tooltip sub-component
function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 transition-opacity duration-200 opacity-0 group-hover:opacity-100 pointer-events-none">
        <div className="relative bg-neutral-900 text-white text-xs font-normal px-4 py-2.5 rounded-lg whitespace-nowrap shadow-xl">
          {content}
          {/* Top Arrow */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 h-0 w-0 border-x-8 border-x-transparent border-b-8 border-b-neutral-900" />
        </div>
      </div>
    </div>
  );
}

// Reusable Circle Icon (matches image)
const QuestionIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#2D9CDB] text-white text-[11px] font-semibold">
    ?
  </div>
);

export type FormLabelProps = {
  htmlFor: string;
  text: string;
  required?: boolean;
  optional?: boolean;
  tooltipContent?: string;
  className?: string;
};

const FormLabel: React.FC<FormLabelProps> = ({
  htmlFor,
  text,
  required,
  optional,
  tooltipContent,
  className,
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("inline-flex items-center ", className)}
    >
      {/* Red Required Asterisk */}
      {required && (
        <span className="text-red-500 text-base font-medium">*</span>
      )}

      {/* Bold Label Text */}
      <span className="font-poppins text-[15px] font-medium tracking-wide leading-6 text-[#1B1E22] mr-3">{text}</span>

      {/* Blue Tooltip Icon with Hover Comment */}
      {tooltipContent && (
        <Tooltip content={tooltipContent}>
          <QuestionIcon />
        </Tooltip>
      )}

      {/* Normal Secondary Text (gray, in parentheses) */}
      {optional && (
        <span className="font-poppins leading-4 tracking-wide text-xs font-normal text-gray-200 ml-3">
          ( Optional )
        </span>
      )}
    </label>
  );
};

export { FormLabel };