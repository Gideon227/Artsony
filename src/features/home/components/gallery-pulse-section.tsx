"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils";

const FEATURED_ARTWORKS = [
  { id: "1", imageUrl: "/images/artwork-1.jpg", title: "Visual Echoes" },
  { id: "2", imageUrl: "/images/artwork-2.jpg", title: "Glass Architecture" },
  { id: "3", imageUrl: "/images/artwork-3.jpg", title: "Urban Pulse" },
  { id: "4", imageUrl: "/images/artwork-4.jpg", title: "Abstract Flow" },
  { id: "5", imageUrl: "/images/artwork-5.jpg", title: "Neon Nights" },
  { id: "6", imageUrl: "/images/artwork-6.jpg", title: "Nature's Lens" },
  { id: "7", imageUrl: "/images/artwork-7.jpg", title: "Static Motion" },
  { id: "8", imageUrl: "/images/artwork-8.jpg", title: "The Deep" },
  { id: "9", imageUrl: "/images/artwork-9.jpg", title: "Golden Hour" },
  { id: "10", imageUrl: "/images/artwork-10.jpg", title: "Morning Mist" },
];

export function GalleryPulseSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // 1. Get the items safely
  const currentArtwork = FEATURED_ARTWORKS[index];
  const nextIndex = (index + 1) % FEATURED_ARTWORKS.length;
  const nextArtwork = FEATURED_ARTWORKS[nextIndex];

  const nextStep = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % FEATURED_ARTWORKS.length);
  };

  const prevStep = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + FEATURED_ARTWORKS.length) % FEATURED_ARTWORKS.length);
  };

  useEffect(() => {
    const timer = setInterval(nextStep, 6000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  // 2. Guard against undefined before rendering
  if (!currentArtwork || !nextArtwork) return null;

  return (
    <section className="w-full bg-[#EBF5F5] py-12 px-8 overflow-hidden min-h-125 flex items-center">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-29 items-center w-full">
            
            <div className="lg:col-span-4 flex flex-col space-y-8">
                <div className="space-y-6">
                    <h2 className="text-h3 font-semibold font-raleway leading-8 leading-wide">
                        <span className="text-primary-500">Gallery</span> <span className="text-gray-500">Pulse</span>
                    </h2>
                    <p className="text-gray-400 font-poppins text-body-m midnight-6 tracking-wide max-w-83">
                        These are the artworks that captured the most hearts and eyes this week — across every corner of the gallery.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-6">
                    {FEATURED_ARTWORKS.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                setDirection(i > index ? 1 : -1);
                                setIndex(i);
                            }}
                            className={cn(
                                "h-2 rounded-full transition-all duration-500 cursor-pointer",
                                i === index ? "w-4 bg-primary-500 rounded-[11px]" : "w-2 bg-gray-100"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* --- ONLY MODIFIED THIS RIGHT COLUMN BLOCK --- */}
            <div className="lg:col-span-8 relative h-[400px] flex items-center">
                <div className="relative w-full h-full flex gap-6">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={index}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 100, damping: 30 },
                                opacity: { duration: 0.8 },
                            }}
                            className="absolute inset-0 w-full h-full grid grid-cols-2 gap-6"
                        >
                            {/* Image Card 1 */}
                            <div className="relative w-full h-full rounded-[48px] overflow-hidden">
                                <Image
                                    src={currentArtwork.imageUrl}
                                    alt={currentArtwork.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Image Card 2 */}
                            <div className="relative w-full h-full rounded-[48px] overflow-hidden">
                                <Image
                                    src={nextArtwork.imageUrl}
                                    alt="Next artwork preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Left Button: Disabled on first image, Pink active color otherwise */}
                    <button 
                        onClick={prevStep}
                        disabled={index === 0}
                        className={cn(
                            "absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all z-20 shadow-lg",
                            index === 0 
                                ? "bg-[#D1DFDF] text-[#9FB3B3] cursor-not-allowed" 
                                : "bg-[#FF6B44] hover:scale-110 active:scale-95"
                        )}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Right Button: Disabled on last image view, Pink active color otherwise */}
                    <button 
                        onClick={nextStep}
                        disabled={index >= FEATURED_ARTWORKS.length - 2}
                        className={cn(
                            "absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all z-20 shadow-lg",
                            index >= FEATURED_ARTWORKS.length - 2
                                ? "bg-[#D1DFDF] text-[#9FB3B3] cursor-not-allowed" 
                                : "bg-[#FF6B44] hover:scale-110 active:scale-95"
                        )}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
            {/* --- END OF MODIFIED BLOCK --- */}

        </div>
    </section>
  );
}