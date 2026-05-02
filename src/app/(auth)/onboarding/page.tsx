"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { INTERESTS } from "@/features/onboarding/data/interests";
import { InterestPill } from "@/features/onboarding/components/interest-pill";
import { cn } from "@/lib/utils";
import { Button } from "@/components";

export default function OnboardingPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isReady = selectedIds.length >= 3;

  const toggleInterest = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-16 2xl:py-26 gap-y-12 relative">
      {/* Header Section */}
      <header className="w-full items-center flex justify-center">
        <Image src="/icons/logo.svg" alt="Artsony" width={220} height={56} priority />
      </header>

      {/* Interest Cloud Grid */}
      <main className="w-full gap-y-8 flex flex-col">
        <div className="px-8 gap-y-2 flex flex-col items-center text-center">
          <h1 className="font-raleway text-[32px] font-semibold text-primary-500 leading-10 tracking-wide text-center">
            Let&apos;s Find Your Visual Obsession
          </h1>
          
          <p className="font-poppins text-gray-500 text-[14px] leading-6 tracking-wide text-center">
            Pick the styles, moods, or mediums that speak to you — we&apos;ll handle the rest.
          </p>
          
          <div className="font-poppins font-medium text-gray-500 text-[16px] leading-6 tracking-wide">
            Select at least <span className="text-primary-500">3</span> Interests to get started
          </div>
        </div>

        <div className="flex flex-wrap justify-center py-6 px-8 gap-3 lg:gap-4">
          {INTERESTS.map((interest, index) => (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <InterestPill
                label={interest.label}
                image={interest.image}
                isSelected={selectedIds.includes(interest.id)}
                onToggle={() => toggleInterest(interest.id)}
              />
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="flex flex-row items-center justify-end w-full px-8 gap-x-6">
          <div className="flex items-center gap-2 font-poppins font-medium text-[18px] leading-8 tracking-wide">
            <span className="text-gray-500">Selected</span>
            <span className="text-primary-500">({selectedIds.length})</span>
          </div>

          <Button
            disabled={!isReady}
            variant='primary'
          >
            Reveal My Vibe
          </Button>
      </footer>

      {/* 3. Sticky Bottom Action Bar */}
      <footer className="absolute py-3 bottom-0 left-0 right-0 z-50 mb-6 mx-auto">
        <div className="hidden lg:flex lg:justify-center lg:items-center w-full absolute left-6 items-center gap-6 text-sm text-neutral-500 font-medium">
          <Link href="/privacy" className="hover:text-black">Privacy</Link>
          <Link href="/terms" className="hover:text-black">Terms & Conditions</Link>
          <Link href="/faq" className="hover:text-black">FAQ</Link>
          <Link href="/about" className="hover:text-black">About</Link>
          <button className="hover:text-black">Language</button>
        </div>
      </footer>
    </div>
  );
}