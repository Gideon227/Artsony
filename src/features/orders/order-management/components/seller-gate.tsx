import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ORDER_ILLUSTRATIONS, SELLER_REGISTRATION_HREF } from '../constants'
import { IllustrationSlot } from './illustration-slot'
import Image from 'next/image'

export function SellerGate() {
  return (
    <section
      aria-labelledby="seller-gate-title"
      className="flex relative min-h-[560px] overflow-hidden relartive flex-col items-center justify-center gap-12 rounded-2xl pt-12 pb-24 border border-gray-50 bg-white text-center lg:col-span-3 lg:min-h-[calc(100vh-200px)]"
    >
      <div className='absolute top-10 md:rotate-90' style={{ right: '-60px' }}>
        <Image src='/upload/vector.svg' width={248} height={248} className='max-md:w-8 w-62 h-auto'  alt='vector element' />
      </div>

      <div className='absolute md:-rotate-90' style={{ left: '-60px', bottom: '-60px' }}>
        <Image src='/upload/vector.svg' width={248} height={248} className='max-md:w-30' alt='vector element' />
      </div>

      <Image src={ORDER_ILLUSTRATIONS.seller!} width={400} height={305} alt="Artists illustration" className="" />
      
      <div className="flex max-w-[698px] flex-col gap-4">
        <h2 id="seller-gate-title" className="font-poppins text-h6 font-medium tracking-wide text-heading">
          Start Selling on Artsony
        </h2>
        <p className="font-poppins text-body-m leading-6 tracking-wide text-body">
          Order Management is available to Artsony creators. Create your seller account to start listing artwork, receive
          orders, and manage your sales from one place.
        </p>
        <Button 
          leftIcon='/icons/verified-check-white.svg'
          className='mt-2 mx-auto w-[217px]'
        >
          <Link href={SELLER_REGISTRATION_HREF}>
            Become a Creator
          </Link>
        </Button>
        
      </div>
    </section>
  )
}
