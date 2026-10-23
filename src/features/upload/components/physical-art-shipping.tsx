"use client";

import * as React from "react";
import Image from "next/image";
import { Check, CircleHelp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";
import { useArtworkStore } from "@/store/artwork.store";
import type { PhysicalDetails } from "@/types/artwork";
import UploadHeader from "./upload-header";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubRegion {
  id: string;
  label: string;
  countriesHint: string;
}

interface ContinentData {
  id: string;
  name: string;
  subRegions: SubRegion[];
}

interface PhysicalArtShippingProps {
  id?: string;
  steps?: string;
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
  number: string
}

// ── Static data ───────────────────────────────────────────────────────────────

const SHIPPING_DATA: ContinentData[] = [
  {
    id: "africa",
    name: "Africa",
    subRegions: [
      { id: "north_africa",   label: "North Africa",   countriesHint: "(e.g., Egypt, Morocco, Algeria, Tunisia, Libya, Sudan)" },
      { id: "west_africa",    label: "West Africa",    countriesHint: "(e.g., Nigeria, Ghana, Senegal, Ivory Coast, Togo, Benin)" },
      { id: "east_africa",    label: "East Africa",    countriesHint: "(e.g., Kenya, Ethiopia, Tanzania, Uganda, Rwanda)" },
      { id: "central_africa", label: "Central Africa", countriesHint: "(e.g., Cameroon, DR Congo, Gabon, Chad)" },
      { id: "south_africa",   label: "South Africa",   countriesHint: "(e.g., South Africa, Namibia, Botswana, Zimbabwe, Zambia)" },
    ],
  },
  {
    id: "asia",
    name: "Asia",
    subRegions: [
      { id: "east_asia",      label: "East Asia",      countriesHint: "(e.g., Japan, South Korea, China, Taiwan)" },
      { id: "southeast_asia", label: "Southeast Asia", countriesHint: "(e.g., Singapore, Malaysia, Thailand, Vietnam, Indonesia)" },
      { id: "south_asia",     label: "South Asia",     countriesHint: "(e.g., India, Pakistan, Bangladesh, Sri Lanka)" },
      { id: "middle_east",    label: "Middle East",    countriesHint: "(e.g., UAE, Saudi Arabia, Qatar, Jordan, Kuwait)" },
    ],
  },
  {
    id: "europe",
    name: "Europe",
    subRegions: [
      { id: "western_europe",  label: "Western Europe",  countriesHint: "(e.g., UK, France, Germany, Netherlands, Belgium)" },
      { id: "southern_europe", label: "Southern Europe", countriesHint: "(e.g., Italy, Spain, Portugal, Greece)" },
      { id: "northern_europe", label: "Northern Europe", countriesHint: "(e.g., Sweden, Norway, Denmark, Finland)" },
    ],
  },
  {
    id: "north_america",
    name: "North America",
    subRegions: [
      { id: "us_canada",           label: "US & Canada",                   countriesHint: "(e.g., United States, Canada)" },
      { id: "caribbean_central",   label: "Central America & Caribbean",   countriesHint: "(e.g., Mexico, Costa Rica, Jamaica)" },
    ],
  },
  {
    id: "south_america",
    name: "South America",
    subRegions: [
      { id: "northern_andean",       label: "Northern & Andean Region", countriesHint: "(e.g., Colombia, Peru, Ecuador, Venezuela, Bolivia)" },
      { id: "southern_cone_brazil",  label: "Southern Cone & Brazil",   countriesHint: "(e.g., Brazil, Argentina, Chile, Uruguay, Paraguay)" },
    ],
  },
  {
    id: "oceania",
    name: "Oceania",
    subRegions: [
      { id: "australasia",     label: "Australia & New Zealand", countriesHint: "(e.g., Australia, New Zealand)" },
      { id: "pacific_islands", label: "Pacific Islands",         countriesHint: "(e.g., Fiji, Papua New Guinea, Samoa, Tonga)" },
    ],
  },
]

// ── Global Constants ──────────────────────────────────────────────────────────
const ALL_CONTINENT_IDS = SHIPPING_DATA.map((c) => c.id);
const ALL_SUBREGION_IDS = SHIPPING_DATA.flatMap((c) => c.subRegions.map((sr) => sr.id));

// ── Component ─────────────────────────────────────────────────────────────────

export default function PhysicalArtShipping({
  steps = "8",
  onNext,
  onBack,
  onSaveAndExit,
  number
}: PhysicalArtShippingProps) {
  const draft         = useArtworkStore((s) => s.draft)
  const setDraftField = useArtworkStore((s) => s.setDraftField)
  const setDraftStep  = useArtworkStore((s) => s.setDraftStep)

  const physicalDetails: Partial<PhysicalDetails> = draft.physical_details ?? {}

  // `undefined` means the artist has never opened this step for this draft —
  // in that case every region starts out selected.
  const hasSavedRegions = physicalDetails.shipping_regions !== undefined

  // Selected sub-region IDs → physical_details.shipping_regions
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>(
    () => physicalDetails.shipping_regions ?? ALL_SUBREGION_IDS
  )

  // Which continent IDs are visible in the accordion (chosen via top dropdown)
  const [activeContinentIds, setActiveContinentIds] = React.useState<string[]>(
    () => {
      if (!hasSavedRegions) return ALL_CONTINENT_IDS
      // Otherwise pre-expand continents that already have sub-regions selected in the store
      return SHIPPING_DATA
        .filter((c) => c.subRegions.some((sr) => (physicalDetails.shipping_regions ?? []).includes(sr.id)))
        .map((c) => c.id)
    }
  )

  // Which of the active continents are accordion-expanded (open vs collapsed)
  const [expandedContinents, setExpandedContinents] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(activeContinentIds.map((id) => [id, true]))
  )

  // Sync selected sub-regions to store
  const syncRegionsToStore = (regions: string[]) => {
    setDraftField('physical_details', {
      ...physicalDetails,
      shipping_regions: regions,
      ships_worldwide: regions.length === ALL_SUBREGION_IDS.length,
    } as PhysicalDetails)
  }

  // First visit: persist the "everything selected" default so it is saved with the draft
  React.useEffect(() => {
    if (!hasSavedRegions) syncRegionsToStore(ALL_SUBREGION_IDS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const toggleContinentOption = (optId: string) => {
    // "Worldwide" toggles every continent at once
    if (optId === "worldwide") {
      const isAllSelected = activeContinentIds.length === ALL_CONTINENT_IDS.length;

      if (isAllSelected) {
        setActiveContinentIds([]);
        setSelectedRegions([]);
        syncRegionsToStore([]);
        setExpandedContinents({});
      } else {
        setActiveContinentIds(ALL_CONTINENT_IDS);
        setSelectedRegions(ALL_SUBREGION_IDS);
        syncRegionsToStore(ALL_SUBREGION_IDS);
        setExpandedContinents(Object.fromEntries(ALL_CONTINENT_IDS.map((id) => [id, true])));
      }
      return;
    }

    const continent = SHIPPING_DATA.find((c) => c.id === optId)
    if (!continent) return
    const subIds = continent.subRegions.map((sr) => sr.id)

    if (activeContinentIds.includes(optId)) {
      // Removing a continent also deselects its sub-regions
      const updated = selectedRegions.filter((r) => !subIds.includes(r))
      setActiveContinentIds((prev) => prev.filter((id) => id !== optId))
      setSelectedRegions(updated)
      syncRegionsToStore(updated)
    } else {
      // Adding a continent selects all of its sub-regions and opens it
      const updated = Array.from(new Set([...selectedRegions, ...subIds]))
      setActiveContinentIds((prev) => [...prev, optId])
      setSelectedRegions(updated)
      syncRegionsToStore(updated)
      setExpandedContinents((prev) => ({ ...prev, [optId]: true }))
    }
  }

  // The multi-select Dropdown hands back the whole new list; work out which row was toggled
  const handleContinentsChange = (next: DropdownOption[]) => {
    const prevIds = new Set(selectedOptionValues.map((o) => String(o.id)))
    const nextIds = new Set(next.map((o) => String(o.id)))
    const toggled =
      [...nextIds].find((id) => !prevIds.has(id)) ??
      [...prevIds].find((id) => !nextIds.has(id))
    if (toggled) toggleContinentOption(toggled)
  }

  const toggleSubRegion = (subRegionId: string) => {
    const updated = selectedRegions.includes(subRegionId)
      ? selectedRegions.filter((r) => r !== subRegionId)
      : [...selectedRegions, subRegionId]
    setSelectedRegions(updated)
    syncRegionsToStore(updated)
  }

  const toggleAllContinent = (continent: ContinentData) => {
    const subIds = continent.subRegions.map((sr) => sr.id)
    const allSelected = subIds.every((id) => selectedRegions.includes(id))
    const updated = allSelected
      ? selectedRegions.filter((id) => !subIds.includes(id))
      : Array.from(new Set([...selectedRegions, ...subIds]))
    setSelectedRegions(updated)
    syncRegionsToStore(updated)
  }

  const toggleContinentAccordion = (continentId: string) => {
    setExpandedContinents((prev) => ({ ...prev, [continentId]: !prev[continentId] }))
  }

  const handleNextStep = () => {
    setDraftStep(6)
    onNext()
  }

  // ── Dropdown config ──────────────────────────────────────────────────────────

  const isWorldwideActive = activeContinentIds.length === ALL_CONTINENT_IDS.length;

  const dropdownOptions: DropdownOption[] = [
    {
      id: "worldwide",
      label: "Worldwide / All Regions",
      description: isWorldwideActive ? "All continents selected" : "Ship globally",
      icon: "/icons/global.svg",
    },
    ...SHIPPING_DATA.map((c) => {
      const selectedCount = c.subRegions.filter((sr) => selectedRegions.includes(sr.id)).length
      return {
        id:          c.id,
        label:       c.name,
        description: activeContinentIds.includes(c.id)
          ? `${selectedCount} of ${c.subRegions.length} subregions selected`
          : 'Not added',
        icon: "/icons/global.svg",
      }
    })
  ];

  // Rows that get a check mark
  const selectedOptionValues = dropdownOptions.filter((o) =>
    o.id === "worldwide" ? isWorldwideActive : activeContinentIds.includes(String(o.id))
  )

  // Text shown in the closed dropdown
  const triggerLabel = React.useMemo(() => {
    if (activeContinentIds.length === 0) return undefined
    if (activeContinentIds.length === ALL_CONTINENT_IDS.length) return "Worldwide"

    const names = SHIPPING_DATA
      .filter((c) => activeContinentIds.includes(c.id))
      .map((c) => c.name)
      .join(', ')
    return names.length > 38 ? `${names.slice(0, 35)}...` : names
  }, [activeContinentIds])

  // Only render continents that have been selected via the top dropdown
  const visibleContinents = SHIPPING_DATA.filter((c) => activeContinentIds.includes(c.id))

  return (
    <div className="border border-gray-50 rounded-2xl flex flex-col justify-between bg-white">
      <div>
        {/* HEADER */}
        <UploadHeader
          number={number}
          steps={steps}
          onSaveAndExit={onSaveAndExit}
        />

        {/* CONTENT */}
        <div className="p-6 space-y-6 max-h-[68vh] overflow-y-auto no-scrollbar">

          {/* HEADLINE */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[18px] font-medium font-poppins text-gray-700">
                <span className="text-primary-500 mr-1">*</span>Where can you ship this artwork?
              </label>
              <CircleHelp size={18} className="text-secondary-100" fill="#30A2FF" color="white" />
            </div>
            <p className="text-body-xs leading-6 text-gray-200 font-poppins font-medium">
              Every region is selected by default — deselect the ones you don't ship to.
              Buyers outside selected regions won't be able to purchase.
            </p>
          </div>

          {/* TOP DROPDOWN — selects which continents appear in accordion below */}
          <div className="w-full pt-1">
            <Dropdown
              options={dropdownOptions}
              multiple
              hideChips
              indicator="checkmark"
              values={selectedOptionValues}
              onChangeMultiple={handleContinentsChange}
              valueLabel={triggerLabel}
              placeholder="Select continents to ship to..."
              title="Ship to"
              leftIcon="/icons/global.svg"
              className="h-14"
            />
          </div>

          {/* ACCORDION */}
          {visibleContinents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-200 gap-2">
              <Image src="/icons/global.svg" width={32} height={32} alt="globe" className="opacity-30" />
              <p className="font-poppins text-sm">Select continents above to configure shipping regions</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {visibleContinents.map((continent) => {
                const isExpanded        = !!expandedContinents[continent.id]
                const allSubSelected    = continent.subRegions.every((sr) => selectedRegions.includes(sr.id))

                return (
                  <div key={continent.id} className="space-y-2">
                    <h3 className="text-body-s font-poppins font-medium text-gray-700 ml-2">{continent.name}</h3>

                    <div className="border border-neutral-100 rounded-2xl overflow-hidden bg-white">
                      {/* "All" row */}
                      <div
                        onClick={() => toggleContinentAccordion(continent.id)}
                        className="flex items-center justify-between px-6 py-3 bg-white cursor-pointer select-none"
                      >
                        <div
                          className="flex items-center gap-3"
                          onClick={(e) => { e.stopPropagation(); toggleAllContinent(continent) }}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                            allSubSelected ? "border-[#F15A2B] bg-[#F15A2B]" : "border-neutral-300 bg-white"
                          )}>
                            {allSubSelected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center justify-center"
                              >
                                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden />
                              </motion.span>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-neutral-700">All</span>
                        </div>
                        <div className={cn(
                          "h-8 w-8 flex items-center justify-center rounded-full transition-transform duration-300",
                          isExpanded && "rotate-180"
                        )}>
                          <ChevronDown size={18} className="text-neutral-400" />
                        </div>
                      </div>

                      {/* Sub-regions */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden bg-white"
                          >
                            <div className="divide-y divide-neutral-100">
                              {continent.subRegions.map((subRegion) => {
                                const isSelected = selectedRegions.includes(subRegion.id)
                                return (
                                  <div
                                    key={subRegion.id}
                                    onClick={() => toggleSubRegion(subRegion.id)}
                                    className={cn(
                                      "flex items-center justify-between px-6 py-4 transition-all duration-150 cursor-pointer select-none",
                                      isSelected ? "bg-[#F15A2B] text-white" : "bg-white hover:bg-neutral-50 text-neutral-700"
                                    )}
                                  >
                                    <div className="flex flex-col pr-4 max-w-[85%]">
                                      <span className={cn(
                                        "text-sm font-semibold leading-tight",
                                        isSelected ? "text-white" : "text-neutral-700"
                                      )}>
                                        {subRegion.label}
                                      </span>
                                      <span className={cn(
                                        "text-xs font-medium mt-1 leading-normal",
                                        isSelected ? "text-white/80" : "text-neutral-400"
                                      )}>
                                        {subRegion.countriesHint}
                                      </span>
                                    </div>
                                    <div className={cn(
                                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                                      isSelected ? "border-white bg-white" : "border-neutral-200 bg-white"
                                    )}>
                                      {isSelected && <Check className="h-3.5 w-3.5 text-[#F15A2B]" strokeWidth={3} aria-hidden />}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-6 px-6 items-center flex gap-4 border-t border-gray-50">
        <Button
          leftIcon="/icons/alt-arrow-left-double-red.svg"
          fullWidth
          variant="outline"
          className="border-primary-500 text-primary-500 hover:bg-primary-50"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          rightIcon="/icons/alt-arrow-right-double.svg"
          fullWidth
          onClick={handleNextStep}
        >
          Next
        </Button>
      </div>
    </div>
  )
}