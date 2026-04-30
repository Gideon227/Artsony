import { cn } from '@/utils'

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

export function Container({ className, size = 'xl', ...props }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}
      {...props}
    />
  )
}

export function PageWrapper({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <main className={cn('flex flex-col min-h-screen', className)} {...props} />
}

export function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn('py-8 md:py-12', className)} {...props} />
}

export function Grid({
  className,
  cols = 3,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { cols?: 2 | 3 | 4 | 5 }) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  }
  return (
    <div className={cn('grid gap-4 md:gap-6', colClasses[cols], className)} {...props} />
  )
}
