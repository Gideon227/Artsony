'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { z } from 'zod'

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas/forgot-password.schema";
import { Input } from '@/components/ui/input'
import { ForgotPasswordArtworkGrid } from '@/features/auth/components/forgot-password-artwork-grid'
import { useForgotPassword } from '@/hooks/use-auth-mutations'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
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
    <main className="min-h-screen w-full flex gap-x-[132px] bg-white relative overflow-hidden lg:p-16">

      {/* Mobile background */}
      <div className="absolute inset-0 z-0 lg:hidden">
        <Image
          src={step === 1 ? '/images/mobile-bg-classic.jpg' : '/images/mobile-bg-statue.jpg'}
          alt="Artsony background"
          fill priority className="object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          {step === 1 && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="h-10 w-10 rounded-full border border-white flex items-center justify-center text-white backdrop-blur-sm active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="ml-auto flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full pr-4 pl-1 py-1">
            <div className="h-8 w-8 rounded-full bg-neutral-400 overflow-hidden flex-shrink-0" />
            <span className="text-white text-sm font-medium">Artist</span>
          </div>
        </div>
      </div>

      {/* Desktop artwork grid */}
      <section className="hidden lg:block w-1/2 h-[calc(100vh-128px)] sticky top-16">
        <ForgotPasswordArtworkGrid />
      </section>

      {/* Form panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-end lg:justify-center lg:items-center z-10 bg-white">
        <div className="rounded-t-[2.5rem] lg:rounded-none w-full min-h-[50vh] lg:min-h-screen py-10 lg:py-16 flex flex-col items-center shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-none overflow-y-auto">
          <div className="w-full min-w-[420px] flex flex-col relative h-full flex-1">
            <div className="flex-1 flex flex-col justify-center">

              <div className="flex justify-center mb-10 lg:mb-20">
                <Image src="/icons/logo.svg" alt="Artsony" width={160} height={40} priority />
              </div>

              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="font-raleway text-2xl lg:text-3xl font-medium text-neutral-900 mb-6 lg:mb-8 text-center lg:text-left">
                    Forgot Password
                  </h1>
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5">
                      <Input
                        {...register('email')}
                        type="email"
                        placeholder="Enter your email address"
                        disabled={isPending}
                        variant={errors.email ? 'error' : 'default'}
                        className="h-14 rounded-full px-6 text-base"
                      />
                      {errors.email && (
                        <span className="text-sm text-error-600 pl-4">{errors.email.message}</span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-14 cursor-pointer bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-full font-medium text-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none shadow-sm"
                    >
                      {isPending
                        ? <span className="flex items-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block" />Sending…</span>
                        : 'Reset Password'
                      }
                    </button>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                  <p className="text-neutral-600 mb-8 leading-relaxed">
                    A password reset link has been sent to{' '}
                    <span className="text-primary-500 font-medium break-all">{submittedEmail}</span>.
                    Click the link in your email to reset your password. It expires in 15 minutes.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="w-full h-14 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-full font-medium text-lg transition-all flex items-center justify-center shadow-sm gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-4 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    Use a different email
                  </button>
                </div>
              )}

              {/* Step indicator dots */}
              <div className="flex justify-center gap-2 mt-12 mb-10">
                <div className={cn('h-2 rounded-full transition-all duration-300', step === 1 ? 'w-6 bg-primary-500' : 'w-2 bg-neutral-200')} />
                <div className={cn('h-2 rounded-full transition-all duration-300', step === 2 ? 'w-6 bg-primary-500' : 'w-2 bg-neutral-200')} />
              </div>

              <div className="hidden lg:flex mt-10 justify-center gap-6 text-sm text-neutral-500 font-medium">
                {[['Privacy', '/privacy'], ['Terms & Conditions', '/terms'], ['FAQ', '/faq'], ['About', '/about']].map(([label, href]) => (
                  <Link key={label} href={href!} className="hover:text-neutral-800 transition-colors">{label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}