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

  value?: DropdownOption;
  onChange?: (option: DropdownOption) => void;

  multiple?: boolean;
  values?: DropdownOption[];
  onChangeMultiple?: (options: DropdownOption[]) => void;
  maxSelected?: number;

  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  searchVariant?: DropdownSearchVariant;
  onSearchSubmit?: () => void;

  layout?: DropdownLayout;
  indicator?: DropdownIndicator;
  isLoading?: boolean;
  emptyMessage?: string;

  customBody?: React.ReactNode;
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
  const [internalSearch, setInternalSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const resolvedIndicator: DropdownIndicator = indicator ?? "checkbox";

  const query = searchValue !== undefined ? searchValue : internalSearch;

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const lowerQuery = query.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerQuery) ||
        opt.description?.toLowerCase().includes(lowerQuery)
    );
  }, [options, searchable, query]);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setInternalSearch("");
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
      if (!already && atMax) return;
      const next = already
        ? selectedValues.filter((v) => v.id !== option.id)
        : [...selectedValues, option];
      onChangeMultiple?.(next);
      return;
    }

    onChange?.(option);
    setIsOpen(false);
    setInternalSearch("");
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
            <Image width={20} height={20} src={leftIcon} alt="icon" className="w-auto h-auto " />
          </span>
        )}

        <span className={cn("flex-1 text-left truncate", !hasCustomValue && !value && selectedValues.length === 0 && "text-neutral-400")}>
          {triggerLabel}
        </span>

        {rightIcon ? (
          <Image src={rightIcon} width={16} height={16} alt="icon" />
        ) : (
          <ChevronDown
            className={cn("ml-2 h-5 w-5 text-neutral-400 transition-transform shrink-0", isOpen && "rotate-180")}
          />
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && !disabled && (
        <div
          className="absolute top-[calc(100%+8px)] flex flex-col gap-y-2 left-0 w-full z-40 bg-white border border-neutral-200 rounded-b-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          {customBody ? (
            <div className="p-4">{customBody}</div>
          ) : (
            <>
              {/* Multi-select chips */}
              {multiple && (
                <div className="p-4 flex flex-col gap-y-2">
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
                      {selectedValues.map((v) => (
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

              {/* Search Bar */}
              {searchable && (
                <div className="p-4 flex items-center gap-2">
                  <div className="relative flex-1">
                    {searchVariant === "inline" && (
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    )}
                    <input
                      type="text"
                      value={query}
                      onChange={handleSearchInputChange}
                      placeholder={searchPlaceholder}
                      autoFocus
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

              {/* Options — Grid */}
              {layout === "grid" ? (
                <div className="p-4 max-h-[320px] overflow-y-auto custom-scrollbar">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                    </div>
                  ) : filteredOptions.length === 0 ? (
                    <p className="text-sm text-neutral-400 text-center py-6">{emptyMessage}</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-3 place-items-center">
                      {filteredOptions.map((option) => {
                        const selected = isSelected(option);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelect(option)}
                            disabled={option.disabled}
                            aria-label={option.label}
                            aria-pressed={selected}
                            className="relative w-full max-w-[40px] aspect-square rounded-full transition-transform hover:scale-105 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center"
                            style={{
                              backgroundColor: option.hex,
                              border:
                                option.hex === "#FFFFFF" || option.hex === "#ffffff"
                                  ? "1px solid #E5E5E5"
                                  : undefined,
                            }}
                          >
                            {selected && (
                              <span className="absolute inset-0 flex items-center justify-center rounded-full ring-2 ring-offset-2 ring-primary-500">
                                <Check
                                  className="h-3.5 w-3.5"
                                  color={
                                    ["#FFFFFF", "#ffffff", "#F5F0DC", "#FFFDE0"].includes(
                                      option.hex ?? ""
                                    )
                                      ? "#171717"
                                      : "#FFFFFF"
                                  }
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
                /* Options — List */
                <ul className="max-h-[320px] overflow-y-auto py-2 custom-scrollbar">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                    </div>
                  ) : filteredOptions.length === 0 ? (
                    <p className="text-sm text-neutral-400 text-center py-6">{emptyMessage}</p>
                  ) : (
                    filteredOptions.map((option, index) => {
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
                              "flex items-center w-full h-15 px-6 py-3 text-left text-body-xs transition-colors cursor-pointer outline-none",
                              resolvedIndicator === "highlight"
                                ? selected && !multiple
                                  ? "bg-primary-500"
                                  : "hover:bg-neutral-50"
                                : cn(
                                    "hover:bg-neutral-50",
                                    selected &&
                                      !multiple &&
                                      resolvedIndicator === "checkbox" &&
                                      "bg-primary-500 hover:bg-primary-400"
                                  ),
                              disabledRow && "opacity-50 cursor-not-allowed",
                              index < filteredOptions.length ? "border-t border-gray-50" : "border-0"
                            )}
                          >
                            {option.icon && (
                              <div
                                className={cn(
                                  "flex relative h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden bg-neutral-100",
                                  selected && !multiple && resolvedIndicator === "checkbox" && "bg-white/20"
                                )}
                              >
                                <Image
                                  fill
                                  src={option.icon}
                                  alt="icon"
                                  className="object-cover"
                                />
                              </div>
                            )}

                            <div
                              className={cn(
                                "flex flex-col flex-1 overflow-hidden pointer-events-none",
                                option.icon && "ml-3"
                              )}
                            >
                              <span
                                className={cn(
                                  "font-poppins font-medium text-body-xs truncate leading-tight transition-colors",
                                  selected ? "text-white" : "text-neutral-800"
                                )}
                              >
                                {option.label}
                              </span>
                              {option.description && (
                                <span
                                  className={cn(
                                    "text-[12px] font-normal font-poppins leading-5 mt-1 transition-colors",
                                    selected && !multiple ? "text-white/80" : "text-neutral-400"
                                  )}
                                >
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