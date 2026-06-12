'use client'

import * as React from 'react'
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export type InputVariant = 'default' | 'error' | 'success' | 'disabled'

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  variant?: InputVariant
  isFilled?: boolean
  isLoading?: boolean
  leftIcon?: string
  rightIcon?: React.ReactNode
  rightElement?: React.ReactNode
  showStatusIcon?: boolean
  error?: string 
}

// ... variantBase stays the same ...
const variantBase: Record<InputVariant, { wrapper: string; input: string }> = {
  default: {
    wrapper: '',
    input: 'border-neutral-200 bg-white hover:border-gray-50 focus-visible:ring-2 focus-visible:ring-[#FFFFFF] focus-visible:border-gray-50',
  },
  error: {
    wrapper: '',
    input: 'border-red-500 bg-white focus-visible:ring-2 focus-visible:ring-white focus-visible:border-red-500',
  },
  success: {
    wrapper: '',
    input: 'border-emerald-500 bg-white focus-visible:ring-2 focus-visible:ring-white focus-visible:border-emerald-500',
  },
  disabled: {
    wrapper: '',
    input: 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed',
  },
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant = 'default',
      error, // Destructure error here
      isFilled,
      isLoading,
      leftIcon,
      rightIcon,
      rightElement,
      showStatusIcon = true,
      disabled,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '')

    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue
    const filled = isFilled ?? Boolean(currentValue?.toString().length)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value)
      onChange?.(e)
    }

    const isPassword = type === 'password'
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type
    const isDisabled = disabled || variant === 'disabled'

    // Logic: If there is an error message, force the 'error' variant
    const activeVariant = error ? 'error' : (isDisabled ? 'disabled' : variant)
    const styles = variantBase[activeVariant]

    // ... rest of your icon logic ...
    const showStatusErr = !isLoading && showStatusIcon && activeVariant === 'error'

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className={cn('relative w-full', styles.wrapper)}>
          {/* Left icon */}
          {leftIcon && (
            <div className={cn('pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400')}>
              <Image src={leftIcon} width={20} height={20} alt='left icon'/>
            </div>
          )}

          <input
            ref={ref}
            type={resolvedType}
            value={currentValue}
            onChange={handleChange}
            disabled={isDisabled}
            className={cn(
              'flex h-14 w-full rounded-full border px-6 py-3 transition-all',
              'text-base font-medium text-neutral-800 placeholder:text-neutral-400',
              leftIcon && 'pl-14',
              (rightIcon || isPassword || error) && 'pr-14',
              styles.input,
              className
            )}
            {...props}
          />

          {/* Right slot (Combined logic) */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
             {showStatusErr && <AlertCircle className="h-5 w-5 text-error-500" />}
             {isPassword && (
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">
                 {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
               </button>
             )}
          </div>
        </div>

        {/* Automatically render the error text if it exists */}
        {error && (
          <p className="text-xs font-semibold text-error-500 pl-4 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }