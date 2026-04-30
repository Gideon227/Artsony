'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn, generateInitials } from '@/utils'

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
  '2xl': 'h-28 w-28 text-2xl',
}

type AvatarProps = {
  src?: string | null
  name?: string
  size?: keyof typeof sizeClasses
  className?: string
  isVerified?: boolean
}

function Avatar({ src, name, size = 'md', className, isVerified }: AvatarProps) {
  return (
    <div className="relative inline-block shrink-0">
      <AvatarPrimitive.Root
        className={cn(
          'inline-flex items-center justify-center overflow-hidden rounded-full',
          'select-none font-semibold',
          sizeClasses[size],
          className
        )}
      >
        <AvatarPrimitive.Image
          src={src ?? undefined}
          alt={name ? `${name}'s avatar` : 'Avatar'}
          className="h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-700 font-semibold"
          delayMs={300}
        >
          {name ? generateInitials(name) : '?'}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {isVerified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-500 text-white"
          aria-label="Verified artist"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path
              d="M1.5 4L3 5.5L6.5 2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  )
}

export { Avatar }
