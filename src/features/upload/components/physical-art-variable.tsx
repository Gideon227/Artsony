"use client";

import * as React from "react";
import Image from "next/image";
import { CircleHelp, ChevronDown, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, Dialog, Input } from "@/components";
import { StepperInput } from "@/components/ui/quantity-input";
import DimensionsRow from "@/components/ui/dimension-input";
import { useArtworkStore } from "@/store/artwork.store";
import type { Variant, VariantOption } from "@/types/artwork";
import UploadHeader from "./upload-header";
import PriceInput from "@/components/ui/price-input";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocalVariation {
  uid:        string;
  label:      string;
  price:      string;   // → price_modifier
  stock:      number;   // → stock
  isExpanded: boolean;
  // Dimensions — persisted via sku as JSON
  length: string;
  breadth:  string;       // ← was 'breadth', now matches DimensionsRow / PhysicalDetails
  height: string;
  weight: string;
}

// Encode/decode dimensions into sku so they survive store round-trips
interface DimensionSku {
  length?: number;
  breadth?:  number;
  height?: number;
  weight?: number;
}

const encodeSku  = (d: DimensionSku): string => JSON.stringify(d)
const decodeSku  = (sku: string | null): DimensionSku => {
  if (!sku) return {}
  try { return JSON.parse(sku) } catch { return {} }
}

type VariantTypeKey = 'SIZE' | 'COLOR' | 'MATERIAL' | 'FRAMING' | 'EDITION'

const VARIANT_TYPE_OPTIONS: { label: string; value: VariantTypeKey }[] = [
  { label: 'Size',     value: 'SIZE' },
  { label: 'Color',    value: 'COLOR' },
  { label: 'Material', value: 'MATERIAL' },
  { label: 'Framing',  value: 'FRAMING' },
  { label: 'Edition',  value: 'EDITION' },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface PhysicalArtVariableProps {
  id?: string;
  onNext: () => void;
  onSaveAndExit: () => void;
  steps: string;
  number: string;
  onBack: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PhysicalArtVariable({
  onNext,
  onSaveAndExit,
  steps,
  onBack,
  number
}: PhysicalArtVariableProps) {
  const draft         = useArtworkStore((s) => s.draft)
  const setDraftField = useArtworkStore((s) => s.setDraftField)
  const setDraftStep  = useArtworkStore((s) => s.setDraftStep)

  const [variantType, setVariantType] = React.useState<VariantTypeKey>(
    (draft.variants?.[0]?.type as VariantTypeKey) ?? 'SIZE'
  )

  // Seed local state from store — dimensions decoded from sku
  const [variations, setVariations] = React.useState<LocalVariation[]>(() => {
    const existing = draft.variants?.[0]
    if (existing && existing.options.length > 0) {
      return existing.options.map((opt) => {
        const dims = decodeSku(opt.sku)
        return {
          uid:        crypto.randomUUID(),
          label:      opt.label,
          price:      String(opt.price_modifier ?? ''),
          stock:      opt.stock ?? 1,
          isExpanded: false,
          length:     dims.length ? String(dims.length) : '',
          breadth:      dims.breadth  ? String(dims.breadth)  : '',
          height:     dims.height ? String(dims.height) : '',
          weight:     dims.weight ? String(dims.weight) : '',
        }
      })
    }
    return [{
      uid: crypto.randomUUID(), label: '', price: '',
      stock: 1, isExpanded: true,
      length: '', breadth: '', height: '', weight: '',
    }]
  })

  // Sync ALL fields to store — dimensions go into sku as JSON
  const syncToStore = React.useCallback(
    (localVars: LocalVariation[], type: VariantTypeKey) => {
      const options = localVars.map((lv): Omit<VariantOption, 'id'> => ({
        label:          lv.label || 'Unnamed',
        price_modifier: parseFloat(lv.price) || 0,
        // Encode dimensions into sku so they survive remounts
        sku: encodeSku({
          length: lv.length ? Number(lv.length) : undefined,
          breadth:  lv.breadth  ? Number(lv.breadth)  : undefined,
          height: lv.height ? Number(lv.height) : undefined,
          weight: lv.weight ? Number(lv.weight) : undefined,
        }),
        stock: lv.stock,
        is_available: lv.stock > 0,
      }))

      const variant: Omit<Variant, 'id'> = {
        type,
        name: `${type.charAt(0) + type.slice(1).toLowerCase()} Options`,
        options: options as VariantOption[],
      }

      setDraftField('variants', [variant] as Variant[])
    },
    [setDraftField]
  )

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addVariation = () => {
    const newVar: LocalVariation = {
      uid: crypto.randomUUID(), label: '', price: '',
      stock: 1, isExpanded: true,
      length: '', breadth: '', height: '', weight: '',
    }
    const updated = [
      ...variations.map((v) => ({ ...v, isExpanded: false })),
      newVar,
    ]
    setVariations(updated)
    syncToStore(updated, variantType)
  }

  const removeVariation = (uid: string) => {
    const updated = variations.filter((v) => v.uid !== uid)
    setVariations(updated)
    syncToStore(updated, variantType)
  }

  const toggleExpand = (uid: string) => {
    setVariations((prev) =>
      prev.map((v) => (v.uid === uid ? { ...v, isExpanded: !v.isExpanded } : v))
    )
    // No store sync needed for UI-only toggle
  }

  const updateField = (uid: string, field: keyof LocalVariation, value: any) => {
    const updated = variations.map((v) =>
      v.uid === uid ? { ...v, [field]: value } : v
    )
    setVariations(updated)
    // . Now syncs ALL fields including dimensions (via sku encoding above)
    if (field !== 'isExpanded') {
      syncToStore(updated, variantType)
    }
  }

  const handleTypeChange = (type: VariantTypeKey) => {
    setVariantType(type)
    syncToStore(variations, type)
  }

  const handleNextStep = () => {
    setDraftStep(4)
    onNext()
  }

  return (
    <div className="w-full max-w-2xl bg-white border border-neutral-100 rounded-[40px] overflow-hidden shadow-sm font-poppins">

      {/* HEADER */}
      <UploadHeader
        number={number}
        steps={steps}
        onSaveAndExit={onSaveAndExit}
      />

      {/* CONTENT */}
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

        {/* VARIANT TYPE */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-body-s font-medium font-poppins text-gray-500 tracking-wide">
              <span className="text-primary-500 mr-1">*</span>Variable Type
            </label>
            <CircleHelp size={18} className="text-[#30A2FF] cursor-help" fill="#30A2FF" color="white" />
          </div>
          <div className="relative">
            <select
              className="w-full h-14 rounded-full border border-neutral-200 px-6 appearance-none outline-none focus:border-primary-500 transition-all text-neutral-600"
              value={variantType}
              onChange={(e) => handleTypeChange(e.target.value as VariantTypeKey)}
            >
              {VARIANT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={addVariation}
          className="w-full h-16 rounded-full border-2 border-dashed border-neutral-100 flex items-center justify-center gap-2 text-primary-500 font-medium font-poppins text-body-s hover:bg-neutral-50 transition-all"
        >
          <div className="bg-primary-500 rounded-full p-1">
            <Plus size={14} color="white" strokeWidth={3} />
          </div>
          Add {VARIANT_TYPE_OPTIONS.find((o) => o.value === variantType)?.label ?? 'Option'}
        </button>

        {/* VARIATION CARDS */}
        <div className="space-y-4">
          <AnimatePresence>
            {variations.map((item) => (
              <VariationCard
                key={item.uid}
                item={item}
                onDelete={() => removeVariation(item.uid)}
                onToggle={() => toggleExpand(item.uid)}
                onChange={(field, value) => updateField(item.uid, field, value)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-6 px-6 flex gap-4 border-t border-gray-50 bg-white sticky bottom-0">
        <Button variant="outline" fullWidth onClick={onBack} className="rounded-full py-4 border-primary-500 text-primary-500 flex items-center justify-center gap-2 hover:bg-primary-50">
          <Image src="/icons/alt-arrow-left-double-red.svg" width={18} height={18} alt="back icon" />
          Back
        </Button>
        <Button fullWidth onClick={handleNextStep} className="rounded-full py-4 bg-primary-500 text-white flex items-center justify-center gap-2 hover:bg-primary-600 shadow-lg shadow-primary-500/20">
          Next
          <Image src="/icons/alt-arrow-right-double.svg" width={18} height={18} alt="next icon" />
        </Button>
      </div>
    </div>
  )
}

// ── VariationCard ─────────────────────────────────────────────────────────────

interface VariationCardProps {
  item: LocalVariation;
  onDelete: () => void;
  onToggle: () => void;
  onChange: (field: keyof LocalVariation, value: any) => void;
}

function VariationCard({ item, onDelete, onToggle, onChange }: VariationCardProps) {
  const earnings = (parseFloat(item.price || "0") * 0.86).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "border rounded-[32px] transition-all duration-300 bg-white",
        item.isExpanded ? "border-neutral-100 p-6 space-y-6" : "border-neutral-200 py-4 px-6"
      )}
    >
      <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
        {item.isExpanded ? (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="text-primary-500 hover:opacity-80 transition-opacity"
          >
            <Image src="/icons/trash-red.svg" width={20} height={20} alt="delete" />
          </button>
        ) : (
          <span className="text-neutral-500 font-medium truncate pr-4 text-sm">
            {item.label || 'Unnamed'} — ₦{parseFloat(item.price || '0').toLocaleString()} — Qty: {item.stock}
          </span>
        )}
        <div className={cn(
          "h-10 w-10 flex items-center justify-center rounded-full border border-neutral-100 transition-transform shrink-0",
          item.isExpanded && "rotate-180"
        )}>
          <Image src="/icons/alt-arrow-down.svg" width={20} height={20} alt="expand" />
        </div>
      </div>

      {item.isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="space-y-6 overflow-hidden px-2"
        >
          {/* Label */}
          <Input
            value={item.label}
            onChange={(e) => onChange("label", e.target.value)}
            placeholder="Option label (e.g. Medium, Red, Linen)"
            className="placeholder:font-normal mt-1"
          />

          {/* Price */}
          <div className="space-y-3">
            <div className="flex items-center h-14 w-full rounded-full border border-neutral-100 px-6 focus-within:border-primary-500 transition-all">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xl">🇳🇬</span>
                <span className="font-bold text-neutral-800">₦</span>
                <ChevronDown size={14} className="text-neutral-400" />
              </div>
              <div className="w-[1px] h-6 bg-neutral-100 mx-4" />
              <input
                type="number"
                className="flex-1 w-full outline-none text-gray-400 font-medium bg-transparent"
                placeholder="Price modifier"
                value={item.price}
                onChange={(e) => onChange("price", e.target.value)}
              />
            </div>
            <div className="inline-flex px-4 py-2 bg-[#E6F6F4] text-[#2D9181] rounded-full text-sm font-semibold">
              You Earn = ₦{earnings}
            </div>
          </div>

          {/* 
            Dimensions — . now uses 'width' to match DimensionsRow key output.
            Persisted to store via sku JSON encoding in syncToStore. 
          */}
          <div className="space-y-2">
            {/* <label className="text-xs font-bold text-neutral-400 ml-4 uppercase tracking-wider">
              Dimensions
            </label> */}
            <DimensionsRow
              values={{
                length: item.length ? Number(item.length) : undefined,
                breadth:  item.breadth  ? Number(item.breadth)  : undefined, // ← fixed: was breadth
                height: item.height ? Number(item.height) : undefined,
                weight: item.weight ? Number(item.weight) : undefined,
              }}
              onChange={(key, val) => onChange(key as keyof LocalVariation, String(val))}
            />
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 ml-4 uppercase tracking-wider">
              Qty Available
            </label>
            <StepperInput
              className="max-w-none"
              value={item.stock}
              onValueChange={(val) => onChange("stock", val)}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}