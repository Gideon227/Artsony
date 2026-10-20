import Image from 'next/image'
import { cn } from '@/lib/utils'

type Props = { name: string; src: string | null; className?: string }

export function CustomerAvatar({ name, src, className }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      className={cn(
        'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-200',
        'font-poppins text-body-s font-semibold text-secondary-800',
        className,
      )}
    >
      {src ? <Image src={src} alt="" fill sizes="40px" className="object-cover" /> : initial}
    </span>
  )
}
