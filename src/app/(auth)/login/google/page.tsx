"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components"; 
import { ArtworkGrid } from "@/features/auth/components/artwork-grid";

export default function GoogleSignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Logic for Google OAuth redirect via Supabase/Backend
    // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    setTimeout(() => setIsLoading(false), 2000); // Simulate redirect
  };

  return (
    <main className="min-h-screen gap-x-[132px] w-full bg-white flex flex-col lg:flex-row overflow-x-hidden p-16">
      
      {/* =====================================================================
        LEFT: Variant Masonry (Desktop Only) - Wrapped exactly like SignUp
      ===================================================================== */}
      <section className="hidden lg:block w-1/2 max-h-screen sticky top-0">
        <ArtworkGrid />
      </section>

      {/* =====================================================================
        MOBILE HEADER: Artist Chip and Back Button (Exact match to SignUp)
      ===================================================================== */}
      <div className="lg:hidden absolute inset-0 h-[40vh] w-full z-0">
        <Image src="/images/mountain-lake-bg.jpg" alt="BG" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 p-6 flex justify-between items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white backdrop-blur-sm">
            <MoveLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
            <div className="w-6 h-6 rounded-full overflow-hidden relative">
              <Image src="/images/avatar-placeholder.png" alt="User" fill className="object-cover" />
            </div>
            <span className="text-white text-xs font-medium">Username</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
        RIGHT: Form Section
      ===================================================================== */}
      <section className="relative z-10 flex-1 flex flex-col items-center mt-[30vh] lg:mt-0">
        <div className="w-full bg-white rounded-t-[40px] lg:rounded-none flex flex-col justify-between h-full pt-12 lg:pt-0 px-6 lg:px-0">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-auto">
            <Image src="/icons/logo.svg" alt="ARTSONY" width={180} height={48} className="h-auto" />
          </div>

          <div className="w-full space-y-8 mt-12 lg:mt-0">
            <h4 className="font-raleway font-medium text-gray-500 text-[32px] tracking-wide leading-10">
              Welcome Back
            </h4>

            <div className="space-y-4">
              {/* Google Input Lookalike */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={cn(
                  "flex h-14 w-full items-center rounded-full border border-gray-50 bg-white px-6 py-3 transition-all duration-150",
                  "hover:border-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                  isLoading && "opacity-70 pointer-events-none"
                )}
              >
                <div className="flex items-center w-full">
                  <Image src="/icons/google.svg" alt="Google" width={24} height={24} />
                  <span className="flex-1 text-center text-sm font-medium text-neutral-800">
                    Continue with Google
                  </span>
                </div>
              </button>

              <Button
                onClick={handleGoogleLogin}
                isLoading={isLoading}
                loadingText="Authenticating"
                fullWidth
                className="cursor-pointer font-poppins font-medium text-[14px] leading-6 tracking-wide"
              >
                Step Into the Studio
              </Button>
            </div>
          </div>

          {/* Social Logins Alternate */}
          <div className="mt-10 text-center space-y-4">
            <p className="text-sm font-poppins font-medium text-black tracking-wide leading-6">
              Or sign in with
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/login" className="inline-block text-primary-500 font-medium text-sm hover:underline">
                Email and Password
              </Link>
            </div>
          </div>

          {/* Desktop Footer (Exact match to SignUp) */}
          <footer className="hidden font-poppins lg:flex mt-auto pt-10 gap-6 text-[14px] font-medium tracking-wide text-gray-400">
            <Link href='/privacy' className="p-2 text-nowrap">Privacy</Link>
            <Link href='/terms' className="p-2 text-nowrap">Terms & Conditions</Link>
            <Link href='/faq' className="p-2 text-nowrap">FAQ</Link>
            <Link href='/about' className="p-2 text-nowrap">About</Link>
            <Link href='/' className="p-2 text-nowrap">Language</Link>
          </footer>
        </div>
      </section>
    </main>
  );
}