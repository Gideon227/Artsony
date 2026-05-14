"use client";

import * as React from "react";
import Image from "next/image";
import { CircleHelp, X, ChevronDown, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components";
import { StepperInput } from "@/components/ui/quantity-input";
import DimensionsRow from "@/components/ui/dimension-input";

// --- Types ---
interface Variation {
  id: string;
  name: string;
  price: string;
  isExpanded: boolean;
  length: string;
  breadth: string;
  height: string;
  weight: string;
  quantity: number;
}

export default function PhysicalArtVariable() {
  const [variableType, setVariableType] = React.useState("Size");
  const [variations, setVariations] = React.useState<Variation[]>([
    {
      id: "1",
      name: "Medium",
      price: "80000",
      isExpanded: true,
      length: "160",
      breadth: "34",
      height: "65",
      weight: "00",
      quantity: 1,
    },
  ]);

  const addVariation = () => {
    const newVar: Variation = {
      id: crypto.randomUUID(),
      name: "",
      price: "",
      isExpanded: true,
      length: "",
      breadth: "",
      height: "",
      weight: "",
      quantity: 1,
    };
    // Collapse others and add new one
    setVariations(variations.map(v => ({ ...v, isExpanded: false })).concat(newVar));
  };

  const removeVariation = (id: string) => {
    setVariations(variations.filter((v) => v.id !== id));
  };

  const toggleExpand = (id: string) => {
    setVariations(variations.map(v => 
      v.id === id ? { ...v, isExpanded: !v.isExpanded } : v
    ));
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-neutral-100 rounded-[40px] overflow-hidden shadow-sm font-poppins">
      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-50">
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-bold text-primary-600 font-raleway">Step</span>
          <span className="text-[28px] font-bold text-primary-600 font-raleway ml-2">3</span>
          <span className="text-[28px] font-bold text-slate-400 font-raleway">/8</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-full px-8 py-2.5 border-primary-600 text-primary-600">
            Save Draft
          </Button>
          <button className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {/* VARIABLE TYPE SELECTOR */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-base font-bold text-neutral-800">
              <span className="text-primary-600 mr-1">*</span>Variable Type
            </label>
            <CircleHelp size={16} className="text-[#30A2FF]" fill="#30A2FF" color="white" />
          </div>
          <div className="relative">
            <select 
              className="w-full h-14 rounded-full border border-neutral-200 px-6 appearance-none outline-none focus:border-primary-600 transition-all text-neutral-600"
              value={variableType}
              onChange={(e) => setVariableType(e.target.value)}
            >
              <option>Size</option>
              <option>Material</option>
              <option>Color</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* ADD BUTTON */}
        <button 
          onClick={addVariation}
          className="w-full h-16 rounded-full border-2 border-dashed border-neutral-100 flex items-center justify-center gap-2 text-primary-600 font-bold hover:bg-neutral-50 transition-all"
        >
          <div className="bg-primary-600 rounded-full p-1"><Plus size={14} color="white" strokeWidth={3} /></div>
          Add {variableType}
        </button>

        {/* VARIATIONS LIST */}
        <div className="space-y-4">
          <AnimatePresence>
            {variations.map((item) => (
              <VariationCard 
                key={item.id} 
                item={item} 
                onDelete={() => removeVariation(item.id)}
                onToggle={() => toggleExpand(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-8 border-t border-neutral-50 flex gap-4 bg-white">
        <Button variant="outline" fullWidth className="h-14 rounded-full border-primary-600 text-primary-600 flex gap-2 font-bold">
           <Image src="/icons/back-arrow.svg" width={20} height={20} alt="" className="rotate-180" /> Back
        </Button>
        <Button fullWidth className="h-14 rounded-full bg-primary-600 text-white flex gap-2 font-bold">
          Next <Image src="/icons/next-arrow.svg" width={20} height={20} alt="" />
        </Button>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: VariationCard ---

function VariationCard({ item, onDelete, onToggle }: { item: Variation, onDelete: () => void, onToggle: () => void }) {
  const earnings = (parseFloat(item.price || "0") * 0.86).toLocaleString();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "border rounded-[32px] transition-all duration-300",
        item.isExpanded ? "border-neutral-100 p-6 space-y-6" : "border-neutral-200 py-4 px-6"
      )}
    >
      {/* COLLAPSED STATE HEADER / EXPANDED HEADER */}
      <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
        {item.isExpanded ? (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-primary-600">
            <Trash2 size={22} fill="currentColor" className="text-white stroke-primary-600" />
          </button>
        ) : (
          <span className="text-neutral-500 font-medium">
            {item.name || "Unnamed"} — {item.length} × {item.breadth} × {item.height} cm — ₦{parseFloat(item.price || "0").toLocaleString()}
          </span>
        )}
        <div className={cn("h-10 w-10 flex items-center justify-center rounded-full border border-neutral-100 transition-transform", item.isExpanded && "rotate-180")}>
          <ChevronDown size={20} className="text-neutral-400" />
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      {item.isExpanded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="space-y-6 overflow-hidden"
        >
          {/* Name Input */}
          <input 
            className="w-full h-14 rounded-full border border-neutral-100 px-6 outline-none focus:border-primary-600 transition-all text-neutral-700"
            placeholder="Variation Name (e.g. Medium)"
            defaultValue={item.name}
          />

          {/* Price & Earnings */}
          <div className="space-y-3">
            <div className="flex items-center h-14 w-full rounded-full border border-neutral-100 px-6">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xl">🇳🇬</span>
                <span className="font-bold text-neutral-800">₦</span>
                <ChevronDown size={14} className="text-neutral-400" />
              </div>
              <div className="w-[1px] h-6 bg-neutral-100 mx-4" />
              <input 
                className="flex-1 outline-none text-neutral-700 font-medium" 
                placeholder="80,000"
                defaultValue={item.price}
              />
            </div>
            <div className="inline-flex px-4 py-2 bg-[#E6F6F4] text-[#2D9181] rounded-full text-sm font-semibold">
              You Earn = ₦{earnings}
            </div>
          </div>

          {/* Dimensions */}
          <DimensionsRow />

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 ml-4 uppercase tracking-wider">Qty Available</label>
            <StepperInput className="max-w-none" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}