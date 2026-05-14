'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronsRight } from 'lucide-react'
import { SearchInput } from '@/components/ui/search-input'

interface SearchHeroProps {
  searchQuery: string;
  totalResults: number;
}

export const SearchHero = ({ searchQuery, totalResults }: SearchHeroProps) => {
  return (
    <div className="relative w-full h-[60vh] min-h-100 flex flex-col items-center justify-center bg-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/search-bg.jpg" 
          alt="Search Background" 
          fill 
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Central Search Area */}
      <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center gap-6">
        <div className="w-full bg-white rounded-full p-1 shadow-lg">
          <SearchInput 
            placeholder={searchQuery} 
            leftIconPath="/icons/magnifier.svg" 
            className="w-full border-none focus:ring-0 text-lg py-4"
          />
        </div>
        <h5 className="font-raleway font-semibold text-white text-xl md:text-2xl tracking-wide text-center">
          +{totalResults} <span className="font-normal">Results for</span> {searchQuery}
        </h5>
      </div>

      {/* Bottom Left Author Tag */}
      <div className="absolute bottom-6 left-6 md:left-12 z-10">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden">
            <Image
              src="/images/image-avatar.svg" 
              alt="Ivan Kovačević"
              width={40}
              height={40} 
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white text-sm font-poppins font-medium tracking-tight">
              Ivan Kovačević
            </span>
            <ChevronsRight className="text-white/70 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}