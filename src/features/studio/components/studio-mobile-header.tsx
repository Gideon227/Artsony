'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export type StudioMobileHeaderProps = {
  title: string
  action?: React.ReactNode
}

// Section screens below `lg` replace the sidebar with this bar. Back returns
// to the Studio menu (the page without a `section` param).
export function StudioMobileHeader({ title, action }: StudioMobileHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className="flex shrink-0 items-center justify-between gap-x-4 border-b border-gray-50 bg-white px-4 py-4 lg:hidden">
      <div className="flex min-w-0 items-center gap-x-4">
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          aria-label="Back to Artsony Studio"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-50 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-50"
        >
          <ArrowLeft color="#525965" size={16} />
        </button>
        <h1 className="truncate font-raleway text-h6 font-semibold leading-8 tracking-wide text-body">{title}</h1>
      </div>
      {action}
    </header>
  )
}
