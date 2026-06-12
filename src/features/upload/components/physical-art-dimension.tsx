"use client";

import * as React from "react";
import Image from "next/image";
import { CircleHelp } from "lucide-react";
import { Button, Switch } from "@/components";
import DimensionsRow from "@/components/ui/dimension-input";
import { StepperInput } from "@/components/ui/quantity-input";
import { useArtworkStore } from "@/store/artwork.store";
import type { PhysicalDetails } from "@/types/artwork";

interface PhysicalArtDimensionProps {
  id?: string;
  onNext: () => void;
  onSaveAndExit: () => void;
  steps: string;
  onBack: () => void;
  number: string;
  hideVariationSection?: boolean
}

export default function PhysicalArtDimension({
  onNext,
  onSaveAndExit,
  steps,
  onBack,
  number,
  hideVariationSection
}: PhysicalArtDimensionProps) {
  const draft = useArtworkStore((state) => state.draft)
  const setDraftField = useArtworkStore((state) => state.setDraftField)
  const setDraftStep  = useArtworkStore((state) => state.setDraftStep)

  const price = draft.price ? String(draft.price) : ""
  const hasVariants = draft.has_variants ?? false

  // physical_details holds dimensions + available_quantity
  const physicalDetails: Partial<PhysicalDetails> = draft.physical_details ?? {}

  const earnings = React.useMemo(() => {
    const numPrice = parseFloat(price) || 0
    return (numPrice * 0.86).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [price])

  // Merge a single dimension key into physical_details
  const handleDimensionChange = (key: string, val: number) => {
    setDraftField("physical_details", {
      ...physicalDetails,
      [key]: val,
    } as PhysicalDetails)
  }

  // Merge available_quantity into physical_details
  const handleAvailableQtyChange = (val: number) => {
    setDraftField("physical_details", {
      ...physicalDetails,
      available_quantity: val,
    } as PhysicalDetails)
  }

  return (
    <div className="w-full max-w-2xl bg-white border border-neutral-100 rounded-[40px] overflow-hidden shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between px-6 py-4 items-center border-b border-gray-50">
        <div className="flex gap-4 items-center">
          <h6 className="font-raleway font-semibold text-primary-500 text-h5 leading-8 tracking-wide">Step</h6>
          <h6 className="font-raleway font-semibold text-primary-500 text-h5 leading-8 tracking-wide">
            {number}<span className="text-gray-500">/{steps}</span>
          </h6>
        </div>
        <div className="flex gap-4 items-center">
          <Button variant="outline" className="py-3 px-6 leading-6 text-sm font-medium" onClick={onSaveAndExit}>
            Save Draft
          </Button>
          <button
            type="button"
            onClick={onSaveAndExit}
            className="border border-gray-50 rounded-full p-2 hover:bg-gray-50 transition-colors"
          >
            <Image src="/icons/cancel.svg" width={20} height={20} alt="cancel icon" />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-6">

        {/* PRICE — draft.price: number */}
        <section className="space-y-2">
          <div className="flex items-center gap-3">
            <label className="text-body-s font-medium font-poppins text-gray-500 tracking-wide">
              <span className="text-primary-600 mr-1">*</span>Price per Unit
            </label>
            <CircleHelp size={18} className="text-[#30A2FF] cursor-help" fill="#30A2FF" color="white" />
          </div>
          <p className="font-poppins font-normal text-body-xs leading-4 text-gray-100 tracking-wide">
            Enter the amount buyers will pay per unit.{" "}
            <span className="text-primary-500 font-semibold">Artsony</span> takes a{" "}
            <span className="text-primary-600 font-semibold">14%</span> fee from each sale — your earning is shown below.
          </p>
          <div className="space-y-3">
            <PriceInput
              value={price}
              placeholder="00.00"
              onChange={(e) =>
                setDraftField(
                  "price",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
            <div className="inline-flex items-center px-4 py-2 bg-secondary-100 text-gray-400 rounded-full text-body-xs font-poppins">
              You Earn = ₦<span className="font-semibold">{earnings}</span>
            </div>
          </div>
        </section>

        {/* DIMENSIONS — draft.physical_details: { length, width, height, unit } */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-body-s font-medium font-poppins text-gray-500 tracking-wide">
              <span className="text-primary-600 mr-1">*</span>Dimensions
            </label>
            <CircleHelp size={18} className="text-[#30A2FF] cursor-help" fill="#30A2FF" color="white" />
          </div>
          <DimensionsRow
            values={physicalDetails}
            onChange={handleDimensionChange}
          />
        </section>

        {/* QUANTITY — physical_details.available_quantity + draft.max_purchase_quantity */}
        <section className="space-y-6">
          <div className="space-y-4">
            <label className="text-body-s font-medium font-poppins text-gray-500 tracking-wide">
              <span className="text-primary-500 mr-1">*</span>Available Quantity
            </label>
            <StepperInput
              placeholder="1 Qty"
              value={physicalDetails.available_quantity ?? 1}
              onValueChange={handleAvailableQtyChange}
            />
          </div>

          <div className="space-y-4">
            <label className="text-body-s font-medium font-poppins text-gray-500 tracking-wide">
              <span className="text-primary-600 mr-1">*</span>Max Purchase Quantity
            </label>
            <p className="text-sm text-gray-200 font-poppins">
              Set the maximum number of units a single buyer can purchase in one order — leave blank for no limit.
            </p>
            <StepperInput
              placeholder="00"
              value={draft.max_purchase_quantity ?? 0}
              onValueChange={(val) =>
                setDraftField("max_purchase_quantity", val === 0 ? undefined : val)
              }
            />
          </div>
        </section>

        {/* VARIATIONS — draft.has_variants: boolean */}
        {!hideVariationSection && <section className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-body-s text-gray-500 font-poppins">
              Does this artwork have variations?
            </h3>
            <Switch
              checked={hasVariants}
              onCheckedChange={(val) => setDraftField("has_variants", val)}
            />
          </div>
          <p className="text-sm text-gray-200 font-poppins max-w-lg">
            Enable this if your artwork is available in different forms (e.g., size or material). If not, keep off and sell as a single version.
          </p>
        </section>}

      </div>

      {/* FOOTER */}
      <div className="py-6 px-6 flex gap-4 border-t border-gray-50 bg-white sticky bottom-0">
        <Button
          variant="outline"
          fullWidth
          onClick={onBack}
          className="rounded-full py-4 border-primary-500 text-primary-500 flex items-center justify-center gap-2 hover:bg-primary-50"
        >
          <Image src="/icons/alt-arrow-left-double-red.svg" width={18} height={18} alt="back icon" />
          Back
        </Button>
        <Button
          fullWidth
          onClick={onNext}
          className="rounded-full py-4 bg-primary-500 text-white flex items-center justify-center gap-2 hover:bg-primary-600 shadow-lg shadow-primary-500/20"
        >
          Next
          <Image src="/icons/alt-arrow-right-double.svg" width={18} height={18} alt="next icon" />
        </Button>
      </div>
    </div>
  );
}

const PriceInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="flex items-center h-14 w-full rounded-full border border-neutral-200 bg-white px-6 focus-within:border-primary-600 transition-all">
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xl">🇳🇬</span>
      <span className="text-body-s font-semibold text-gray-500 mr-1">₦</span>
      <Image src="/icons/alt-arrow-down.svg" width={20} height={20} alt="arrow" />
    </div>
    <div className="w-[1px] h-8 bg-neutral-100 mx-5 shrink-0" />
    <input
      type="number"
      placeholder="00.00"
      className="flex-1 bg-transparent text-lg font-medium text-neutral-800 placeholder:text-neutral-300 outline-none"
      {...props}
    />
  </div>
);