'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas/forgot-password.schema";
import { Input } from '@/components/ui/input'
import { ForgotPasswordArtworkGrid } from '@/features/auth/components/forgot-password-artwork-grid'
import { MobileAuthHero } from '@/features/auth/components/mobile-auth-hero'
import { useForgotPassword } from '@/hooks/use-auth-mutations'
import { cn } from '@/lib/utils'
import AuthFooter from '@/components/layout/auth-footer'
import { Button } from '@/components'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const { mutate: sendReset, isPending } = useForgotPassword()

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = (data: ForgotPasswordInput) => {
    setSubmittedEmail(data.email)
    sendReset(data, {
      onSuccess: () => setStep(2),
    })
  }

  return (
    <main className="relative w-full bg-white flex flex-col lg:flex-row overflow-x-hidden gap-x-[132px] p-4 lg:p-16 max-lg:h-dvh max-lg:overflow-hidden max-lg:overscroll-none lg:h-dvh lg:overflow-hidden">
      {/* Desktop: artwork grid */}
      <section className="hidden lg:block w-1/2 h-full min-h-0">
        <ForgotPasswordArtworkGrid />
      </section>

      {/* Mobile: hero fills the whole screen behind the form */}
      <div className="lg:hidden flex-1 min-h-0 overflow-hidden">
        <MobileAuthHero onBack={step === 1 ? () => router.back() : undefined} />
      </div>

      {/* Form panel */}
      <section className="max-lg:absolute max-lg:h-fit max-lg:left-4 max-lg:right-4 max-lg:bottom-4 max-lg:w-auto max-lg:max-h-[calc(100dvh-2rem)] lg:w-[calc(100vw_-_32px)] lg:h-full lg:min-h-0 scrollbar-hide relative z-10 flex-1 flex flex-col self-center items-center">        
        <button onClick={() => router.back()} className='hidden lg:flex shrink-0 cursor-pointer mb-18 w-full items-start justify-start'>          
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-inside-1_5252_973" fill="white">
              <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
            </mask>
            <path d="M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_5252_973)"/>
            <path d="M28 20H12M18 26L12 20L18 14" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round" stroke="#525965"/>
          </svg>
        </button>

        <div className="w-full bg-white rounded-xl max-lg:overflow-hidden lg:rounded-none flex flex-col lg:justify-between h-auto lg:h-full lg:min-h-0 py-5 lg:py-0 px-4 lg:px-0">
          <div className="flex justify-center mb-12 shrink-0">
            <Image src="/icons/logo.svg" alt="ARTSONY" width={272} height={48} className="h-auto max-lg:w-[182px]" priority />
          </div>

          {/* Form Content / Steps */}
          <div className="w-full space-y-4 lg:space-y-8 flex-1 flex flex-col justify-center lg:justify-start">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-raleway font-medium text-heading text-h6 lg:text-h4 tracking-wide leading-tight lg:leading-10 mb-4 lg:mb-8">
                  Forgot Password
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3 lg:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="Enter your email address"
                      disabled={isPending}
                      variant={errors.email ? 'error' : 'default'}
                      className="h-11 lg:h-12 rounded-full px-6 text-base"
                    />
                    {errors.email && (
                      <span className="text-xs lg:text-sm text-error-600 pl-4">{errors.email.message}</span>
                    )}
                  </div>
                  <Button
                    fullWidth
                    disabled={isPending}
                    loadingText='Sending...'
                    className='mt-2 lg:mt-4'
                  >
                    Reset Password
                  </Button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                <p className="font-poppins text-body text-body-m text-center mb-5 lg:mb-8 leading-relaxed">
                  Password reset verification link has been sent to {' '}
                  <span className="text-[#8AC5C7] break-all">{submittedEmail}</span>.
                  Click the link to reset your password. It expires in 15 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="w-full h-11 lg:h-12 cursor-pointer group bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-full font-medium text-[15px] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-2 duration-300 ease-in-out" />
                  Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-4 lg:mt-6 text-sm font-poppins cursor-pointer text-body hover:text-primary-500 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            )}

            {/* Step indicator dots */}
            <div className="flex justify-center gap-2 mt-4">
              <div className={cn('h-2 rounded-full transition-all duration-300', step === 1 ? 'w-4 bg-primary-500' : 'w-2 bg-neutral-200')} />
              <div className={cn('h-2 rounded-full transition-all duration-300', step === 2 ? 'w-4 bg-primary-500' : 'w-2 bg-neutral-200')} />
              {/* <div className={cn('h-2 rounded-full transition-all duration-300', step === 3 ? 'w-4 bg-primary-500' : 'w-2 bg-neutral-200')} /> */}
            </div>
          </div>

          <AuthFooter />
        </div>
      </section>
    </main>
  )
}