import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ORDER_ILLUSTRATIONS, SELLER_REGISTRATION_HREF } from '../constants'
import { IllustrationSlot } from './illustration-slot'

export function SellerGate() {
  return (
    <section
      aria-labelledby="seller-gate-title"
      className="flex min-h-[560px] flex-col items-center justify-center gap-8 rounded-[32px] border border-gray-50 bg-white px-6 py-12 text-center lg:col-span-3 lg:min-h-[calc(100vh-200px)]"
    >
      <IllustrationSlot src={ORDER_ILLUSTRATIONS.seller} alt="Artists illustration" className="aspect-[5/4] max-w-[400px]" />
      <div className="flex max-w-[674px] flex-col gap-4">
        <h2 id="seller-gate-title" className="font-raleway text-h6 font-semibold tracking-wide text-gray-500">
          Start Selling on Artsony
        </h2>
        <p className="font-poppins text-body-s leading-6 tracking-wide text-gray-400">
          Order Management is available to Artsony creators. Create your seller account to start listing artwork, receive
          orders, and manage your sales from one place.
        </p>
      </div>
      <Link href={SELLER_REGISTRATION_HREF} className={cn(buttonVariants(), 'h-12 rounded-full px-6')}>
        <BadgeCheck className="h-6 w-6" aria-hidden="true" />
        Become a Creator
      </Link>
    </section>
  )
}
