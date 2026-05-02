"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, MoveLeft, Loader2 } from "lucide-react";

import { loginSchema, type LoginInput } from "@/features/auth/schemas/login.schema";
import { cn } from "@/lib/utils";
import { LoginArtworkGrid } from "@/features/auth/components/login-artwork-grid";
import { useLogin } from '@/hooks/use-auth-mutations'
import { Button, Input } from "@/components";

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin()
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => login(data)

  return (
    <main className="min-h-screen gap-x-[132px] w-full bg-white flex flex-col lg:flex-row overflow-x-hidden p-16">
      
      {/* Artwork Grid (Desktop Only) */}
      <section className="hidden lg:block w-1/2 h-screen sticky top-16">
        <LoginArtworkGrid />
      </section>

      {/*  MOBILE BACKGROUND & HEADER (Hidden on Desktop) */}
      <div className="lg:hidden absolute inset-0 h-[40vh] w-full z-0">
        <Image
          src="/images/mobile-login-bg.jpg"
          alt="Artsony scenery"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 p-6 flex justify-between items-center">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white backdrop-blur-sm"
          >
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
            <Image src="/icons/logo.svg" alt="Artsony" width={180} height={48} className="h-auto" priority />
          </div>

          <div className="w-full space-y-8 mt-12 lg:mt-0">
            <h4 className="font-raleway font-medium text-gray-500 text-[32px] tracking-wide leading-10">
              Welcome Back
            </h4>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="forexample@gmail.com"
                  disabled={isPending}
                  variant={errors.email ? 'error' : 'default'}
                  autoComplete="email"
                  className="h-13 rounded-full px-6 text-base"
                />
                {errors.email && <span className="text-sm text-error-500 pl-4">{errors.email.message}</span>}
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="Password"
                  disabled={isPending}
                  variant={errors.password ? 'error' : 'default'}
                  autoComplete="current-password"
                  className="h-[52px] rounded-full px-6 text-base"
                />

                  {/* <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button> */}
                {errors.password && <span className="text-sm text-error-500 pl-4">{errors.password.message}</span>}
              </div>

              {/* Submit Button */}
              {/* <button
                type="submit"
                disabled={isPending}
                className="w-full h-[52px] mt-4 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-full font-medium text-[15px] transition-all flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Step Into the Studio"
                )}
              </button> */}

              <Button 
                type="submit"
                isLoading={isPending}
                loadingText="Signing in..."
              >
                Step Into the studio
              </Button>
            </form>

            <div className="mt-4 flex justify-center items-center gap-x-1">
              <p className="text-[14px] text-black leading-6 font-medium">Don&apos;t have an account?</p>
              <Link href='/signup' className="text-[14px] text-primary-500 font-medium leading-6 hover:underline">Sign Up</Link>
            </div>
          </div>

          {/* Social Auth & Alternate Flows */}
          <div className="mt-10 text-center space-y-4">
            <p className="font-poppins text-[14px] leading-6 text-black font-medium tracking-wide">Or sign in with</p>
            
            <div className="flex justify-center gap-6">
              {['google', 'apple', 'facebook'].map((provider) => (
                <Link key={provider} href={`/login/${provider}`} className="w-10 h-10 rounded-full border border-[#8AC5C7] flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Image src={`/icons/${provider}.svg`} alt={provider} width={24} height={24} />
                </Link>
              ))}
            </div>

            <Link href="/forgot-password" className="inline-block text-primary-500 font-medium text-sm hover:underline mt-4">
              Forgot Password? Reset
            </Link>
          </div>

          {/* Desktop Footer Links */}
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