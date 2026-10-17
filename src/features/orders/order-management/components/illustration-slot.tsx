import Image from 'next/image'
import { cn } from '@/lib/utils'

type Props = { src: string | null; alt: string; className?: string }

export function IllustrationSlot({ src, alt, className }: Props) {
  if (src) {
    return <Image src={src} alt={alt} width={640} height={480} className={cn('h-auto w-full', className)} />
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn('w-full rounded-[32px] border border-dashed border-secondary-300 bg-secondary-50', className)}
    />
  )
}
