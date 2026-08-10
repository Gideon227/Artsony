"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // Added for animations
import { cn } from "@/lib/utils";
import { SearchInput } from "../ui/search-input";
import UserMenuOverlay from "@/features/home/components/user-menu-overlay";
import { Input } from "../ui/input";
import NotificationModal from "@/features/notification/components/notification-modal";
import UploadModal from "@/features/upload/components/upload-modal";

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
      hideOnMobile ? "hidden lg:flex" : "flex",
      className
    )}
  >
    <Image src={icon} width={20} height={20} alt="icon" />
  </button>
);

export function Navbar({ hideSearchBar = false }: { hideSearchBar?: boolean }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [showPostArtwork, setShowPostArtwork] = useState(false)
  

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <header className="w-full bg-white border-b-2 border-gray-50 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 lg:px-8 py-3 h-[72px] flex items-center justify-between">
          
          {/* LEFT SECTION */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="shrink-0 flex items-center pt-1">
              <Image src="/home/logo-text.svg" alt="Artsony Logo" width={136} height={20} priority className="h-4 w-[108px] md:w-auto md:h-5" />
            </Link>
            <nav className="hidden lg:flex items-center gap-2 font-medium font-poppins leading-6 text-[16px]">
              <Link href="/discover" className="text-body hover:text-primary-500 transition-colors p-2 tracking-wide">Discover</Link>
              <Link href="/shop" className="text-body hover:text-primary-500 transition-colors p-2 tracking-wide">Shop</Link>
            </nav>
          </div>

          {/* MIDDLE SECTION */}
          {!hideSearchBar && (
            <div className="hidden lg:flex flex-1 max-w-[564px]">
              <SearchInput placeholder="Find your next visual obsession..." leftIconPath='/home/magnifier.svg' onSearch={handleSearch} />
            </div>
          )}

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 lg:gap-3">
              <IconButton onClick={() => setShowPostArtwork(true)} icon='/home/upload-square.svg' hideOnMobile />
              <Link href='/my-orders'>
                <IconButton icon='/home/delivery.svg' hideOnMobile />
              </Link>
              <IconButton onClick={() => setIsNotificationOpen(prev => !prev)} icon='/home/notification-bell.svg' />
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
              className="hidden lg:flex items-center gap-2 ml-2 group cursor-pointer"
            >
              <div className="relative w-10 h-10 rounded-full border border-neutral-200 overflow-hidden">
                <Image src="/images/image-avatar.svg" alt="User Avatar" fill className="object-cover" />
              </div>
              <Image src='/icons/arrow-down.svg' width={14} height={8} alt="arrow down" />
            </button>
          </div>
        </div>
      </header>

      <UploadModal isOpen={showPostArtwork} onClose={() => setShowPostArtwork(false)} />

      {/* --- MENU OVERLAY SYSTEM --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)} 
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed z-[70]",
                "max-lg:inset-0 max-lg:flex max-lg:items-center max-lg:justify-center max-lg:p-4",
                "lg:top-20 lg:right-6 lg:right-16"
              )}
            >
              <UserMenuOverlay />
            </motion.div>
          </>
        )}

        {isNotificationOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed z-[70]",
                "max-lg:inset-0 max-lg:flex max-lg:items-center max-lg:justify-center max-lg:p-4",
                "lg:top-[76px] lg:right-20 lg:right-32"
              )}
            >
              <NotificationModal onClose={() => setIsNotificationOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}