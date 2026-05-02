'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer',
    'font-medium font-poppins transition-all duration-200 select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-500 text-white rounded-[32px] disabled:bg-gray-50 ',
          'hover:bg-primary-600',
          'active:bg-primary-700',
          'shadow-sm hover:shadow-md',
        ],
        secondary: [
          'bg-secondary-500 text-white',
          'hover:bg-secondary-600',
          'active:bg-secondary-700',
          'shadow-sm',
        ],
        outline: [
          'border border-neutral-200 bg-white text-neutral-700',
          'hover:bg-neutral-50 hover:border-neutral-300',
          'active:bg-neutral-100',
        ],
        ghost: [
          'bg-transparent text-neutral-700',
          'hover:bg-neutral-100',
          'active:bg-neutral-200',
        ],
        danger: [
          'bg-error-500 text-white',
          'hover:bg-error-600',
          'active:bg-error-700',
          'shadow-sm',
        ],
        'ghost-primary': [
          'bg-transparent text-primary-500',
          'hover:bg-primary-50',
          'active:bg-primary-100',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-[var(--radius-sm)]',
        md: 'h-10 px-6 text-[14px] rounded-[var(--radius-2xl)]',
        lg: 'h-12 px-6 text-base rounded-[var(--radius-lg)]',
        icon: 'h-10 w-10 rounded-[var(--radius-md)]',
        'icon-sm': 'h-8 w-8 rounded-[var(--radius-sm)]',
        'icon-lg': 'h-12 w-12 rounded-[var(--radius-lg)]',
      },
      fullWidth: {
        true: 'w-full rounded-full h-12 ',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps & {
    isLoading?: boolean
    loadingText?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || isLoading

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
