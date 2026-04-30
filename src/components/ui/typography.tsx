import * as React from 'react'
import { cn } from '@/utils'

type TextProps = {
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  children?: React.ReactNode
  id?: string
}

function Display({ className, as: Tag = 'h1', ...props }: TextProps) {
  return (
    <Tag
      className={cn(
        'font-bold text-neutral-900 leading-[1.15] tracking-[-0.02em]',
        'text-4xl sm:text-5xl lg:text-6xl',
        className
      )}
      {...props}
    />
  )
}

function H1({ className, ...props }: Omit<TextProps, 'as'>) {
  return (
    <h1
      className={cn('font-bold text-neutral-900 text-3xl sm:text-4xl leading-tight tracking-tight', className)}
      {...props}
    />
  )
}

function H2({ className, ...props }: Omit<TextProps, 'as'>) {
  return (
    <h2
      className={cn('font-semibold text-neutral-900 text-2xl sm:text-3xl leading-snug tracking-tight', className)}
      {...props}
    />
  )
}

function H3({ className, ...props }: Omit<TextProps, 'as'>) {
  return (
    <h3
      className={cn('font-semibold text-neutral-800 text-xl sm:text-2xl leading-snug', className)}
      {...props}
    />
  )
}

function H4({ className, ...props }: Omit<TextProps, 'as'>) {
  return (
    <h4
      className={cn('font-semibold text-neutral-800 text-lg sm:text-xl leading-snug', className)}
      {...props}
    />
  )
}

function BodyLg({ className, as: Tag = 'p', ...props }: TextProps) {
  return <Tag className={cn('text-neutral-600 text-lg leading-relaxed', className)} {...props} />
}

function Body({ className, as: Tag = 'p', ...props }: TextProps) {
  return <Tag className={cn('text-neutral-600 text-base leading-relaxed', className)} {...props} />
}

function BodySm({ className, as: Tag = 'p', ...props }: TextProps) {
  return <Tag className={cn('text-neutral-500 text-sm leading-relaxed', className)} {...props} />
}

function Caption({ className, ...props }: Omit<TextProps, 'as'>) {
  return (
    <p className={cn('text-neutral-400 text-xs leading-normal tracking-wide', className)} {...props} />
  )
}

function Label({ className, as: Tag = 'span', ...props }: TextProps) {
  return (
    <Tag className={cn('text-neutral-700 text-sm font-medium leading-none', className)} {...props} />
  )
}

function Overline({ className, ...props }: Omit<TextProps, 'as'>) {
  return (
    <p
      className={cn(
        'text-neutral-400 text-xs font-semibold uppercase tracking-widest leading-none',
        className
      )}
      {...props}
    />
  )
}

export { Display, H1, H2, H3, H4, BodyLg, Body, BodySm, Caption, Label, Overline }
