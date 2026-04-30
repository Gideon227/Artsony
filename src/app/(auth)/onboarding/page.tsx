"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// CONSTANTS & DATA
// ============================================================================

// Images are generated using a stable seed (the ID) so they look unique and
// populate immediately. Replace these URLs with your actual local paths 
// (e.g., '/images/interests/abstract.jpg') when you have the assets.
const INTERESTS = [
  { id: "abstract", label: "Abstract", image: "https://picsum.photos/seed/abstract/400/200" },
  { id: "animation", label: "Animation", image: "https://picsum.photos/seed/animation/400/200" },
  { id: "architecture", label: "Architecture", image: "https://picsum.photos/seed/architecture/400/200" },
  { id: "assemblage", label: "Assemblage", image: "https://picsum.photos/seed/assemblage/400/200" },
  { id: "branding", label: "Branding", image: "https://picsum.photos/seed/branding/400/200" },
  { id: "calligraphy", label: "Calligraphy", image: "https://picsum.photos/seed/calligraphy/400/200" },
  { id: "caricature", label: "Caricature", image: "https://picsum.photos/seed/caricature/400/200" },
  { id: "ceramics", label: "Ceramics", image: "https://picsum.photos/seed/ceramics/400/200" },
  { id: "collage", label: "Collage", image: "https://picsum.photos/seed/collage/400/200" },
  { id: "conceptual-art", label: "Conceptual art", image: "https://picsum.photos/seed/conceptual/400/200" },
  { id: "comics", label: "Comics", image: "https://picsum.photos/seed/comics/400/200" },
  { id: "digital-art", label: "Digital art", image: "https://picsum.photos/seed/digital/400/200" },
  { id: "fashion-design", label: "Fashion design", image: "https://picsum.photos/seed/fashion/400/200" },
  { id: "fantasy", label: "Fantasy", image: "https://picsum.photos/seed/fantasy/400/200" },
  { id: "game-art", label: "Game art", image: "https://picsum.photos/seed/game/400/200" },
  { id: "glass-art", label: "Glass art", image: "https://picsum.photos/seed/glass/400/200" },
  { id: "graffiti", label: "Graffiti", image: "https://picsum.photos/seed/graffiti/400/200" },
  { id: "illustration", label: "Illustration", image: "https://picsum.photos/seed/illustration/400/200" },
  { id: "industrial-design", label: "Industrial design", image: "https://picsum.photos/seed/industrial/400/200" },
  { id: "interior-design", label: "Interior design", image: "https://picsum.photos/seed/interior/400/200" },
  { id: "metal-art", label: "Metal art", image: "https://picsum.photos/seed/metal/400/200" },
  { id: "mosaic", label: "Mosaic", image: "https://picsum.photos/seed/mosaic/400/200" },
  { id: "murals", label: "Murals", image: "https://picsum.photos/seed/murals/400/200" },
  { id: "painting", label: "Painting", image: "https://picsum.photos/seed/painting/400/200" },
  { id: "pen-ink", label: "Pen & Ink", image: "https://picsum.photos/seed/penink/400/200" },
  { id: "photography", label: "Photography", image: "https://picsum.photos/seed/photography/400/200" },
  { id: "pop-art", label: "Pop art", image: "https://picsum.photos/seed/popart/400/200" },
  { id: "photorealism", label: "Photorealism", image: "https://picsum.photos/seed/photorealism/400/200" },
  { id: "sculpting", label: "Sculpting", image: "https://picsum.photos/seed/sculpting/400/200" },
  { id: "sound-art", label: "Sound art", image: "https://picsum.photos/seed/sound/400/200" },
  { id: "street-art", label: "Street art", image: "https://picsum.photos/seed/street/400/200" },
  { id: "surrealism", label: "Surrealism", image: "https://picsum.photos/seed/surrealism/400/200" },
  { id: "textile-art", label: "Textile art", image: "https://picsum.photos/seed/textile/400/200" },
  { id: "visual-effect", label: "Visual effect", image: "https://picsum.photos/seed/visual/400/200" },
  { id: "water-color", label: "Water color", image: "https://picsum.photos/seed/watercolor/400/200" },
  { id: "woodworking", label: "Woodworking", image: "https://picsum.photos/seed/woodworking/400/200" },
];

export default function SelectInterestsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isReady = selected.length >= 3;

  const handleSubmit = async () => {
    if (!isReady) return;
    
    setIsSubmitting(true);
    try {
      // API integration point
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.push("/feed"); 
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center py-12 lg:py-20 overflow-x-hidden">
      
      {/* =====================================================================
        HEADER SECTION
        ===================================================================== */}
      <div className="w-full max-w-[1000px] px-6 flex flex-col items-center text-center">
        <Image 
          src="/icons/logo.svg" 
          alt="Artsony" 
          width={180} 
          height={45} 
          priority 
          className="mb-14" 
        />

        <h1 className="text-[28px] md:text-[36px] font-medium text-[#F15A2B] mb-3 tracking-tight">
          Let&apos;s Find Your Visual Obsession
        </h1>
        
        <p className="text-[#4A4A4A] text-[15px] md:text-[16px] mb-2">
          Pick the styles, moods, or mediums that speak to you — we’ll handle the rest.
        </p>
        
        <p className="text-[#1A1A1A] font-medium text-[15px] md:text-[16px] mb-12">
          Select at least <span className="text-[#F15A2B]">3</span> Interests to get started
        </p>
      </div>

      {/* =====================================================================
        INTERESTS GRID
        ===================================================================== */}
      <div className="w-full max-w-[1000px] px-4 md:px-8 flex flex-wrap justify-center gap-4 md:gap-6 mb-20">
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest.id);
          
          return (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={cn(
                "relative group h-[56px] bg-black rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 select-none",
                // Subtle scale effect instead of layout-shifting borders
                isSelected ? "scale-105 shadow-md ring-2 ring-[#F15A2B] ring-offset-2" : "hover:scale-105 active:scale-95"
              )}
            >
              {/* Background Image (Using standard img to bypass Next.js external domain config requirements for now) */}
              <img
                src={interest.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover -z-20 pointer-events-none"
                loading="lazy"
              />

              {/* Overlay Gradient for Text Legibility */}
              <div 
                className={cn(
                  "absolute inset-0 transition-colors duration-300 -z-10",
                  isSelected ? "bg-black/20" : "bg-black/60 group-hover:bg-black/40"
                )} 
              />

              {/* Text */}
              <span className="text-white font-medium text-[15px] tracking-wide whitespace-nowrap drop-shadow-md">
                {interest.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
        BOTTOM ACTION & FOOTER
        ===================================================================== */}
      <div className="w-full max-w-[1000px] px-6 md:px-8 flex flex-col">
        
        {/* Action Row - Aligned Right as per design */}
        <div className="flex flex-col md:flex-row justify-end items-center gap-6 md:gap-8 mb-24 w-full">
          <div className="text-[17px] font-medium text-[#1A1A1A]">
            Selected 
            <span className="text-[#F15A2B] ml-2 text-[18px]">
              ( {selected.length} )
            </span>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!isReady || isSubmitting}
            className={cn(
              "h-[52px] px-10 rounded-full font-medium text-[16px] transition-all flex items-center justify-center min-w-[220px] w-full md:w-auto",
              isReady
                ? "bg-[#F15A2B] hover:bg-[#E04D20] text-white active:scale-[0.98] shadow-lg shadow-[#F15A2B]/20"
                : "bg-[#EAEAEA] text-[#A3A3A3] cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Reveal My Vibe"
            )}
          </button>
        </div>

        {/* Footer Links - Centered */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-[14px] text-neutral-500 font-medium">
          <Link href="/privacy" className="hover:text-neutral-800 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-neutral-800 transition-colors">Terms & Conditions</Link>
          <Link href="/faq" className="hover:text-neutral-800 transition-colors">FAQ</Link>
          <Link href="/about" className="hover:text-neutral-800 transition-colors">About</Link>
          <button className="hover:text-neutral-800 transition-colors">Language</button>
        </div>

      </div>
    </main>
  );
}