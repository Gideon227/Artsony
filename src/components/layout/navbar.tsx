"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  Upload, 
  Package, 
  Bell, 
  ShoppingCart, 
  Mail, 
  ChevronDown, 
  Menu 
} from "lucide-react";
import { cn } from "@/lib/utils"; 
import { SearchInput } from "../ui/search-input";

const IconButton = ({ 
  icon, 
  className, 
  onClick, 
  hideOnMobile = false 
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

export function Navbar() {
  return (
    <header className="w-full bg-white border-b-2 border-gray-50 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        
        {/* LEFT SECTION: Logo & Navigation Links */}
        <div className="flex items-center gap-8 shrink-0">
          <Link href="/" className="shrink-0 flex items-center pt-1">
            {/* Replace with your actual Artsony logo SVG */}
            <Image 
              src="/home/logo-text.svg" 
              alt="Artsony Logo" 
              width={136} 
              height={20} 
              priority 
              className="h-4 w-auto md:h-5"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-2 font-medium font-poppins leading-6 text-[16px]">
            <Link href="/discover" className="text-gray-400 hover:text-primary-500 transition-colors p-2 tracking-wide">
              Discover
            </Link>
            <Link href="/shop" className="text-gray-400 hover:text-primary-500 transition-colors p-2 tracking-wide">
              Shop
            </Link>
          </nav>
        </div>

        {/* 2. MIDDLE SECTION: Search Bar (Desktop Only) */}
        <div className="hidden md:flex flex-1 max-w-[600px]">
          <SearchInput placeholder="Find your next visual obsession..." leftIconPath='/home/magnifier.svg'/>
        </div>

        {/* 3. RIGHT SECTION: Actions & Profile */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          
          {/* Action Icons Group */}
          <div className="flex items-center gap-2 md:gap-3">
            <IconButton icon='/home/upload-square.svg' hideOnMobile />
            <IconButton icon='/home/delivery.svg' hideOnMobile />
            
            {/* Bell is visible on both Mobile and Desktop */}
            <IconButton icon='/home/notification-bell.svg' />
            
            <IconButton icon='/home/cart.svg' hideOnMobile />
            <IconButton icon='/home/message.svg' hideOnMobile />
          </div>

          {/* User Profile Dropdown (Desktop Only) */}
          <button className="hidden md:flex items-center gap-2 ml-2 group">
            <div className="relative w-10 h-10 rounded-full border border-neutral-200 overflow-hidden">
              <Image 
                src="/images/image-avatar.svg" 
                alt="User Avatar" 
                fill 
                className="object-cover"
              />
            </div>
            <Image src='/icons/arrow-down.svg' width={14} height={8} alt="arrow down" />
          </button>

          {/* Mobile Menu Toggle (Mobile Only) */}
          <IconButton icon='/home/hamburger.svg' className="md:hidden" />
          
        </div>
      </div>
    </header>
  );
}