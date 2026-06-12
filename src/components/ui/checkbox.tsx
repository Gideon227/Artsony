'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/utils'

export type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  'onChange' | 'onCheckedChange'
> & {
  label?: string
  description?: string
  error?: string
  indeterminate?: boolean
  // RHF-compatible: receives the raw boolean value
  onChange?: (value: boolean) => void
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    { className, label, description, error, indeterminate, id, onChange, checked, defaultChecked, ...props },
    ref
  ) => {
    const checkboxId = id ?? React.useId()

    const handleCheckedChange = (checkedState: boolean | 'indeterminate') => {
      onChange?.(checkedState === true)
    }

    return (
      <div className="flex items-start gap-3">
        <CheckboxPrimitive.Root
          {...props}
          ref={ref}
          id={checkboxId}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={handleCheckedChange}
          className={cn(
            'peer shrink-0 h-5 w-5 rounded-full border border-neutral-300 bg-white',
            'transition-all duration-200 ease-in-out cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F15A2B] focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-neutral-100',
            'data-[state=checked]:bg-[#F15A2B] data-[state=checked]:border-[#F15A2B]',
            'data-[state=indeterminate]:bg-[#F15A2B] data-[state=indeterminate]:border-[#F15A2B]',
            'hover:border-[#F15A2B]/60',
            error && 'border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500',
            className
          )}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
            {indeterminate ? (
              <Minus className="h-3.5 w-3.5" strokeWidth={4} />
            ) : (
              <Check className="h-3.5 w-3.5" strokeWidth={4} />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {(label ?? description) && (
          <div className="flex flex-col gap-1 min-w-0 select-none">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-semibold text-neutral-800 leading-tight cursor-pointer peer-disabled:cursor-not-allowed"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-neutral-500 leading-normal">{description}</p>
            )}
            {error && (
              <p role="alert" className="text-xs font-medium text-red-600 mt-0.5">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }