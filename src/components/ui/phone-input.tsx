"use client";

import * as React from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import { cn } from "@/lib/utils";

export interface CountryOption {
  iso: CountryCode;
  name: string;
  code: string;
  flag: string;
}

// Convert a 2-letter ISO code (e.g. "US") to a flag emoji
const getFlagEmoji = (iso: string) =>
  [...iso.toUpperCase()]
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");

// Built once at module load: no network, works offline
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const ALL_COUNTRIES: CountryOption[] = getCountries()
  .map((iso) => ({
    iso,
    name: regionNames.of(iso) ?? iso,
    code: `+${getCountryCallingCode(iso)}`,
    flag: getFlagEmoji(iso),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

type PhoneInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onDialCodeChange?: (dialCode: string) => void;
  defaultDialCode?: string;
  /** ISO 3166-1 alpha-2 code, e.g. "NG", "US". Takes priority over defaultDialCode. */
  defaultCountry?: CountryCode;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      onDialCodeChange,
      defaultDialCode = "+234",
      defaultCountry,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const [selectedCountry, setSelectedCountry] = React.useState<CountryOption>(
      () =>
        (defaultCountry && ALL_COUNTRIES.find((c) => c.iso === defaultCountry)) ||
        // Prefer Nigeria when the default is +234 (it's the only country with that code anyway),
        // otherwise first country matching the dial code
        ALL_COUNTRIES.find((c) => c.code === defaultDialCode) ||
        ALL_COUNTRIES[0]!
    );

    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Notify parent whenever the selected dial code changes
    React.useEffect(() => {
      onDialCodeChange?.(selectedCountry.code);
    }, [selectedCountry, onDialCodeChange]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter countries based on search query
    const filteredCountries = React.useMemo(() => {
      if (!searchQuery.trim()) return ALL_COUNTRIES;
      const q = searchQuery.trim().toLowerCase();
      return ALL_COUNTRIES.filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.includes(q)
      );
    }, [searchQuery]);

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
            <span className="text-xl leading-none">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-neutral-800">
              {selectedCountry.code}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-neutral-400 transition-transform",
                isOpen && "rotate-180"
              )}
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
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input inside Dropdown */}
            <div className="px-3 pb-2 mb-1 border-b border-neutral-100">
              <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-neutral-50 border border-neutral-200">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or code..."
                  className="w-full bg-transparent text-xs text-neutral-800 placeholder:text-neutral-400 outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto px-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => {
                  const isSelected = selectedCountry.iso === country.iso;
                  return (
                    <button
                      key={country.iso}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-left",
                        isSelected && "bg-neutral-50"
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-lg shrink-0">{country.flag}</span>
                        <span className="text-sm font-medium text-neutral-800 truncate">
                          {country.name}
                        </span>
                        <span className="text-xs text-neutral-400 shrink-0">
                          {country.code}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-neutral-400 text-center py-4">
                  No countries found
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };