'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Input } from '@/components/ui/input'
import { LoginArtworkGrid } from '@/features/auth/components/login-artwork-grid'
import { MobileAuthHero } from '@/features/auth/components/mobile-auth-hero'
import { useLogin } from '@/hooks/use-auth-mutations'
import { loginSchema, type LoginInput } from "@/features/auth/schemas/login.schema";


export default function LoginPage() {
  const router = useRouter()
  const { mutate: login, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: LoginInput) => login(data)

  return (
    <main className="min-h-screen gap-x-[132px] w-full bg-white flex flex-col lg:flex-row overflow-x-hidden p-4 md:p-16">

      {/* Desktop: artwork grid */}
      <section className="hidden lg:block w-1/2 h-screen sticky top-16">
        <LoginArtworkGrid />
      </section>

      {/* Mobile: hero */}
      <MobileAuthHero onBack={() => router.back()} />

      {/* Form panel */}
      <section className="max-lg:absolute max-lg:left-4 max-lg:bottom-6 relative z-10 flex-1 flex flex-col items-center mt-[30vh] lg:mt-0">
        <div className="w-full bg-white rounded-xl lg:rounded-none flex flex-col justify-between h-full py-12 lg:py-0 px-6 lg:px-0">

          <div style={{ marginBottom: 80 }} className="flex justify-center mb-20">
            <Image src="/icons/logo.svg" alt="Artsony" width={180} height={48} className="h-auto" priority />
          </div>

          <div className="w-full space-y-8 mt-12 lg:mt-0">
            <h1 className="font-raleway font-medium text-gray-500 text-[32px] tracking-wide leading-10">
              Welcome Back
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="example@gmail.com"
                  disabled={isPending}
                  variant={errors.email ? 'error' : 'default'}
                  autoComplete="email"
                  className="h-[52px] rounded-full px-6 text-base"
                />
                {errors.email && (
                  <span className="text-sm text-error-600 pl-4">{errors.email.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  disabled={isPending}
                  variant={errors.password ? 'error' : 'default'}
                  autoComplete="current-password"
                  className="h-[52px] rounded-full px-6 text-base"
                />
                {errors.password && (
                  <span className="text-sm text-error-600 pl-4">{errors.password.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-[52px] cursor-pointer mt-4 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-full font-medium text-[15px] transition-all flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none"
              >
                {isPending
                  ? <span className="flex items-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block" />Signing in…</span>
                  : 'Step Into the Studio'
                }
              </button>
            </form>

            <div className="mt-4 flex justify-center items-center gap-x-1">
              <p className="text-[14px] text-black leading-6 font-medium">Don&apos;t have an account?</p>
              <Link href="/signup" className="text-[14px] text-primary-500 font-medium leading-6 hover:underline">
                Sign Up
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center space-y-4">
            <p className="font-poppins text-[14px] leading-6 text-black font-medium tracking-wide">Or sign in with</p>
            <div className="flex justify-center gap-6">
              {(['google', 'apple', 'facebook'] as const).map((provider) => (
                <a
                  key={provider}
                  // href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/${provider}`}
                  href='/login/google'
                  className="w-10 h-10 rounded-full border border-secondary-400 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label={`Sign in with ${provider}`}
                >
                  <Image src={`/icons/${provider}.svg`} alt={provider} width={24} height={24} />
                </a>
              ))}
            </div>
            <Link href="/forgot-password" className="inline-block text-primary-500 font-medium text-sm hover:underline mt-4">
              Forgot Password? Reset
            </Link>
          </div>

          <footer className="hidden font-poppins lg:flex mt-auto pt-10 gap-6 text-[14px] font-medium tracking-wide text-gray-400">
            {[['Privacy', '/privacy'], ['Terms & Conditions', '/terms'], ['FAQ', '/faq'], ['About', '/about']].map(([label, href]) => (
              <Link key={label} href={href!} className="p-2 text-nowrap hover:text-neutral-700 transition-colors">{label}</Link>
            ))}
            <button type="button" className="p-2 text-nowrap hover:text-neutral-700 transition-colors">Language</button>
          </footer>
        </div>
      </section>
    </main>
  )
}