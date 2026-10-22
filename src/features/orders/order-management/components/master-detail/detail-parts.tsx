import * as React from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DetailShell({ children, className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <article {...rest} className={cn('flex min-w-0 flex-col lg:rounded-2xl lg:border lg:border-gray-50 bg-white', className)}>
      {children}
    </article>
  )
}

type HeaderProps = {
  title: string
  mobileTitle: string
  actions?: React.ReactNode
  onClose: () => void
}

export function DetailHeader({ title, mobileTitle, actions, onClose }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 pb-4 lg:px-6 lg:pb-6 lg:pt-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close order details"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-50 text-gray-400 hover:bg-secondary-50 active:scale-95 lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <h2 className="hidden font-raleway max-lg:text-h6 lg:text-h4 max-lg:font-semibold lg:font-medium tracking-wide text-gray-500 lg:block">{title}</h2>
        <h2 className="truncate font-raleway text-h6 font-semibold lg:font-medium tracking-wide text-body lg:hidden">{mobileTitle}</h2>
      </div>

      {actions}
    </header>
  )
}

export function DetailSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-4 border-t border-gray-50 py-6 lg:gap-6 lg:px-6', className)}>
      <h3 className="font-raleway text-h6 font-medium tracking-wide text-gray-500 lg:text-h5">{title}</h3>
      {children}
    </section>
  )
}

export function OrderCube() {
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border border-gray-50 bg-white lg:h-[72px] lg:w-[72px] lg:rounded-[20px]">
      <Image src="/home/box-black.svg" alt="" width={32} height={32} aria-hidden="true" />
    </span>
  )
}

type FieldProps = { label: string; value: React.ReactNode; valueClassName?: string; className?: string; title?: string }

export function ReadOnlyField({ label, value, valueClassName, className, title }: FieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="font-poppins text-body-xs tracking-wide text-gray-300">{label}</span>
      <span
        title={title ?? (typeof value === 'string' ? value : undefined)}
        className={cn(
          'flex min-h-12 items-center rounded-[24px] border border-gray-50 px-4 py-2 font-poppins text-[14px] tracking-wide text-body',
          valueClassName,
        )}
      >
        <span className="truncate">{value}</span>
      </span>
    </div>
  )
}

export function InlineMeta({ label, value, valueClassName }: { label: string; value: React.ReactNode; valueClassName?: string }) {
  return (
    <p className="font-poppins text-body-xs tracking-wide text-gray-300 lg:text-body-s">
      {label} <span className={cn('text-gray-500', valueClassName)}>{value}</span>
    </p>
  )
}

export function PlainField({
  label,
  value,
  valueClassName,
  className,
}: {
  label: string
  value: React.ReactNode
  valueClassName?: string
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="font-poppins text-body-xs tracking-wide text-gray-300">{label}</span>
      <span className={cn('truncate font-poppins text-body-s tracking-wide text-gray-500', valueClassName)}>{value}</span>
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <DetailShell className="animate-pulse gap-6 p-6" aria-hidden="true">
      <div className="h-8 w-1/3 rounded bg-secondary-100" />
      <div className="h-24 rounded-[24px] bg-secondary-100" />
      <div className="h-48 rounded-[24px] bg-secondary-100" />
      <div className="h-48 rounded-[24px] bg-secondary-100" />
    </DetailShell>
  )
}
