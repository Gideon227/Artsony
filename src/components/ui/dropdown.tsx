// // components/ui/dropdown.tsx
// "use client";

// import * as React from "react";
// import { ChevronDown, Lock, User } from "lucide-react";
// import { cn } from "@/lib/utils";
// import Image from "next/image";
// import { Checkbox } from "./checkbox";

// export type DropdownVariant = "default" | "error" | "success";

// export interface DropdownOption {
//   id: string | number;
//   label: string;
//   description?: string;
//   icon?: string;
//   rightIcon?: boolean;
//   disabled?: boolean;
// }

// interface DropdownProps {
//   options: DropdownOption[];
//   value?: DropdownOption;
//   onChange?: (option: DropdownOption) => void;
//   placeholder?: string;
//   variant?: DropdownVariant;
//   disabled?: boolean;
//   leftIcon?: string;
//   rightIcon?: string;
//   className?: string;
// }

// const Dropdown = ({
//   options,
//   value,
//   onChange,
//   placeholder = "Placeholder",
//   variant = "default",
//   disabled = false,
//   leftIcon,
//   rightIcon,
//   className,
// }: DropdownProps) => {
//   const [isOpen, setIsOpen] = React.useState(false);
//   const containerRef = React.useRef<HTMLDivElement>(null);

//   // Close when clicking outside
//   React.useEffect(() => {
//     const handleClick = (e: MouseEvent) => {
//       if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

//   const variantStyles = {
//     default: "border-neutral-200 focus-within:ring-[#F15A2B]",
//     error: "border-red-500 focus-within:ring-red-500",
//     success: "border-emerald-500 focus-within:ring-emerald-500",
//   };

//   return (
//     <div className={cn("relative w-full", className)} ref={containerRef}>
//       {/* TRIGGER BUTTON */}
//       <button
//         type="button"
//         disabled={disabled}
//         onClick={() => setIsOpen(!isOpen)}
//         className={cn(
//           "cursor-pointer flex items-center w-full h-12 px-6 rounded-full border bg-white transition-all outline-none",
//           "text-sm font-medium text-neutral-800",
//           "hover:border-neutral-300",
//           "focus:ring-2 focus:ring-offset-2 focus:ring-offset-white",
//           variantStyles[variant],
//           disabled && "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-100",
//           isOpen && "border-neutral-300 ring-2 ring-offset-2 ring-[#F15A2B]/20"
//         )}
//       >
//         {leftIcon && (
//           <span className="mr-3 shrink-0">
//             <Image width={20} height={20} src={leftIcon} alt="icon" className="w-auto h-auto"/>
//           </span>
//         )}
        
//         <span className={cn("flex-1 text-left truncate", !value && "text-neutral-400")}>
//           {value ? value.label : placeholder}
//         </span>

//         {rightIcon 
//           ? <Image src={rightIcon} width={16} height={16} alt="icon" />
//           : <ChevronDown 
//               className={cn("ml-2 h-5 w-5 text-neutral-400 transition-transform", isOpen && "rotate-180")} 
//             />
//         }
//       </button>

//       {/* DROPDOWN MENU */}
//       {isOpen && !disabled && (
//         <div className="absolute top-[calc(100%+8px)] left-0 w-full z-40 bg-white border border-neutral-200 rounded-b-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100" style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
//           <ul className="max-h-[320px] overflow-y-auto py-2 custom-scrollbar">
//             {options.map((option) => {
//               const isSelected = value?.id === option.id;
              
//               return (
//                 <li key={option.id}>
//                   {/* CHANGED: Swapped <button> for <div role="button"> to fix DOM nesting error */}
//                   <div
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => {
//                       if (option.disabled) return;
//                       onChange?.(option);
//                       setIsOpen(false);
//                     }}
//                     onKeyDown={(e) => {
//                       if (option.disabled) return;
//                       if (e.key === 'Enter' || e.key === ' ') {
//                         e.preventDefault();
//                         onChange?.(option);
//                         setIsOpen(false);
//                       }
//                     }}
//                     className={cn(
//                       "flex items-center w-full px-6 py-3 text-left transition-colors cursor-pointer outline-none",
//                       "hover:bg-neutral-50",
//                       isSelected && "bg-primary-500 text-white hover:bg-primary-400",
//                       option.disabled && "opacity-50 cursor-not-allowed"
//                     )}
//                   >
//                     {option.icon && (
//                       <div className={cn(
//                         "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100",
//                         isSelected && "bg-white/20"
//                       )}>
//                         <Image width={20} height={20} src={option.icon} alt="icon" className="w-auto h-auto" />
//                       </div>
//                     )}

//                     <div className="ml-3 flex flex-col flex-1 overflow-hidden pointer-events-none">
//                       <span className="font-poppins font-medium text-body-s truncate leading-tight">
//                         {option.label}
//                       </span>
//                       {option.description && (
//                         <span className={cn(
//                           "text-[12px] font-normal font-poppins leading-5 mt-1",
//                           isSelected ? "text-white" : "text-gray-200"
//                         )}>
//                           {option.description}
//                         </span>
//                       )}
//                     </div>

//                     {option.rightIcon && (
//                       <div className="ml-2 shrink-0">
//                         {/* CHANGED: Made the checkbox controlled and disabled pointer events so the row handles the click */}
//                         <Checkbox 
//                           checked={isSelected} 
//                           className="pointer-events-none"
//                           tabIndex={-1} 
//                         />
//                       </div>
//                     )}
//                   </div>
//                   <div className="mx-5 h-[1px] bg-neutral-100 last:hidden" />
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export { Dropdown };


"use client";

import * as React from "react";
import { ChevronDown, Search, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Checkbox } from "./checkbox";

export type DropdownVariant = "default" | "error" | "success";
export type DropdownIndicator = "checkbox" | "checkmark" | "highlight" | "none";
export type DropdownLayout = "list" | "grid";
export type DropdownSearchVariant = "inline" | "button";

export interface DropdownOption {
  id: string | number;
  label: string;
  description?: string;
  icon?: string;
  /** Swatch color for layout="grid" (e.g. color filters). */
  hex?: string;
  rightIcon?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  variant?: DropdownVariant;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  className?: string;

  // ── Single-select (existing, unchanged default behavior) 
  value?: DropdownOption;
  onChange?: (option: DropdownOption) => void;

  // ── Multi-select (opt-in) 
  multiple?: boolean;
  values?: DropdownOption[];
  onChangeMultiple?: (options: DropdownOption[]) => void;
  maxSelected?: number;

  // ── Search (opt-in) 
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  searchVariant?: DropdownSearchVariant;
  onSearchSubmit?: () => void;

  // ── Rendering (opt-in) ────
  layout?: DropdownLayout;
  indicator?: DropdownIndicator;
  isLoading?: boolean;
  emptyMessage?: string;

  // ── Custom body (opt-in) ──
  // Replaces the multi-select/search/options list with arbitrary content
  // (e.g. a price range slider) while keeping the trigger button/chrome,
  // outside-click-to-close, and open/close state as-is.
  customBody?: React.ReactNode;
  /** Overrides the trigger label — e.g. "$200 - $5,000" once a range is set. */
  valueLabel?: string;
}

const Dropdown = ({
  options,
  value,
  onChange,
  multiple = false,
  values,
  onChangeMultiple,
  maxSelected,
  placeholder = "Placeholder",
  variant = "default",
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  searchable = false,
  searchPlaceholder = "Search",
  searchValue,
  onSearchChange,
  searchVariant = "inline",
  onSearchSubmit,
  layout = "list",
  indicator,
  isLoading = false,
  emptyMessage = "No results found",
  customBody,
  valueLabel,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const resolvedIndicator: DropdownIndicator = indicator ?? "checkbox";

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

  const selectedValues = values ?? [];
  const isSelected = (option: DropdownOption) =>
    multiple
      ? selectedValues.some((v) => v.id === option.id)
      : value?.id === option.id;

  const atMax = multiple && maxSelected !== undefined && selectedValues.length >= maxSelected;

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;

    if (multiple) {
      const already = selectedValues.some((v) => v.id === option.id);
      if (!already && atMax) return; // hard cap — silently ignore, chips row already shows "x / max"
      const next = already
        ? selectedValues.filter((v) => v.id !== option.id)
        : [...selectedValues, option];
      onChangeMultiple?.(next);
      // Multi-select stays open so more than one option can be picked in a row
      return;
    }

    onChange?.(option);
    setIsOpen(false);
  };

  const removeChip = (id: string | number) => {
    onChangeMultiple?.(selectedValues.filter((v) => v.id !== id));
  };

  const triggerLabel = valueLabel
    ? valueLabel
    : multiple
      ? selectedValues.length > 0
        ? `${selectedValues.length} selected`
        : placeholder
      : value
        ? value.label
        : placeholder;

  const hasCustomValue = Boolean(valueLabel);

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

        <span className={cn("flex-1 text-left truncate", !hasCustomValue && !value && selectedValues.length === 0 && "text-neutral-400")}>
          {triggerLabel}
        </span>

        {rightIcon
          ? <Image src={rightIcon} width={16} height={16} alt="icon" />
          : <ChevronDown
              className={cn("ml-2 h-5 w-5 text-neutral-400 transition-transform shrink-0", isOpen && "rotate-180")}
            />
        }
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && !disabled && (
        <div
          className="absolute top-[calc(100%+8px)] flex flex-col gap-y-2 left-0 w-full min-w-[320px] z-40 bg-white border border-neutral-200 rounded-b-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          {/* Header label*/}
          {/* <div className="px-6 pt-5 pb-2">
            <span className="font-poppins font-medium text-sm text-gray-200">{placeholder}</span>
          </div> */}

          {customBody ? (
            <div className="px-6 py-4">{customBody}</div>
          ) : (
          <>
          {/* Multi-select: selected count + chips */}
          {multiple && (
            <div className="px-6 py-4 flex flex-col gap-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-neutral-900">
                  Selected&nbsp;
                  <span className="text-primary-500">
                    ({String(selectedValues.length).padStart(2, "0")})
                  </span>
                </span>
                {maxSelected !== undefined && (
                  <span className="text-xs text-neutral-400">{maxSelected} max</span>
                )}
              </div>
              {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedValues.map((v, i) => (
                    <span
                      key={v.id}
                      className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full bg-primary-500 text-white text-sm font-medium"
                    >
                      {v.label}
                      <button
                        type="button"
                        onClick={() => removeChip(v.id)}
                        aria-label={`Remove ${v.label}`}
                        className="w-5 h-5 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors"
                      >
                        <span className="text-xs leading-none">✕</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search */}
          {searchable && (
            <div className="px-6 py-4 flex items-center gap-2">
              <div className="relative flex-1">
                {searchVariant === "inline" && (
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                )}
                <input
                  type="text"
                  value={searchValue ?? ""}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={cn(
                    "w-full h-12 rounded-full border border-neutral-200 bg-white text-sm text-neutral-700 outline-none",
                    "focus:ring-2 focus:ring-primary-500 focus:border-primary-50",
                    searchVariant === "inline" ? "pl-10 pr-4" : "px-4"
                  )}
                />
              </div>
              {searchVariant === "button" && (
                <button
                  type="button"
                  onClick={() => onSearchSubmit?.()}
                  aria-label="Search"
                  className="shrink-0 w-11 h-11 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center transition-colors"
                >
                  <Search className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
          )}

          {/* Options — grid (color swatches) */}
          {layout === "grid" ? (
            <div className="px-6 pb-5 max-h-[320px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                </div>
              ) : options.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-6">{emptyMessage}</p>
              ) : (
                <div className="grid grid-cols-4 gap-12 pt-8">
                  {options.map((option) => {
                    const selected = isSelected(option);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelect(option)}
                        disabled={option.disabled}
                        aria-label={option.label}
                        aria-pressed={selected}
                        className="relative w-12 h-12 aspect-square rounded-full transition-transform hover:scale-105 disabled:opacity-40 disabled:pointer-events-none"
                        style={{
                          backgroundColor: option.hex,
                          border: option.hex === "#FFFFFF" || option.hex === "#ffffff"
                            ? "1px solid #E5E5E5"
                            : undefined,
                        }}
                      >
                        {selected && (
                          <span className="absolute inset-0 flex items-center justify-center rounded-full ring-2 ring-offset-2 ring-primary-500">
                            <Check
                              className="h-4 w-4"
                              color={["#FFFFFF", "#ffffff", "#F5F0DC", "#FFFDE0"].includes(option.hex ?? "") ? "#171717" : "#FFFFFF"}
                            />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Options — list (categories / location / feed-mode)
            <ul className="max-h-[320px] overflow-y-auto py-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                </div>
              ) : options.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-6">{emptyMessage}</p>
              ) : (
                options.map((option, index) => {
                  const selected = isSelected(option);
                  const disabledRow = option.disabled || (multiple && !selected && atMax);

                  return (
                    <li key={option.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelect(option)}
                        onKeyDown={(e) => {
                          if (disabledRow) return;
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelect(option);
                          }
                        }}
                        className={cn(
                          "flex items-center w-full h-15 px-6 py-3 text-left transition-colors cursor-pointer outline-none",
                          resolvedIndicator === "highlight"
                            ? selected
                              ? "bg-primary-500 text-white"
                              : "hover:bg-neutral-50"
                            : cn(
                                "hover:bg-neutral-50",
                                selected && resolvedIndicator === "checkbox" && "bg-primary-500 text-white hover:bg-primary-400"
                              ),
                          disabledRow && "opacity-50 cursor-not-allowed",
                          index < options.length ? 'border-t border-gray-50' : 'border-0'
                        )}
                      >
                        {option.icon && (
                          <div className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100",
                            selected && resolvedIndicator === "checkbox" && "bg-white/20"
                          )}>
                            <Image width={20} height={20} src={option.icon} alt="icon" className="w-auto h-auto" />
                          </div>
                        )}

                        <div className={cn("flex flex-col flex-1 overflow-hidden pointer-events-none", option.icon && "ml-3")}>
                          <span className={`font-poppins font-medium text-body-s truncate leading-tight text-body`}>
                            {option.label}
                          </span>
                          {option.description && (
                            <span className={cn(
                              "text-[12px] font-normal font-poppins leading-5 mt-1",
                              selected && resolvedIndicator === "checkbox" ? "text-white" : "text-gray-200"
                            )}>
                              {option.description}
                            </span>
                          )}
                        </div>

                        {resolvedIndicator === "checkbox" && option.rightIcon && (
                          <div className="ml-2 shrink-0">
                            <Checkbox checked={selected} className="pointer-events-none" tabIndex={-1} />
                          </div>
                        )}

                        {resolvedIndicator === "checkmark" && selected && (
                          <div className="ml-2 shrink-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className="mx-5 h-[1px] bg-neutral-100 last:hidden" />
                    </li>
                  );
                })
              )}
            </ul>
          )}
          </>
          )}
        </div>
      )}
    </div>
  );
};

export { Dropdown };