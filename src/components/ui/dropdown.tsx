// components/ui/dropdown.tsx
"use client";

import * as React from "react";
import { ChevronDown, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Checkbox } from "./checkbox";

export type DropdownVariant = "default" | "error" | "success";

export interface DropdownOption {
  id: string | number;
  label: string;
  description?: string;
  icon?: string;
  rightIcon?: boolean;
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

  const variantStyles = {
    default: "border-neutral-200 focus-within:ring-[#F15A2B]",
    error: "border-red-500 focus-within:ring-red-500",
    success: "border-emerald-500 focus-within:ring-emerald-500",
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "cursor-pointer flex items-center w-full h-12 px-6 rounded-full border bg-white transition-all outline-none",
          "text-sm font-medium text-neutral-800",
          "hover:border-neutral-300",
          "focus:ring-2 focus:ring-offset-2 focus:ring-offset-white",
          variantStyles[variant],
          disabled && "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-100",
          isOpen && "border-neutral-300 ring-2 ring-offset-2 ring-[#F15A2B]/20"
        )}
      >
        {leftIcon && (
          <span className="mr-3 shrink-0">
            <Image width={20} height={20} src={leftIcon} alt="icon" className="w-auto h-auto"/>
          </span>
        )}
        
        <span className={cn("flex-1 text-left truncate", !value && "text-neutral-400")}>
          {value ? value.label : placeholder}
        </span>

        <ChevronDown 
          className={cn("ml-2 h-5 w-5 text-neutral-400 transition-transform", isOpen && "rotate-180")} 
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full z-40 bg-white border border-neutral-200 rounded-b-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100" style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <ul className="max-h-[320px] overflow-y-auto py-2 custom-scrollbar">
            {options.map((option) => {
              const isSelected = value?.id === option.id;
              
              return (
                <li key={option.id}>
                  {/* CHANGED: Swapped <button> for <div role="button"> to fix DOM nesting error */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (option.disabled) return;
                      onChange?.(option);
                      setIsOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (option.disabled) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onChange?.(option);
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      "flex items-center w-full px-6 py-3 text-left transition-colors cursor-pointer outline-none",
                      "hover:bg-neutral-50",
                      isSelected && "bg-primary-500 text-white hover:bg-primary-400",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option.icon && (
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100",
                        isSelected && "bg-white/20"
                      )}>
                        <Image width={20} height={20} src={option.icon} alt="icon" className="w-auto h-auto" />
                      </div>
                    )}

                    <div className="ml-3 flex flex-col flex-1 overflow-hidden pointer-events-none">
                      <span className="font-poppins font-medium text-body-s truncate leading-tight">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className={cn(
                          "text-[12px] font-normal font-poppins leading-5 mt-1",
                          isSelected ? "text-white" : "text-gray-200"
                        )}>
                          {option.description}
                        </span>
                      )}
                    </div>

                    {option.rightIcon && (
                      <div className="ml-2 shrink-0">
                        {/* CHANGED: Made the checkbox controlled and disabled pointer events so the row handles the click */}
                        <Checkbox 
                          checked={isSelected} 
                          className="pointer-events-none"
                          tabIndex={-1} 
                        />
                      </div>
                    )}
                  </div>
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