"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/google`
    setTimeout(() => setIsLoading(false), 2000); // Simulate redirect
  };

  return (
    // Mobile: full-bleed photo with a floating card pinned to the bottom.
    // Desktop (lg+): two-column layout with the artwork grid on the left.
    <main className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-white lg:flex-row lg:gap-x-[132px] lg:p-16">

      {/* =====================================================================
        LEFT: Variant Masonry (Desktop Only) - Wrapped exactly like SignUp
      ===================================================================== */}
      <section className="hidden lg:block w-1/2 max-h-screen sticky top-0">
        <ArtworkGrid />
      </section>

      {/* =====================================================================
        MOBILE: full-screen backdrop + top bar (back button and artist chip)
      ===================================================================== */}
      <div aria-hidden="true" className="absolute inset-0 lg:hidden">
        <Image src="/images/mountain-lake-bg.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] lg:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/60 text-white"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-x-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white">
            <Image src="/images/avatar-placeholder.png" alt="" fill className="object-cover" />
          </div>
          <span className="font-poppins text-sm font-medium tracking-wide text-white">Username</span>
        </div>
      </header>

      {/* =====================================================================
        RIGHT: Form Section (floating card on mobile, plain column on desktop)
      ===================================================================== */}
      <section className="relative z-10 mt-auto flex w-full flex-col px-4 pb-[max(2.25rem,env(safe-area-inset-bottom))] lg:mt-0 lg:flex-1 lg:items-center lg:px-0 lg:pb-0">
        <div className="flex w-full flex-col rounded-[32px] bg-white px-4 pb-6 pt-7 lg:h-full lg:justify-between lg:rounded-none lg:p-0">

          {/* Logo Section */}
          <div className="flex justify-center lg:mb-auto">
            <Image src="/icons/logo.svg" alt="ARTSONY" width={180} height={48} className="h-auto" />
          </div>

          <div className="mt-10 w-full space-y-6 lg:mt-0 lg:space-y-8">
            <h4 className="font-raleway text-2xl font-medium leading-8 tracking-wide text-gray-500 lg:text-[32px] lg:leading-10">
              Welcome Back
            </h4>

            <div className="space-y-4">
              {/* Google Input Lookalike */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={cn(
                  "flex h-12 w-full items-center rounded-full border border-gray-50 bg-white px-6 py-3 transition-all duration-150 lg:h-14",
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
          <div className="mt-6 space-y-2 text-center lg:mt-10 lg:space-y-4">
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