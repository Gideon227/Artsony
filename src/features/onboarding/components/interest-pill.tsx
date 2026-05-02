"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InterestPillProps {
  label: string;
  image: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function InterestPill({ label, image, isSelected, onToggle }: InterestPillProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={cn(
        "relative h-[48px] cursor-pointer px-6 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 border-2",
        isSelected ? "border-[#F15A2B] ring-2 ring-[#F15A2B]/20" : "border-transparent"
      )}
    >
      {/* Background Image */}
      <Image
        src={image}
        alt={label}
        fill
        className={cn(
          "object-cover transition-transform duration-500",
          isSelected ? "scale-110" : "scale-100"
        )}
      />
      
      {/* Overlay */}
      <div className={cn(
        "absolute inset-0 bg-black/40 transition-colors",
        isSelected ? "bg-black/20" : "bg-black/50"
      )} />

      {/* Label */}
      <span className="relative z-10 text-white font-poppins font-medium text-[15px] tracking-wide text-nowrap">
        {label}
      </span>
    </motion.button>
  );
}