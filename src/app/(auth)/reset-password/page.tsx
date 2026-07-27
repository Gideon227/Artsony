'use client'

import React, { Suspense, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'

import { resetPasswordSchema, type ResetPasswordInput } from '@/features/auth/schemas/reset-password.schema'
import { Input } from '@/components/ui/input'
import { ForgotPasswordArtworkGrid } from '@/features/auth/components/forgot-password-artwork-grid'
import { MobileAuthHero } from '@/features/auth/components/mobile-auth-hero'
import { useResetPassword } from '@/hooks/use-auth-mutations'
import { cn } from '@/lib/utils'

function InvalidLinkPanel() {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
      <p className="text-neutral-600 mb-8 leading-relaxed">
        This password reset link is missing or malformed. Request a new one to continue.
      </p>
      <Link
        href="/forgot-password"
        className="w-full h-14 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-full font-medium text-lg transition-all flex items-center justify-center shadow-sm gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Request a New Link
      </Link>
    </div>
  )
}

function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const router = useRouter()
  const [step, setStep] = useState< 1 | 2 | 3 | 4 >(3)
  const { mutate: resetPassword, isPending } = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = (data: ResetPasswordInput) => {
    resetPassword(
      { token, email, newPassword: data.newPassword },
      { onSuccess: () => setStep(2) }
    )
  }

  return (
    <>
      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="font-raleway text-2xl lg:text-3xl font-medium text-neutral-900 mb-6 lg:mb-8 text-center lg:text-left">
            New Password
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <Input
                {...register('newPassword')}
                type="password"
                placeholder="New password"
                disabled={isPending}
                autoComplete="new-password"
                variant={touchedFields.newPassword && errors.newPassword ? 'error' : 'default'}
                className="h-14 rounded-full px-6 text-base"
              />
              {touchedFields.newPassword && errors.newPassword && (
                <span className="text-sm text-error-600 pl-4">{errors.newPassword.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="Re-enter password"
                disabled={isPending}
                autoComplete="new-password"
                variant={touchedFields.confirmPassword && errors.confirmPassword ? 'error' : 'default'}
                className="h-14 rounded-full px-6 text-base"
              />
              {touchedFields.confirmPassword && errors.confirmPassword && (
                <span className="text-sm text-error-600 pl-4">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-14 cursor-pointer bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-full font-medium text-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none shadow-sm"
            >
              {isPending
                ? <span className="flex items-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block" />Updating…</span>
                : 'Reset Password'
              }
            </button>
          </form>
        </div>
      )}

      {step === 4 && (
        <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
          <p className="text-neutral-600 mb-8 leading-relaxed">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full h-14 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-full font-medium text-lg transition-all flex items-center justify-center shadow-sm gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Sign In
          </button>
        </div>
      )}

      <div className="flex justify-center gap-2 mt-12 mb-10">
        <div className={cn('h-2 rounded-full transition-all duration-300', step === 1 ? 'w-6 bg-primary-500' : 'w-2 bg-neutral-200')} />
        <div className={cn('h-2 rounded-full transition-all duration-300', step === 2 ? 'w-6 bg-primary-500' : 'w-2 bg-neutral-200')} />
        <div className={cn('h-2 rounded-full transition-all duration-300', step === 3 ? 'w-6 bg-primary-500' : 'w-2 bg-neutral-200')} />
      </div>
    </>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const isValidLink = Boolean(token && email)

  return (
    <main className="min-h-screen w-full flex gap-x-[132px] bg-white relative overflow-hidden lg:p-16">

      {/* Mobile hero */}
      <MobileAuthHero onBack={() => router.back()} className="h-auto" />

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

              {isValidLink
                ? <ResetPasswordForm token={token!} email={email!} />
                : <InvalidLinkPanel />
              }

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  )
}