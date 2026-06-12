'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MoveLeft } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button, Checkbox } from '@/components'
import { ArtworkGrid } from '@/features/auth/components/artwork-grid'
import { useRegister } from '@/hooks/use-auth-mutations'
import { signUpSchema, type SignUpInput } from '@/features/auth/schemas/signup.schema'

export default function SignUpPage() {
  const router = useRouter()
  const { mutate: registerUser, isPending } = useRegister()

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
    <main className="min-h-screen gap-x-[132px] w-full bg-white flex flex-col lg:flex-row overflow-x-hidden p-16">

      {/* Desktop: artwork grid */}
      <section className="hidden lg:block w-1/2 min-h-screen sticky top-0">
        <ArtworkGrid />
      </section>

      {/* Mobile: background image */}
      <div className="lg:hidden absolute inset-0 h-[40vh] w-full z-0">
        <Image src="/images/mobile-bg-grunge.jpg" alt="BG" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 p-6 flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white backdrop-blur-sm"
          >
            <MoveLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
            <div className="w-6 h-6 rounded-full overflow-hidden relative bg-neutral-300" />
            <span className="text-white text-xs font-medium">Artist</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <section className="relative z-10 flex-1 flex flex-col items-center">
        <div className="w-full h-full flex-1 bg-white rounded-t-[40px] lg:rounded-none flex flex-col justify-between">

          <div className="flex justify-center mb-auto">
            <Image src="/icons/logo.svg" alt="ARTSONY" width={180} height={48} className="h-auto" priority />
          </div>

          <div className="w-full space-y-6">
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
          </div>

          <div className="mt-10 text-center space-y-4">
            <p className="text-sm font-poppins font-medium text-black tracking-wide leading-6">
              Or signup with
            </p>
            <div className="flex justify-center gap-6">
              {(['google', 'apple', 'facebook'] as const).map((provider) => (
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