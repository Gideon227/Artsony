"use client";

import * as React from "react";
import Image from "next/image";
import { CircleHelp, X, ChevronDown, Check, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components"; // Assuming standard Button component

// --- Data Models & Mock Data ---
interface Subregion {
  id: string;
  name: string;
  examples: string;
}

interface Continent {
  id: string;
  name: string;
  subregions: Subregion[];
}

const REGIONS: Continent[] = [
  {
    id: "africa",
    name: "Africa",
    subregions: [
      { id: "north_africa", name: "North Africa", examples: "(e.g., Egypt, Morocco, Algeria, Tunisia, Libya, Sudan)" },
      { id: "west_africa", name: "West Africa", examples: "(e.g., Nigeria, Ghana, Senegal, Ivory Coast, Togo, Benin)" },
      { id: "east_africa", name: "East Africa", examples: "(e.g., Kenya, Ethiopia, Tanzania, Uganda, Rwanda)" },
      { id: "central_africa", name: "Central Africa", examples: "(e.g., Cameroon, DR Congo, Gabon, Chad)" },
      { id: "south_africa", name: "South Africa", examples: "(e.g., South Africa, Namibia, Botswana, Zimbabwe, Zambia)" },
    ],
  },
  {
    id: "asia",
    name: "Asia",
    subregions: [
      { id: "east_asia", name: "East Asia", examples: "(e.g., China, Japan, South Korea)" },
      { id: "south_asia", name: "South Asia", examples: "(e.g., India, Pakistan, Bangladesh)" },
      { id: "southeast_asia", name: "Southeast Asia", examples: "(e.g., Indonesia, Thailand, Vietnam)" },
    ],
  },
  {
    id: "europe",
    name: "Europe",
    subregions: [
      { id: "western_europe", name: "Western Europe", examples: "(e.g., France, Germany, Netherlands)" },
      { id: "northern_europe", name: "Northern Europe", examples: "(e.g., UK, Sweden, Norway)" },
    ],
  },
];

export default function UploadStepFive() {
  // State: Set of selected subregion IDs for O(1) lookups
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(["north_africa", "west_africa", "east_africa", "central_africa", "south_africa"]) // Defaulting Africa to selected to match image
  );
  // State: Which accordions are open
  const [expandedContinents, setExpandedContinents] = React.useState<Set<string>>(
    new Set(["africa"])
  );

  // --- Logic Helpers ---
  
  const isContinentFullySelected = (continent: Continent) => {
    return continent.subregions.every((sub) => selectedIds.has(sub.id));
  };

  const isContinentPartiallySelected = (continent: Continent) => {
    const selectedCount = continent.subregions.filter((sub) => selectedIds.has(sub.id)).length;
    return selectedCount > 0 && selectedCount < continent.subregions.length;
  };

  const handleToggleContinent = (continent: Continent) => {
    const newSelected = new Set(selectedIds);
    if (isContinentFullySelected(continent)) {
      // Deselect all
      continent.subregions.forEach((sub) => newSelected.delete(sub.id));
    } else {
      // Select all
      continent.subregions.forEach((sub) => newSelected.add(sub.id));
    }
    setSelectedIds(newSelected);
  };

  const handleToggleSubregion = (subId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(subId)) {
      newSelected.delete(subId);
    } else {
      newSelected.add(subId);
    }
    setSelectedIds(newSelected);
  };

  const toggleAccordion = (continentId: string) => {
    const newExpanded = new Set(expandedContinents);
    if (newExpanded.has(continentId)) {
      newExpanded.delete(continentId);
    } else {
      newExpanded.add(continentId);
    }
    setExpandedContinents(newExpanded);
  };

  // Generate dynamic summary string (e.g., "Africa, Asia, Europe...")
  const summaryText = React.useMemo(() => {
    const selectedContinents: string[] = [];
    REGIONS.forEach((continent) => {
      if (continent.subregions.some((sub) => selectedIds.has(sub.id))) {
        selectedContinents.push(continent.name);
      }
    });
    if (selectedContinents.length === 0) return "Select regions";
    return selectedContinents.join(", ");
  }, [selectedIds]);

  return (
    <div className="w-full max-w-2xl bg-white border border-neutral-100 rounded-[40px] overflow-hidden shadow-sm font-poppins flex flex-col h-[85vh] max-h-[800px]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-50 shrink-0">
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-bold text-primary-600 font-raleway">Step</span>
          <span className="text-[28px] font-bold text-primary-600 font-raleway ml-2">5</span>
          <span className="text-[28px] font-bold text-slate-400 font-raleway">/8</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-full px-8 py-2.5 border-primary-600 text-primary-600 hover:bg-primary-50">
            Save Draft
          </Button>
          <button className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
        
        {/* INFO SECTION */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-lg font-bold text-neutral-800 flex items-center">
              <span className="text-primary-600 mr-1">*</span> Where can you ship this artwork?
            </label>
            <CircleHelp size={18} className="text-[#30A2FF] cursor-help" fill="#30A2FF" color="white" />
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Select the regions where you're willing to ship. Buyers outside these regions won't be able to purchase. For more control, you can expand continents into subregions.
          </p>
        </section>

        {/* SUMMARY SELECTOR (Visual only, acts as a summary) */}
        <div className="flex items-center h-14 w-full rounded-full border border-neutral-200 bg-white px-6">
          <Globe className="text-neutral-500 mr-3" size={20} />
          <span className="flex-1 text-base text-neutral-500 font-medium truncate">
            {summaryText}
          </span>
          <ChevronDown className="text-neutral-400 ml-3" size={20} />
        </div>

        {/* REGIONS LIST */}
        <div className="border border-neutral-100 rounded-[32px] p-6 space-y-6 bg-white shadow-sm">
          {REGIONS.map((continent) => {
            const isExpanded = expandedContinents.has(continent.id);
            const isFullySelected = isContinentFullySelected(continent);
            const isPartiallySelected = isContinentPartiallySelected(continent);

            return (
              <div key={continent.id} className="space-y-3">
                <h4 className="font-bold text-neutral-800 ml-2">{continent.name}</h4>
                
                {/* ACCORDION HEADER (ALL) */}
                <div 
                  className={cn(
                    "border rounded-full px-5 py-3.5 flex items-center justify-between cursor-pointer transition-colors",
                    isExpanded ? "border-neutral-200" : "border-neutral-100 hover:border-neutral-200"
                  )}
                  onClick={() => toggleAccordion(continent.id)}
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleContinent(continent);
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center border transition-all",
                        isFullySelected 
                          ? "bg-primary-600 border-primary-600" 
                          : isPartiallySelected
                            ? "bg-primary-100 border-primary-600 text-primary-600"
                            : "border-neutral-300 bg-white"
                      )}
                    >
                      {(isFullySelected || isPartiallySelected) && (
                        <Check size={14} strokeWidth={3} className={isFullySelected ? "text-white" : "text-primary-600"} />
                      )}
                    </button>
                    <span className="font-medium text-neutral-700">All</span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={cn("text-neutral-400 transition-transform duration-300", isExpanded && "rotate-180")} 
                  />
                </div>

                {/* EXPANDED SUBREGIONS */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border border-neutral-100 rounded-[24px] overflow-hidden mt-2 bg-white">
                        {continent.subregions.map((sub, index) => {
                          const isSelected = selectedIds.has(sub.id);
                          return (
                            <div 
                              key={sub.id}
                              onClick={() => handleToggleSubregion(sub.id)}
                              className={cn(
                                "flex items-center justify-between p-4 cursor-pointer transition-colors border-b last:border-b-0 border-neutral-50 group",
                                isSelected ? "bg-primary-600" : "hover:bg-neutral-50"
                              )}
                            >
                              <div className="flex flex-col gap-1 pr-4">
                                <span className={cn(
                                  "font-semibold text-sm transition-colors",
                                  isSelected ? "text-white" : "text-neutral-700"
                                )}>
                                  {sub.name}
                                </span>
                                <span className={cn(
                                  "text-xs leading-relaxed transition-colors",
                                  isSelected ? "text-primary-100" : "text-neutral-400"
                                )}>
                                  {sub.examples}
                                </span>
                              </div>
                              <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center",
                                isSelected ? "border-white" : "border-neutral-300"
                              )}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-8 border-t border-neutral-50 flex gap-4 shrink-0 bg-white z-10">
        <Button variant="outline" fullWidth className="h-14 rounded-full border-primary-600 text-primary-600 flex gap-2 text-lg font-semibold">
           <Image src="/icons/back-arrow.svg" width={20} height={20} alt="" className="rotate-180" /> Back
        </Button>
        <Button fullWidth className="h-14 rounded-full bg-primary-600 text-white flex gap-2 text-lg font-semibold shadow-lg shadow-primary-600/20">
          Next <Image src="/icons/next-arrow.svg" width={20} height={20} alt="" />
        </Button>
      </div>
    </div>
  );
}