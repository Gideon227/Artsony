'use client'

import Link from 'next/link'
import { ChevronsRight } from 'lucide-react'
import { cn } from '@/utils'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  viewAllHref?: string
  viewAllLabel?: string
  className?: string
  accent?: boolean
}

export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View all',
  className,
  accent = true,
}: SectionHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between gap-4', className)}>
            <div className="flex items-start gap-3">
                {accent && (
                    <span className="mt-1.5 w-1 h-5 rounded-full bg-primary-500 shrink-0" />
                )}
                <div>
                    <h2 className="font-raleway font-semibold text-[20px] md:text-[24px] text-neutral-600 tracking-wide leading-tight">
                        {title}
                     </h2>
                    {subtitle && (
                        <p className="font-poppins text-[13px] text-neutral-400 mt-1 leading-5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {viewAllHref && (
                <Link
                    href={viewAllHref}
                    className="flex items-center gap-1 font-poppins text-[13px] font-medium text-primary-500 hover:text-primary-600 transition-colors group shrink-0 mt-1"
                >
                    {viewAllLabel}
                    <ChevronsRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            )}
        </div>
    )
}