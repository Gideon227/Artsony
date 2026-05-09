"use client";

import * as React from "react";
import { ChevronDown, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export type DropdownVariant = "default" | "error" | "success";

export interface DropdownOption {
  id: string | number;
  label: string;
  description?: string;
  icon?: string;
  rightIcon?: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: DropdownOption;
  onChange?: (option: DropdownOption) => void;
  placeholder?: string;
  variant?: DropdownVariant;
  disabled?: boolean;
  leftIcon?: string;
  className?: string;
}

const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = "Placeholder",
  variant = "default",
  disabled = false,
  leftIcon,
  className,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Sync variant colors with your existing Input logic
  const variantStyles = {
    default: "border-neutral-200 focus-within:ring-[#F15A2B]",
    error: "border-red-500 focus-within:ring-red-500",
    success: "border-emerald-500 focus-within:ring-emerald-500",
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* TRIGGER BUTTON (Matches Input styling) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center w-full h-12 px-6 rounded-full border bg-white transition-all outline-none",
          "text-sm font-medium text-neutral-800",
          "hover:border-neutral-300",
          "focus:ring-2 focus:ring-offset-2 focus:ring-offset-white",
          variantStyles[variant],
          disabled && "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-100",
          isOpen && "border-neutral-300 ring-2 ring-offset-2 ring-[#F15A2B]/20"
        )}
      >
        {/* Left Icon Slot */}
        {leftIcon && 
          <span className="mr-3 shrink-0">
            <Image width={20} height={20} src={leftIcon} alt="icon" className="w-auto h-auto"/>
          </span>}
        
        {/* Selected Value / Placeholder */}
        <span className={cn("flex-1 text-left truncate", !value && "text-neutral-400")}>
          {value ? value.label : placeholder}
        </span>

        {/* Chevron */}
        <ChevronDown 
          className={cn("ml-2 h-5 w-5 text-neutral-400 transition-transform", isOpen && "rotate-180")} 
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full z-50 bg-white border border-neutral-200 rounded-b-4xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <ul className="max-h-[320px] overflow-y-auto py-2 custom-scrollbar">
            {options.map((option) => {
              const isSelected = value?.id === option.id;
              
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      onChange?.(option);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center w-full px-5 py-3 text-left transition-colors",
                      "hover:bg-neutral-50",
                      isSelected && "bg-[#F15A2B] text-white hover:bg-[#F15A2B]",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {/* Option Icon (User Icon in screenshot) */}
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100",
                      isSelected && "bg-white/20"
                    )}>
                      {/* {option.icon || <User className={cn("h-5 w-5 text-neutral-500", isSelected && "text-white")} />} */}
                      <Image width={20} height={20} src={option.icon as string} alt="icon" className="w-auto h-auto" />
                    </div>

                    {/* Label & Description */}
                    <div className="ml-3 flex flex-col flex-1 overflow-hidden">
                      <span className="text-sm font-semibold truncate leading-tight">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className={cn(
                          "text-xs truncate mt-0.5",
                          isSelected ? "text-white/80" : "text-neutral-400"
                        )}>
                          {option.description}
                        </span>
                      )}
                    </div>

                    {/* Right Icon (Lock in screenshot) */}
                    <div className="ml-2 shrink-0">
                      {/* {option.rightIcon || <Lock className={cn("h-4 w-4 opacity-70", isSelected && "opacity-100")} />} */}
                      <Image width={20} height={20} src={option.rightIcon as string} alt="icon" className="w-auto h-auto" />
                    </div>
                  </button>
                  {/* Subtle Divider between items */}
                  <div className="mx-5 h-[1px] bg-neutral-100 last:hidden" />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export { Dropdown };