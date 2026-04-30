"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
];

const PhoneInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedCountry, setSelectedCountry] = React.useState(COUNTRIES[0]);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative w-full" ref={dropdownRef}>
        <div
          className={cn(
            "flex items-center h-12 w-full rounded-full border border-neutral-200 bg-white px-4 transition-all",
            "focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-600/20",
            className
          )}
        >
          {/* Dropdown Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 outline-none shrink-0"
          >
            <span className="text-xl leading-none">{selectedCountry?.flag}</span>
            <span className="text-sm font-medium text-neutral-800">{selectedCountry?.code}</span>
            <ChevronDown 
              className={cn("w-4 h-4 text-neutral-400 transition-transform", isOpen && "rotate-180")} 
              strokeWidth={2.5} 
            />
          </button>

          {/* Vertical Divider */}
          <div className="w-[1px] h-6 bg-neutral-200 mx-3 shrink-0" />

          {/* Phone Number Input */}
          <input
            ref={ref}
            type="tel"
            className="flex-1 bg-transparent text-sm font-medium text-neutral-800 placeholder:text-neutral-400 outline-none"
            placeholder="800 000 0000"
            {...props}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100">
            <div className="max-h-60 overflow-y-auto">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(country);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-neutral-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm font-medium text-neutral-800">{country.name}</span>
                    <span className="text-xs text-neutral-400">{country.code}</span>
                  </div>
                  {selectedCountry?.code === country.code && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };