"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // Added for animations
import { cn } from "@/lib/utils";
import { SearchInput } from "../ui/search-input";
import UserMenuOverlay from "@/features/home/components/user-menu-overlay";

const IconButton = ({
  icon,
  className,
  onClick,
  hideOnMobile = false,
}: {
  icon: string;
  className?: string;
  onClick?: () => void;
  hideOnMobile?: boolean;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center justify-center cursor-pointer w-10 h-10 rounded-full border border-neutral-200 text-slate-600 hover:bg-neutral-50 transition-colors active:scale-95",
      hideOnMobile ? "hidden md:flex" : "flex",
      className
    )}
  >
    <Image src={icon} width={20} height={20} alt="icon" />
  </button>
);

export function Navbar({ hideSearchBar = false }: { hideSearchBar?: boolean }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to control menu

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <header className="w-full bg-white border-b-2 border-gray-50 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          
          {/* LEFT SECTION */}
          <div className="flex items-center gap-8 shrink-0">
            <Link href="/" className="shrink-0 flex items-center pt-1">
              <Image src="/home/logo-text.svg" alt="Artsony Logo" width={136} height={20} priority className="h-4 w-auto md:h-5" />
            </Link>
            <nav className="hidden md:flex items-center gap-2 font-medium font-poppins leading-6 text-[16px]">
              <Link href="/discover" className="text-gray-400 hover:text-primary-500 transition-colors p-2 tracking-wide">Discover</Link>
              <Link href="/shop" className="text-gray-400 hover:text-primary-500 transition-colors p-2 tracking-wide">Shop</Link>
            </nav>
          </div>

          {/* MIDDLE SECTION */}
          {!hideSearchBar && (
            <div className="hidden md:flex flex-1 max-w-[600px] mx-8">
              <SearchInput placeholder="Find your next visual obsession..." leftIconPath='/home/magnifier.svg' onSearch={handleSearch} />
            </div>
          )}

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <IconButton icon='/home/upload-square.svg' hideOnMobile />
              <IconButton icon='/home/delivery.svg' hideOnMobile />
              <Link href="/notifications"><IconButton icon='/home/notification-bell.svg' /></Link>
              <Link href='/cart'>
                <IconButton icon='/home/cart.svg' hideOnMobile />
              </Link>
              <Link href='/messages'>
                <IconButton icon='/home/message.svg' hideOnMobile />
              </Link>
            </div>

            {/* User Profile Button - CLICK TRIGGERS MENU */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="hidden md:flex items-center gap-2 ml-2 group cursor-pointer"
            >
              <div className="relative w-10 h-10 rounded-full border border-neutral-200 overflow-hidden">
                <Image src="/images/image-avatar.svg" alt="User Avatar" fill className="object-cover" />
              </div>
              <Image src='/icons/arrow-down.svg' width={14} height={8} alt="arrow down" />
            </button>

            <IconButton icon='/home/hamburger.svg' className="md:hidden" />
          </div>
        </div>
      </header>

      {/* --- MENU OVERLAY SYSTEM --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* 1. Backdrop (Low opacity black covering screen) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)} // Close when clicking outside
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px]"
            />

            {/* 2. Menu Component (Floating over the backdrop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-20 right-6 md:right-16 z-[70]"
            >
              <UserMenuOverlay />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}