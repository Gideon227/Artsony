'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, LogIn, type LucideIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants'

export type StudioGateVariant = 'guest' | 'non-seller'

type GateContent = {
  image: string
  imageAlt: string
  title: string
  description: string
  cta: string
  href: string
  icon: LucideIcon
}

const CONTENT: Record<StudioGateVariant, GateContent> = {
  // Signed in, but no seller (ARTIST) account yet
  'non-seller': {
    image: '/illustrations/empty-seller.svg',
    imageAlt: 'Illustration of three creators',
    title: 'Unlock Artsony Studio',
    description: 'Artsony Studio gives creators access to powerful insights, wallet management, and their Artsony Score—all designed to help you track performance, manage earnings, and grow your creative business.',
    cta: 'Become a Creator',
    href: '/seller-registration',
    icon: BadgeCheck,
  },
  // Not signed in.
  guest: {
    image: '/illustrations/empty-inbox.svg',
    imageAlt: 'Illustration of creators',
    title: 'Sign in to Artsony Studio',
    description:
      'Sign in to your Artsony account to view your wallet, track your stats and insights, and see your Artsony Score. New here? You can create an account in a minute.',
    cta: 'Sign in',
    href: `${ROUTES.auth.login}?next=/artsony-studio`,
    icon: LogIn,
  },
}

export function StudioGate({ variant, className }: { variant: StudioGateVariant; className?: string }) {
  const { image, imageAlt, title, description, cta, href, icon: Icon } = CONTENT[variant]

  return (
    <section
      aria-labelledby="studio-gate-title"
      className={cn(
        'relative flex min-h-[560px] flex-col items-center justify-center gap-8 overflow-hidden lg:rounded-2xl lg:border lg:border-gray-50 bg-white px-6 py-12 text-center lg:h-full max-md:py-26',
        className,
      )}
    >
      {/* Corner decoration (desktop/tablet only) */}
      <div className='absolute -top-6 md:top-10 rotate-90' style={{ right: '-60px' }}>
        <Image src='/upload/vector.svg' width={248} height={248} className='max-md:w-40 w-62 h-auto'  alt='vector element' />
      </div>

      <div className='absolute -rotate-90' style={{ left: '-60px', bottom: '-60px' }}>
        <Image src='/upload/vector.svg' width={248} height={248} className='max-md:w-40' alt='vector element' />
      </div>

      <Image
        src={image}
        alt={imageAlt}
        width={408}
        height={313}
        priority
        className="relative h-auto w-full max-w-[408px]"
      />

      <div className="relative flex max-w-[560px] flex-col gap-4">
        <h2 id="studio-gate-title" className="font-raleway text-h6 font-semibold tracking-wide text-heading">
          {title}
        </h2>
        <p className="font-poppins text-body-s leading-6 tracking-wide text-gray-400">{description}</p>
      </div>

      <Link href={href} className={cn(buttonVariants(), 'relative h-12 rounded-full px-6')}>
        <Icon className="h-6 w-6" aria-hidden="true" />
        {cta}
      </Link>
    </section>
  )
}