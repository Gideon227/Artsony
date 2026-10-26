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
    <main className="min-h-screen max-lg:h-[100dvh] max-lg:overflow-hidden gap-x-[132px] w-full bg-white flex flex-col lg:flex-row overflow-x-hidden p-4 md:p-16">

      {/* Desktop: artwork grid */}
      <section className="hidden lg:block w-1/2 h-screen sticky top-16">
        <LoginArtworkGrid />
      </section>

      {/* Mobile: hero */}
      <MobileAuthHero onBack={() => router.back()} />

      {/* Form panel */}
      <section className="max-lg:absolute max-lg:h-fit scrollbar-hide max-lg:left-4 max-lg:right-4 max-lg:bottom-4 relative z-10 flex-1 flex flex-col self-center items-center w-[calc(100vw_-_32px)]">
        <div className="w-full bg-white rounded-xl lg:rounded-none flex flex-col lg:justify-between h-auto lg:h-full py-6 lg:py-0 px-4 lg:px-0">

          <div className="flex justify-center mb-4 lg:mb-12">
            <Image src="/icons/logo.svg" alt="ARTSONY" width={272} height={48} className="h-auto max-lg:w-[160px]" priority />
          </div>

          <div className="w-full space-y-4 lg:space-y- max-lg:mt-12">
            <h1 className="font-raleway font-medium text-heading text-h6 lg:text-h4 tracking-wide leading-tight lg:leading-10">
              Welcome Back
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3 lg:space-y-4">
              <div className="flex flex-col gap-1.5">
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="example@gmail.com"
                  disabled={isPending}
                  variant={errors.email ? 'error' : 'default'}
                  autoComplete="email"
                  className="h-12 rounded-full px-6 text-base"
                />
                {errors.email && (
                  <span className="text-sm text-error-600 pl-4">{errors.email.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5 max-lg:mb-6">
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  disabled={isPending}
                  variant={errors.password ? 'error' : 'default'}
                  autoComplete="current-password"
                  className="h-12 rounded-full px-6 text-base"
                />
                {errors.password && (
                  <span className="text-sm text-error-600 pl-4">{errors.password.message}</span>
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

            <div className="mt-6 lg:mt-4 flex justify-center items-center gap-x-1">
              <p className="text-xs lg:text-sm text-black leading-6 font-medium">Don&apos;t have an account?</p>
              <Link href="/signup" className="text-xs lg:text-sm text-primary-500 font-medium leading-6 hover:underline">
                Sign Up
              </Link>
            </div>
          </div>

          <div className="mt-4 lg:mt-10 text-center space-y-2 lg:space-y-4">
            <p className="font-poppins text-[14px] leading-6 text-black font-medium tracking-wide">Or sign in with</p>
            <div className="flex justify-center gap-4 lg:gap-6">
              {(['google', 'apple', 'facebook'] as const).map((provider) => (
                <a
                  key={provider}
                  href='/login/google'
                  className="w-9 h-9 lg:w-10 lg:h-10 rounded-full border border-secondary-400 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label={`Sign in with ${provider}`}
                >
                  <Image src={`/icons/${provider}.svg`} alt={provider} width={20} height={20} />
                </a>
              ))}
            </div>
            <Link href="/forgot-password" className="inline-block text-primary-500 font-medium text-sm hover:underline mt-2 lg:mt-4">
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