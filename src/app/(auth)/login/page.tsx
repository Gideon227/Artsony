'use client'

import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '@/components/ui/input'
import { LoginArtworkGrid } from '@/features/auth/components/login-artwork-grid'
import { MobileAuthHero } from '@/features/auth/components/mobile-auth-hero'
import { useLogin } from '@/hooks/use-auth-mutations'
import { loginSchema, type LoginInput } from "@/features/auth/schemas/login.schema";
import AuthFooter from '@/components/layout/auth-footer'
import { Button } from '@/components'

function LoginContent() {
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
    <main className="relative w-full bg-white flex flex-col lg:flex-row overflow-x-hidden gap-x-[132px] p-4 lg:p-16 max-lg:h-dvh max-lg:overflow-hidden max-lg:overscroll-none lg:min-h-screen">

      {/* Desktop: artwork grid */}
      <section className="hidden lg:block w-1/2 h-screen sticky top-16">
        <LoginArtworkGrid />
      </section>

      {/* Mobile: hero fills the whole screen behind the form */}
      <div className="lg:hidden flex-1 min-h-0 overflow-hidden">
        <MobileAuthHero onBack={() => router.back()} />
      </div>

      {/* Form panel */}
      <section className="max-lg:absolute max-lg:left-4 max-lg:right-4 max-lg:bottom-4 max-lg:w-auto max-lg:max-h-[calc(100dvh-2rem)] lg:w-[calc(100vw_-_32px)] relative z-10 flex-1 flex flex-col self-center items-center">
        <div className="w-full bg-white rounded-xl lg:rounded-none flex flex-col lg:justify-between h-auto lg:h-full py-4 lg:py-0 px-4 lg:px-0 max-lg:overflow-hidden">

          <div className="flex justify-center mb-12">
            <Image src="/icons/logo.svg" alt="ARTSONY" width={272} height={48} className="h-auto max-lg:w-[130px]" priority />
          </div>

          <div className="w-full space-y-3 lg:space-y-4 max-lg:mt-2">
            <h1 className="font-raleway font-medium text-heading text-h6 lg:text-h4 tracking-wide leading-tight lg:leading-10">
              Welcome Back
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2.5 lg:space-y-4">
              <div className="flex flex-col gap-1">
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="example@gmail.com"
                  disabled={isPending}
                  variant={errors.email ? 'error' : 'default'}
                  autoComplete="email"
                  className="h-11 lg:h-12 rounded-full px-6 text-base"
                />
                {errors.email && (
                  <span className="text-xs lg:text-sm text-error-600 pl-4">{errors.email.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1 max-lg:mb-3">
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  disabled={isPending}
                  variant={errors.password ? 'error' : 'default'}
                  autoComplete="current-password"
                  className="h-11 lg:h-12 rounded-full px-6 text-base"
                />
                {errors.password && (
                  <span className="text-xs lg:text-sm text-error-600 pl-4">{errors.password.message}</span>
                )}
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isPending}
                loadingText="Signing in…"
                className="cursor-pointer font-poppins font-medium text-[14px] leading-6 tracking-wide rounded-full"
              >
                Step Into the Studio
              </Button>
            </form>

            <div className="mt-3 lg:mt-4 flex justify-center items-center gap-x-1">
              <p className="text-xs lg:text-sm text-black leading-6 font-medium">Don&apos;t have an account?</p>
              <Link href="/signup" className="text-xs lg:text-sm text-primary-500 font-medium leading-6 hover:underline">
                Sign Up
              </Link>
            </div>
          </div>

          <div className="mt-6 lg:mt-10 text-center space-y-2 lg:space-y-4">
            <p className="font-poppins text-xs lg:text-[14px] leading-6 text-black font-medium tracking-wide">Or sign in with</p>
            <div className="flex justify-center gap-4 lg:gap-6">
              {(['google', 'apple', 'facebook'] as const).map((provider) => (
                <a
                  key={provider}
                  href="/login/google"
                  className="w-9 h-9 lg:w-10 lg:h-10 rounded-full border border-secondary-400 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label={`Sign in with ${provider}`}
                >
                  <Image src={`/icons/${provider}.svg`} alt={provider} width={20} height={20} />
                </a>
              ))}
            </div>
            <Link href="/forgot-password" className="inline-block text-primary-500 font-medium text-sm hover:underline lg:mt-4">
              Forgot Password? Reset
            </Link>
          </div>

          <AuthFooter />
        </div>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white w-full" />}>
      <LoginContent />
    </Suspense>
  )
}