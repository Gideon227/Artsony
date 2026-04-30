// @/components/ui/textarea-field.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FormLabel } from "./form-label";

export type FieldVariant = "default" | "error" | "success";

export type TextAreaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  required?: boolean;
  optional?: boolean;
  tooltipContent?: string;
  
  // Text area styling props
  variant?: FieldVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
};

// State-dependent classes to map colors
const getFieldColors = (variant: FieldVariant) => {
  switch (variant) {
    case "error":
      return {
        base: "border-red-500 bg-white hover:border-red-600",
        focus: "focus:ring-red-500",
      };
    case "success":
      return {
        base: "border-emerald-500 bg-white hover:border-emerald-600",
        focus: "focus:ring-emerald-500",
      };
    case "default":
    default:
      return {
        base: "border-neutral-200 bg-white hover:border-neutral-300",
        focus: "focus:ring-[#F15A2B]", // Orange primary accent
      };
  }
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  (
    {
      id,
      className,
      label,
      required,
      optional,
      tooltipContent,
      variant = "default",
      leftIcon,
      rightIcon,
      wrapperClassName,
      disabled,
      placeholder = "Placeholder",
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided, linking label and input
    const [uniqueId] = React.useState(id || `textarea-${React.useId()}`);
    const { base, focus } = getFieldColors(variant);

    return (
      <div className={cn("flex flex-col gap-3.5 w-full", wrapperClassName)}>
        {/* REUSABLE LABEL COMPONENT AT THE TOP */}
        {label && 
          <FormLabel
            htmlFor={uniqueId}
            text={label}
            required={required}
            optional={optional}
            tooltipContent={tooltipContent}
          />
        }

        {/* INPUT CONTAINER W/ FLEX FOR ICONS */}
        <div className="relative w-full">
          {/* Optional Left Icon */}
          {leftIcon && (
            <div className="absolute left-6 top-6 text-neutral-400">
              {leftIcon}
            </div>
          )}

          {/* THE MAIN TEXT AREA COMPONENT */}
          <textarea
            id={uniqueId}
            ref={ref}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={variant === "error"}
            aria-required={required}
            className={cn(
              "w-full h-40 py-3  flex border rounded-[32px] outline-none resize-none transition-all duration-200",
              "text-sm font-normal leading-6 font-poppins text-gray-400 placeholder:text-gray-300",
              leftIcon ? "pl-16" : "pl-6",
              rightIcon ? "pr-16" : "pr-6",
              base,
              "focus:ring-2 focus:ring-offset-2",
              "focus:ring-offset-white ring-offset-white", 
              focus,
              "disabled:bg-neutral-100 disabled:border-gray-200 disabled:text-neutral-400 disabled:placeholder:text-gray-300 disabled:pointer-events-none",
              className
            )}
            {...props}
          />

          {/* Optional Right Icon (matches pencil in image 8) */}
          {rightIcon && (
            <div className="absolute right-6 top-6 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
    )
  }
)

// Textarea.displayName = "Textarea";

export { Textarea };