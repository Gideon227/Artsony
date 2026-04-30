import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

type SpinnerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function Spinner({ size = 'md', className, label = 'Loading…' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <Loader2
        className={cn('animate-spin text-primary-500', sizeClasses[size], className)}
        aria-hidden="true"
      />
    </span>
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center" role="status">
      <Spinner size="lg" />
    </div>
  )
}
