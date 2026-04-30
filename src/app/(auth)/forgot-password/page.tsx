"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas/forgot-password.schema";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"; // Adjust path to your Input component
import { ForgotPasswordArtworkGrid } from "@/features/auth/components/forgot-password-artwork-grid";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    // Simulated API call for password reset
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmittedEmail(data.email);
    setStep(2);
  };

  return (
    <main className="min-h-screen w-full flex gap-x-[132px] bg-white relative overflow-hidden lg:p-16">
      
      {/* =====================================================================
        MOBILE BACKGROUND & HEADER
        ===================================================================== */}
      <div className="absolute inset-0 z-0 lg:hidden">
        {/* Dynamic background based on step to match your designs */}
        <Image
          src={step === 1 ? "/images/mobile-bg-classic.jpg" : "/images/mobile-bg-statue.jpg"} 
          alt="Artsony background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          {step === 1 ? (
            <button 
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full border border-white flex items-center justify-center text-white backdrop-blur-sm transition-transform active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div /> // Placeholder to keep the user pill aligned right if no back button
          )}
          
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full pr-4 pl-1 py-1">
            <div className="h-8 w-8 rounded-full bg-indigo-500 overflow-hidden flex-shrink-0">
               <Image src="/images/avatar-placeholder.png" alt="User" width={32} height={32} />
            </div>
            <span className="text-white text-sm font-medium">Username</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
        DESKTOP MASONRY HERO (Left Panel)
        ===================================================================== */}
      <section className="hidden lg:block w-1/2 h-[calc(100vh-128px)] sticky top-16">
        <ForgotPasswordArtworkGrid />
      </section>

      {/* =====================================================================
        FORM CONTAINER (Right Panel / Mobile Bottom Sheet)
        ===================================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col justify-end lg:justify-center lg:items-center z-10 bg-white">
        <div className="rounded-t-[2.5rem] lg:rounded-none w-full min-h-[50vh] lg:h-auto lg:min-h-screen py-10 lg:py-16 flex flex-col items-center shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-none overflow-y-auto">
          
          <div className="w-full min-w-[420px] flex flex-col relative h-full flex-1">
            <div className="flex-1 flex flex-col justify-center">
              
              <div className="flex justify-center mb-10 lg:mb-20">
                <Image src="/icons/logo.svg" alt="Artsony" width={160} height={40} priority />
              </div>

              {/* STEP 1: Enter Email */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="font-raleway text-2xl lg:text-3xl font-medium text-neutral-900 mb-6 lg:mb-8 text-center lg:text-left">
                    Forgot Password
                  </h1>

                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    
                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                        <Input
                            {...register("email")}
                            type="email"
                            placeholder="Enter Email Address"
                            disabled={isSubmitting}
                            variant={errors.email ? "error" : "default"}
                            className="h-14 rounded-full px-6 text-base focus-visible:ring-[#F15A2B]/20 focus-visible:border-[#F15A2B]"
                        />
                        {errors.email && <span className="text-sm text-red-500 pl-4">{errors.email.message}</span>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 mt-2 cursor-pointer bg-[#F15A2B] hover:bg-[#d94f24] active:scale-[0.98] text-white rounded-full font-medium text-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none shadow-sm"
                    >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin h-6 w-6" />
                        ) : (
                          "Reset Password"
                        )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 2: Success Message */}
              {step === 2 && (
                <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                  <p className="text-neutral-600 mb-8 leading-relaxed">
                    Password reset verification link has been sent to{" "}
                    <span className="text-primary-500 cursor-pointer hover:underline hover:underline-primary-500 transition  break-all">{submittedEmail}</span>
                    , click the link to reset password.
                  </p>

                  <button
                      onClick={() => router.push('/login')}
                      className="w-full h-14 bg-[#F15A2B] hover:bg-[#d94f24] active:scale-[0.98] text-white rounded-full font-medium text-lg transition-all flex items-center justify-center shadow-sm gap-2"
                  >
                      <ArrowLeft className="h-5 w-5" />
                      Back to Sign In
                  </button>
                </div>
              )}

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-12 mb-10">
                <div className={cn("h-2 rounded-full transition-all duration-300", step === 1 ? "w-6 bg-[#F15A2B]" : "w-2 bg-neutral-200")} />
                <div className={cn("h-2 rounded-full transition-all duration-300", step === 2 ? "w-6 bg-[#F15A2B]" : "w-2 bg-neutral-200")} />
              </div>

              {/* Desktop Footer Links */}
              <div className="hidden lg:flex mt-10 justify-center gap-6 text-sm text-neutral-500 font-medium pb-8 lg:pb-0">
                  <Link href="/privacy" className="hover:text-neutral-800 transition-colors">Privacy</Link>
                  <Link href="/terms" className="hover:text-neutral-800 transition-colors">Terms & Conditions</Link>
                  <Link href="/faq" className="hover:text-neutral-800 transition-colors">FAQ</Link>
                  <Link href="/about" className="hover:text-neutral-800 transition-colors">About</Link>
                  <button className="hover:text-neutral-800 transition-colors">Language</button>
              </div>

            </div> 

          </div>
        </div>
      </div>
    </main>
  );
}