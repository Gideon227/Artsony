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
    <main className="min-h-screen gap-x-[132px] w-full bg-white flex flex-col lg:flex-row overflow-x-hidden p-4 md:p-16">

      {/* Desktop: artwork grid */}
      <section className="hidden lg:block w-1/2 h-screen sticky top-16">
        <ForgotPasswordArtworkGrid />
      </section>

      {/* Mobile: hero */}
      <MobileAuthHero onBack={step === 1 ? () => router.back() : undefined} />

      {/* Form panel */}
      <section className="max-lg:absolute max-lg:h-[60vh] scrollbar-hide max-lg:left-4 max-lg:right-4 max-lg:bottom-6 relative z-10 flex-1 flex flex-col self-center items-center w-[calc(100vw_-_32px)]">
        <div className="w-full bg-white rounded-xl max-lg:overflow-y-auto scrollbar-hide lg:rounded-none flex flex-col justify-between h-full py-12 lg:py-0 px-6 lg:px-0">

          <div className="flex justify-center mb-12">
            <Image src="/icons/logo.svg" alt="ARTSONY" width={272} height={48} className="h-auto max-lg:w-[181px]" priority />
          </div>

          {/* Form Content / Steps */}
          <div className="w-full space-y-8 flex-1 flex flex-col justify-center lg:justify-start">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-raleway font-medium text-heading text-h6 lg:text-h4 tracking-wide leading-10 mb-8">
                  Forgot Password
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="Enter your email address"
                      disabled={isPending}
                      variant={errors.email ? 'error' : 'default'}
                      className="h-10 lg:h-12 rounded-full px-6 text-base"
                    />
                    {errors.email && (
                      <span className="text-sm text-error-600 pl-4">{errors.email.message}</span>
                    )}
                  </div>
                  <Button
                    fullWidth
                    disabled={isPending}
                    loadingText='Sending...'
                    className='mt-4 '
                  >
                    Reset Password
                  </Button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                <p className="font-poppins text-body text-body-m text-center mb-8 leading-relaxed">
                  Password reset verification link has been sent to {' '}
                  <span className="text-[#8AC5C7] break-all">{submittedEmail}</span>.
                  Click the link to reset your password. It expires in 15 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="w-full h-12 cursor-pointer group bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-full font-medium text-[15px] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-2 duration-300 ease-in-out" />
                  Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-6 text-sm font-poppins cursor-pointer text-body hover:text-primary-500 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            )}

            {/* Step indicator dots */}
            <div className="flex justify-center gap-2 mt-10">
              <div className={cn('h-2 rounded-full transition-all duration-300', step === 1 ? 'w-4 bg-primary-500' : 'w-2 bg-neutral-200')} />
              <div className={cn('h-2 rounded-full transition-all duration-300', step === 2 ? 'w-4 bg-primary-500' : 'w-2 bg-neutral-200')} />
              <div className={cn('h-2 rounded-full transition-all duration-300', step === 3 ? 'w-4 bg-primary-500' : 'w-2 bg-neutral-200')} />
            </div>
          </div>

          <AuthFooter />
        </div>
      </section>
    </main>
  )
}