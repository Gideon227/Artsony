"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveLeft } from "lucide-react";

import { signUpSchema, type SignUpInput } from "@/features/auth/schemas/signup.schema";
import { Input } from "@/components/ui/input";
import { ArtworkGrid } from "@/features/auth/components/artwork-grid";
import { Button, Checkbox } from "@/components";
import { useRegister } from '@/hooks/use-auth-mutations'

export default function SignUpPage() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister()

  const { register: field, handleSubmit, formState: { errors, isSubmitting, touchedFields } } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    register({
      displayName: data.username ?? data.email,
      username: data.username,
      email: data.email,
      password: data.password,
    })
  };

  return (
    <main className="min-h-screen gap-x-[132px] w-full bg-white flex flex-col lg:flex-row overflow-x-hidden p-16">
      
      {/* LEFT: Artwork Grid (Desktop Only) */}
      <section className="hidden lg:block w-1/2 min-h-screen sticky top-0">
        <ArtworkGrid />
      </section>

      {/* MOBILE HEADER: Artist Chip and Back Button */}
      <div className="lg:hidden absolute inset-0 h-[40vh] w-full z-0">
        <Image src="/images/mobile-bg-grunge.jpg" alt="BG" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 p-6 flex justify-between items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white backdrop-blur-sm">
            <MoveLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
            <div className="w-6 h-6 rounded-full overflow-hidden relative">
              <Image src="/images/image-avatar.svg" alt="User" fill className="object-cover" />
            </div>
            <span className="text-white text-xs font-medium">Username</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Form Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center">
        <div className="w-full h-full flex-1 bg-white rounded-t-[40px] lg:rounded-none flex flex-col justify-between">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-auto">
            <Image src="/icons/logo.svg" alt="ARTSONY" width={180} height={48} className="h-auto" />
          </div>

          <div className="w-full space-y-8">
            <h4 className="font-raleway font-medium text-gray-500 text-[32px] tracking-wide leading-10">Hello</h4>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <Input
                  {...field('username')}
                  placeholder="Leggyman"
                  disabled={isPending}
                  variant={touchedFields.username && errors.username ? 'error' : 'default'}
                />
                {touchedFields.username && errors.username && (
                  <p className="mt-1 pl-4 text-[12px] text-error-500 font-poppins">{errors.username?.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...field("email")}
                  placeholder="forexample@gmail.com"
                  disabled={isPending}
                  variant={touchedFields.email && errors.email ? 'error' : 'default'}
                />

                {touchedFields.email && errors.email && (
                  <p className="mt-1 pl-4 text-[12px] text-error-500 font-poppins">{errors.email?.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...field("password")}
                  type="password"
                  placeholder="Password"
                  variant={touchedFields.password && errors.password ? 'error' : 'default'}
                />

                {touchedFields.password && errors.password && (
                  <p className="mt-1 pl-4 text-[12px] text-error-500 font-poppins">{errors.password?.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Checkbox />
                <label htmlFor="terms" className="text-sm text-neutral-500">
                  I hereby agree to Artsony&apos;s <Link href='/terms' className="font-semibold text-neutral-700">terms and conditions</Link>.
                </label>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="termsAccepted"
                  disabled={isPending}
                  {...field('termsAccepted')}
                />
                <div>
                  <label htmlFor="termsAccepted" className="text-sm text-gray-500 cursor-pointer">
                    I hereby agree to Artsony&apos;s{' '}
                    <Link href="/terms" className="font-semibold text-gray-700 hover:underline">
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
                isLoading={isSubmitting}
                loadingText="Setting up your account..."
                fullWidth
                className="cursor-pointer font-poppins font-medium mt-4 text-[14px] leading-6 tracking-wide"
              >
                Let's have fun!
              </Button>
            </form>

            <p className="text-[14px] text-center font-poppins text-gray-500 tracking-wide">Have an account? <Link href='/login' className="text-primary-500">Log in now</Link></p>
          </div>

          {/* Social Logins */}
          <div className="mt-10 text-center space-y-4">
            <p className="text-sm font-poppins font-medium text-black tracking-wide leading-6">Or signup with</p>
            <div className="flex justify-center gap-6">
              {['google', 'apple', 'facebook'].map((provider) => (
                <Link key={provider} href={`/login/${provider}`} className="w-10 h-10 rounded-full border border-secondary-500 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Image src={`/icons/${provider}.svg`} alt={provider} width={24} height={24} />
                </Link>
              ))}
            </div>
            <Link href="/forgot-password" className="inline-block text-primary-500 font-medium text-sm hover:underline">
              Forgot Password? Reset
            </Link>
          </div>
          {/* Desktop Footer */}
          <footer className="hidden font-poppins lg:flex lg:justify-center lg:items-center w-full mt-10 gap-6 text-[14px] font-medium tracking-wide text-gray-400">
            <Link href='/' className="p-2 text-nowrap">Privacy</Link>
            <Link href='/terms' className="p-2 text-nowrap">Terms & Conditions</Link>
            <Link href='/' className="p-2 text-nowrap">FAQ</Link>
            <Link href='/' className="p-2 text-nowrap">About</Link>
            <Link href='/' className="p-2 text-nowrap">Language</Link>
          </footer>
        </div>
      </section>
    </main>
  );
}