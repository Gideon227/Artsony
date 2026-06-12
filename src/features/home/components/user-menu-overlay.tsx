"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store";

// Mocking the store import based on your instructions. 
// Replace this with your actual import path:
// import { useUserStore } from "@/store/useUserStore";

export default function UserMenuOverlay() {
  const { user } = useAuthStore();
  
  // --- MOCK DATA FOR DEMONSTRATION ---
//   const user = {
//     name: "Lee Chang",
//     profileImage: "/images/image-avatar", // Placeholder
//     memberSince: "2023",
//   };
  // -----------------------------------

  return (
    <div className="w-99 bg-white rounded-3xl gap-12 border border-gray-50 p-8 flex flex-col box-border">
      
        {/* HEADER: Avatar & User Info */}
        <div className="flex items-center gap-4">
            {/* Profile Image Container */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                {/* The background ring image you mentioned you have */}
                <Image
                    src="/home/profile-ring.svg"
                    alt="Profile Ring"
                    width={112}
                    height={112}
                    className="object-contain"
                    priority
                />
                
                {/* The actual User Avatar */}
                <div className="relative w-21.75 h-21.75 rounded-full overflow-hidden z-10">
                    <Image
                        src={user?.avatarUrl ?? '/images/image-avatar.svg'}
                        alt={`${user?.username}'s profile`}
                        width={87}
                        height={87}
                        className="object-cover"
                    />
                </div>
            </div>

            {/* User Text Details */}
            <div className="flex flex-col gap-2">
                <h3 className="text-[20px] font-semibold font-raleway text-[#02272F] leading-8 tracking-wide">
                    {user?.username}
                </h3>
                <p className="text-body-s text-[#FF7A59] font-medium tracking-wide">
                    member since {user?.created_at?.slice(0, 4)}
                </p>
            </div>
        </div>

      {/* NAVIGATION LINKS */}
        <nav>
            <ul className="flex flex-col space-y-7">
                <li>
                    <Link 
                        href="/profile" 
                        className="text-body-m font-poppins font-medium text-gray-400 hover:text-primary-500 transition-colors tracking-wide block"
                    >
                        Visit Profile
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/studio" 
                        className="text-body-m font-poppins font-medium text-gray-400 hover:text-primary-500 transition-colors tracking-wide block"
                    >
                        Artsony Studio
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/orders" 
                        className="text-body-m font-poppins font-medium text-gray-400 hover:text-primary-500 transition-colors tracking-wide block"
                    >
                        Orders
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/wallet" 
                        className="text-body-m font-poppins font-medium text-gray-400 hover:text-primary-500 transition-colors tracking-wide block"
                    >
                        Wallet
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/settings" 
                        className="text-body-m font-poppins font-medium text-gray-400 hover:text-primary-500 transition-colors tracking-wide block"
                    >
                        Settings
                    </Link>
                </li>
            </ul>
        </nav>
        
        <button 
            onClick={() => console.log("Logout triggered")}
            className="text-body-m text-start cursor-pointer font-poppins font-medium text-gray-400 hover:text-primary-500 transition-colors tracking-wide block"
        >
            Logout
        </button>

    </div>
  );
}