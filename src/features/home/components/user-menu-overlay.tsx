"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { useLogout } from "@/hooks/use-auth-mutations";

const FALLBACK_AVATAR = "/images/image-avatar.svg";

const NAV_LINKS = [
  { label: "Visit Profile", href: "/profile" },
  { label: "Artsony Studio", href: "/artsony-studio" },
  { label: "Orders", href: "/my-orders" },
  { label: "Wallet", href: "/artsony-studio?section=wallet" },
  { label: "Settings", href: "/settings/profile-customization" },
] as const;

export default function UserMenuOverlay({ onClose }: { onClose?: () => void }) {
  const { user } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // `user?.avatarUrl` can be null, undefined, or an empty string depending on
  // what the API sends — `||` catches all three, unlike `??`. `onError` covers
  // the remaining case: a stored URL that 404s or points at a domain not
  // whitelisted in next.config's image loader.
  const [avatarSrc, setAvatarSrc] = useState(user?.avatarUrl || FALLBACK_AVATAR);

  // useAuthStore hydrates from persisted storage after first paint, so
  // `user` can go from null → populated post-mount; keep the avatar in sync.
  useEffect(() => {
    setAvatarSrc(user?.avatarUrl || FALLBACK_AVATAR);
  }, [user?.avatarUrl]);

  const handleLogout = () => {
    onClose?.();
    logout();
  };

  return (
    <div className="w-[calc(100vw-2rem)] max-w-[380px] bg-white rounded-2xl gap-8 md:gap-12 border border-gray-50 p-6 md:p-8 flex flex-col box-border">
      
        {/* HEADER: Avatar & User Info */}
        <div className="flex items-center gap-4">
            {/* Profile Image Container */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <Image
                    src="/home/profile-ring.svg"
                    alt="Profile Ring"
                    width={112}
                    height={112}
                    className="absolute object-contain"
                    priority
                />
                
                {/* The actual User Avatar */}
                <div className="relative w-[87px] h-[87px] rounded-full overflow-hidden z-10 bg-gray-50">
                    <Image
                        src={avatarSrc}
                        alt={user?.username ? `${user.username}'s profile` : 'User avatar'}
                        width={87}
                        height={87}
                        className="h-full w-full object-cover"
                        onError={() => setAvatarSrc(FALLBACK_AVATAR)}
                    />
                </div>
            </div>

            {/* User Text Details */}
            <div className="flex min-w-0 flex-col gap-2">
                <h3 className="truncate text-[20px] font-semibold font-raleway text-[#02272F] leading-8 tracking-wide">
                    {user?.username}
                </h3>
                <p className="truncate text-body-s text-[#FF7A59] font-medium tracking-wide">
                    member since {user?.created_at?.slice(0, 4)}
                </p>
            </div>
        </div>

      {/* NAVIGATION LINKS */}
        <nav>
            <ul className="flex flex-col space-y-7">
                {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            onClick={onClose}
                            className="text-body-m font-poppins font-medium text-gray-400 hover:text-primary-500 transition-colors tracking-wide block"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
        
        <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-body-m text-start cursor-pointer font-poppins font-medium text-gray-400 hover:text-primary-500 transition-colors tracking-wide block disabled:cursor-not-allowed disabled:opacity-60"
        >
            {isLoggingOut ? 'Logging out…' : 'Logout'}
        </button>

    </div>
  );
}
