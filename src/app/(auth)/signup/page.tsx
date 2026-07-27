'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button, Checkbox } from '@/components'
import { ArtworkGrid } from '@/features/auth/components/artwork-grid'
import { MobileAuthHero } from '@/features/auth/components/mobile-auth-hero'
import { useRegister } from '@/hooks/use-auth-mutations'
import { signUpSchema, type SignUpInput } from '@/features/auth/schemas/signup.schema'
import { cn } from '@/lib/utils'

const OAUTH_PROVIDERS = ['google', 'apple', 'facebook'] as const
const OAUTH_LABELS: Record<(typeof OAUTH_PROVIDERS)[number], string> = {
  google: 'Sign up with Google',
  apple: 'Sign up with Apple ID',
  facebook: 'Sign up with Facebook',
}
const OAUTH_ICONS: Record<(typeof OAUTH_PROVIDERS)[number], string> = {
  google: '/socials/google.svg',
  apple: '/socials/apple.svg',
  facebook: '/socials/facebook-blue.svg'
}


export default function SignUpPage() {
  const { mutate: registerUser, isPending } = useRegister()

  // Mobile only — desktop always shows the full form, no step split.
  const [mobileStep, setMobileStep] = useState<'choose' | 'form'>('choose')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, touchedFields },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      termsAccepted: false,
    },
  })

  const onSubmit = (data: SignUpInput) => {
    registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
    })
  }

  return (
    <main className="min-h-screen gap-x-[132px] w-full bg-white flex flex-col lg:flex-row overflow-x-hidden p-4 md:p-16">

      {/* Desktop: artwork grid */}
      <section className="hidden lg:block w-1/2 min-h-screen sticky top-0">
        <ArtworkGrid />
      </section>

      <MobileAuthHero onBack={mobileStep === 'form' ? () => setMobileStep('choose') : undefined} />

      {/* Form panel */}
      <section style={{ bottom: 23 }} className="max-lg:absolute relative z-10 flex-1 flex flex-col items-center mt-[45vh] lg:mt-0">
        <div className="w-full bg-white rounded-xl lg:rounded-none flex flex-col justify-between h-full py-12 lg:py-0 px-6 lg:px-0">

          <div className="flex justify-center" style={{ marginBottom: 48 }}>
            <Image src="/icons/logo.svg" alt="ARTSONY" width={180} height={48} className="h-auto" priority />
          </div>

          {/* MOBILE — step 1: choose sign up method */}
          <div className={cn('lg:hidden w-full space-y-8', mobileStep !== 'choose' && 'hidden')}>
            <p className="text-center text-sm text-neutral-500 font-poppins px-2">
              Welcome to Artsony , please choose a sign up option
            </p>
            <div className="space-y-4">
              {OAUTH_PROVIDERS.map((provider) => (
                <a
                  key={provider}
                  href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/${provider}`}
                  className="w-full h-12 rounded-2xl border border-gray-50 flex items-center justify-start gap-3 py-3 px-6 hover:bg-gray-50 transition-colors"
                >
                  <Image src={OAUTH_ICONS[provider]} alt="" width={20} height={20} />
                  <span className="text-xs font-poppins text-text-disabled text-center leading-4 flex-1 w-full">{OAUTH_LABELS[provider]}</span>
                </a>
              ))}
              <button
                type="button"
                onClick={() => setMobileStep('form')}
                className="w-full h-12 rounded-2xl border border-gray-50 flex items-center justify-start gap-3 py-3 px-6 hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-5 h-5 text-neutral-700" />
                <span className="text-xs font-poppins text-text-disabled text-center leading-4 flex-1 w-full">Sign up with Email & Password</span>
              </button>
            </div>
          </div>

          {/* Step 2 (mobile) / always (desktop): email & password form */}
          <div className={cn('w-full space-y-6', mobileStep !== 'form' && 'hidden lg:block')}>
            <h1 className="font-raleway font-medium text-gray-500 text-[32px] tracking-wide leading-10">
              Hello
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

              <div>
                <Input
                  {...register('username')}
                  placeholder="Username (e.g. leggyman)"
                  disabled={isPending}
                  autoCapitalize="none"
                  variant={touchedFields.username && errors.username ? 'error' : 'default'}
                />
                {touchedFields.username && errors.username && (
                  <p className="mt-1 pl-4 text-sm text-error-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="example@gmail.com"
                  disabled={isPending}
                  variant={touchedFields.email && errors.email ? 'error' : 'default'}
                />
                {touchedFields.email && errors.email && (
                  <p className="mt-1 pl-4 text-sm text-error-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  disabled={isPending}
                  variant={touchedFields.password && errors.password ? 'error' : 'default'}
                />
                {touchedFields.password && errors.password && (
                  <p className="mt-1 pl-4 text-sm text-error-600">{errors.password.message}</p>
                )}
              </div>

              {/* Checkbox via Controller so RHF gets the boolean value correctly */}
              <div className="flex items-start gap-3 pt-1">
                <Controller
                  name="termsAccepted"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="termsAccepted"
                      disabled={isPending}
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <div>
                  <label
                    htmlFor="termsAccepted"
                    className="text-sm text-neutral-500 cursor-pointer"
                  >
                    I hereby agree to Artsony&apos;s{' '}
                    <Link href="/terms" className="font-semibold text-neutral-700 hover:underline">
                      terms and conditions
                    </Link>
                    .
                  </label>
                  {errors.termsAccepted && (
                    <p className="mt-0.5 text-xs text-error-600">{errors.termsAccepted.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isPending}
                loadingText="Setting up your account…"
                className="cursor-pointer font-poppins font-medium text-[14px] leading-6 tracking-wide h-14 rounded-full"
              >
                Let&apos;s have fun!
              </Button>
            </form>

            <p className="text-[14px] text-center font-poppins text-gray-500 tracking-wide">
              Have an account?{' '}
              <Link href="/login" className="text-primary-500 hover:underline">
                Log in now
              </Link>
            </p>

            {/* Mobile only — desktop gets its own forgot-password link below,
                alongside the OAuth icon row */}
            <Link
              href="/forgot-password"
              className="lg:hidden block text-center text-primary-500 font-medium text-sm hover:underline"
            >
              Forgot Password? Reset
            </Link>
          </div>

          {/* Desktop only — mobile handles OAuth as full-width buttons in step 1 */}
          <div className="hidden lg:block mt-10 text-center space-y-4">
            <p className="text-sm font-poppins font-medium text-black tracking-wide leading-6">
              Or signup with
            </p>
            <div className="flex justify-center gap-6">
              {OAUTH_PROVIDERS.map((provider) => (
                <a
                  key={provider}
                  href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/${provider}`}
                  className="w-10 h-10 rounded-full border border-secondary-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label={`Sign up with ${provider}`}
                >
                  <Image src={`/icons/${provider}.svg`} alt={provider} width={24} height={24} />
                </a>
              ))}
            </div>
            <Link
              href="/forgot-password"
              className="inline-block text-primary-500 font-medium text-sm hover:underline"
            >
              Forgot Password? Reset
            </Link>
          </div>

          <footer className="hidden font-poppins lg:flex lg:justify-center mt-10 gap-6 text-[14px] font-medium tracking-wide text-gray-400">
            {['Privacy', 'Terms & Conditions', 'FAQ', 'About'].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                className="p-2 text-nowrap hover:text-neutral-700 transition-colors"
              >
                {label}
              </Link>
            ))}
            <button
              type="button"
              className="p-2 text-nowrap hover:text-neutral-700 transition-colors"
            >
              Language
            </button>
          </footer>
        </div>
      </section>
    </main>
  )
}