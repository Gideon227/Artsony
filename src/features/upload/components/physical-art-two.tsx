"use client";

import * as React from "react";
import Image from "next/image";
import { CircleHelp, X, ChevronDown, Plus, Minus } from "lucide-react";
import { Button, Switch } from "@/components";
import DimensionsRow from "@/components/ui/dimension-input";

export default function PhysicalArtTwo() {
  const [price, setPrice] = React.useState<string>("");
  const [hasVariations, setHasVariations] = React.useState(false);

  // Business Logic: Artsony takes 14%
  const earnings = React.useMemo(() => {
    const numPrice = parseFloat(price) || 0;
    const calculated = numPrice * 0.86;
    return calculated.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [price]);

  return (
    <div className="w-full max-w-2xl bg-white border border-neutral-100 rounded-[40px] overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-50">
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-bold text-primary-600 font-raleway">Step</span>
          <span className="text-[28px] font-bold text-primary-600 font-raleway ml-2">2</span>
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

      {/* CONTENT */}
      <div className="p-8 space-y-10">
        
        {/* PRICE SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-lg font-bold text-neutral-800 font-poppins">
              <span className="text-primary-600 mr-1">*</span>Price per Unit
            </label>
            <CircleHelp size={18} className="text-[#30A2FF] cursor-help" fill="#30A2FF" color="white" />
          </div>
          <p className="text-sm text-neutral-400 font-poppins">
            Enter the amount buyers will pay per unit. <span className="text-primary-600 font-semibold">Artsony</span> takes a <span className="text-primary-600 font-semibold">14%</span> fee from each sale - your earning is shown below
          </p>
          
          <div className="space-y-3">
            <PriceInput value={price} onChange={(e) => setPrice(e.target.value)} />
            <div className="inline-flex items-center px-4 py-2 bg-[#E6F6F4] text-[#2D9181] rounded-full text-sm font-semibold font-poppins">
              You Earn = ₦{earnings}
            </div>
          </div>
        </section>

        {/* DIMENSIONS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-lg font-bold text-neutral-800 font-poppins">
              <span className="text-primary-600 mr-1">*</span>Dimensions
            </label>
            <CircleHelp size={18} className="text-[#30A2FF] cursor-help" fill="#30A2FF" color="white" />
          </div>
          <DimensionsRow />
        </section>

        {/* QUANTITY SECTION */}
        <section className="space-y-6">
          <div className="space-y-4">
             <label className="text-lg font-bold text-neutral-800 font-poppins block">
              <span className="text-primary-600 mr-1">*</span>Available Quantity
            </label>
            <CircleStepper placeholder="1 Qty" />
          </div>

          <div className="space-y-4">
            <label className="text-lg font-bold text-neutral-800 font-poppins block">
              <span className="text-primary-600 mr-1">*</span>Max Purchase Quantity
            </label>
            <p className="text-sm text-neutral-400 font-poppins">
              Set the maximum number of units a single buyer can purchase in one order — leave blank for no limit.
            </p>
            <CircleStepper placeholder="00" />
          </div>
        </section>

        {/* VARIATIONS SECTION */}
        <section className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-800 font-poppins">Does this artwork have variations?</h3>
            <Switch checked={hasVariations} onCheckedChange={setHasVariations} />
          </div>
          <p className="text-sm text-neutral-400 font-poppins leading-relaxed max-w-lg">
            Enable this if your artwork is available in different forms (e.g., size or material). If not, keep off and sell as single version
          </p>
        </section>
      </div>

      {/* FOOTER */}
      <div className="p-8 border-t border-neutral-50 flex gap-4">
        <Button variant="outline" fullWidth className="h-14 rounded-full border-primary-600 text-primary-600 flex gap-2 text-lg font-semibold">
           <Image src="/icons/back-arrow.svg" width={20} height={20} alt="" /> Back
        </Button>
        <Button fullWidth className="h-14 rounded-full bg-primary-600 text-white flex gap-2 text-lg font-semibold">
          Next <Image src="/icons/next-arrow.svg" width={20} height={20} alt="" />
        </Button>
      </div>
    </div>
  );
}

/**
 * CUSTOM SUB-COMPONENTS FOR PIXEL PERFECT UI
 */

const PriceInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="flex items-center h-14 w-full rounded-full border border-neutral-200 bg-white px-6 focus-within:border-primary-600 transition-all">
    <div className="flex items-center gap-3 shrink-0">
      <span className="text-2xl">🇳🇬</span>
      <span className="text-base font-bold text-neutral-800">₦</span>
      <ChevronDown className="w-4 h-4 text-neutral-400" />
    </div>
    <div className="w-[1px] h-8 bg-neutral-100 mx-5 shrink-0" />
    <input
      type="text"
      placeholder="Placeholder"
      className="flex-1 bg-transparent text-lg font-medium text-neutral-800 placeholder:text-neutral-300 outline-none"
      {...props}
    />
  </div>
);

const CircleStepper = ({ placeholder }: { placeholder: string }) => (
  <div className="flex items-center gap-4">
    <button className="h-12 w-12 flex items-center justify-center rounded-full border border-neutral-200 text-slate-600 hover:border-primary-600 transition-colors shadow-sm">
      <Plus size={20} strokeWidth={3} />
    </button>
    <div className="flex-1 h-14 rounded-full border border-neutral-100 bg-white flex items-center justify-center text-lg font-medium text-neutral-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
      {placeholder}
    </div>
    <button className="h-12 w-12 flex items-center justify-center rounded-full border border-neutral-200 text-slate-600 hover:border-primary-600 transition-colors shadow-sm">
      <Minus size={20} strokeWidth={3} />
    </button>
  </div>
);