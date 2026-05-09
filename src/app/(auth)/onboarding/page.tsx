'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { InterestPill } from '@/features/onboarding/components/interest-pill'
import { Button } from '@/components'
import { useCompleteOnboarding } from '@/hooks/use-auth-mutations'

const MIN_INTERESTS = 3

export default function OnboardingPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { mutate: complete, isPending } = useCompleteOnboarding()
  const isReady = selectedIds.length >= MIN_INTERESTS

  const toggleInterest = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!isReady) return
    complete(selectedIds)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-16 gap-y-12 relative">

      <header className="w-full flex justify-center">
        <Image src="/icons/logo.svg" alt="Artsony" width={220} height={56} priority />
      </header>

      <main className="w-full flex flex-col gap-y-8">
        <div className="px-8 flex flex-col items-center text-center gap-y-2">
          <h1 className="font-raleway text-[32px] font-semibold text-primary-500 leading-10 tracking-wide">
            Let&apos;s Find Your Visual Obsession
          </h1>
          <p className="font-poppins text-gray-500 text-[14px] leading-6 tracking-wide">
            Pick the styles, moods, or mediums that speak to you — we&apos;ll handle the rest.
          </p>
          <p className="font-poppins font-medium text-gray-500 text-[16px] leading-6 tracking-wide">
            Select at least{' '}
            <span className="text-primary-500">{MIN_INTERESTS}</span>{' '}
            Interests to get started
            {selectedIds.length > 0 && (
              <span className="ml-2 text-neutral-400">
                ({selectedIds.length} selected)
              </span>
            )}
          </p>
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

      <footer className="flex flex-row items-center justify-end w-full px-8 gap-x-6 pb-10">
        <div className="flex items-center gap-2 font-poppins font-medium text-[18px] leading-8 tracking-wide">
          <span className="text-gray-500">Selected</span>
          <span className="text-primary-500">({selectedIds.length})</span>
        </div>

        <Button
          variant="primary"
          disabled={!isReady || isPending}
          isLoading={isPending}
          loadingText="Saving your vibe…"
          onClick={handleSubmit}
          className="h-12 px-8 rounded-full font-poppins font-medium"
        >
          Reveal My Vibe
        </Button>
      </footer>

      {/* Desktop footer links */}
      <div className="hidden lg:flex absolute bottom-6 left-0 right-0 justify-center items-center gap-6 text-sm text-neutral-400 font-medium">
        {[['Privacy', '/privacy'], ['Terms & Conditions', '/terms'], ['FAQ', '/faq'], ['About', '/about']].map(([label, href]) => (
          <Link key={label} href={href!} className="hover:text-neutral-700 transition-colors">{label}</Link>
        ))}
        <button type="button" className="hover:text-neutral-700 transition-colors">Language</button>
      </div>
    </div>
  )
}