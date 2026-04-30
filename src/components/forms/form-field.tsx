'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/utils'

// ─── Tooltip ─────────────────────────────────────────────────────────────────
// Matches the Figma: small rounded box, #E7F3F3 bg (secondary-100), appears
// above the ? icon on hover. Pure CSS — no JS needed, so it renders on SSR.

type TooltipProps = {
  content: string
  children: React.ReactNode
}

function LabelTooltip({ content, children }: TooltipProps) {
  return (
    <span className="relative inline-flex items-center group/tooltip">
      {children}
      {/* Tooltip box — exact match to Figma: secondary-100 bg, rounded-lg */}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
          'w-max max-w-[200px] rounded-lg px-3 py-2',
          'bg-secondary-100 text-secondary-800 text-xs font-medium leading-snug',
          'shadow-sm border border-secondary-200',
          // Arrow pointing down
          'after:absolute after:top-full after:left-1/2 after:-translate-x-1/2',
          'after:border-4 after:border-transparent after:border-t-secondary-100',
          // Visibility
          'opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100',
          'transition-all duration-150 origin-bottom'
        )}
      >
        {content}
      </span>
    </span>
  )
}

// ─── FormField ───────────────────────────────────────────────────────────────

type FormFieldProps = {
  label?: string
  tooltip?: string
  hint?: string
  error?: string
  required?: boolean
  htmlFor?: string
  children: React.ReactNode
  className?: string
}

function FormField({
  label,
  tooltip,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  const fieldId = htmlFor

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center gap-1.5">
          <LabelPrimitive.Root
            htmlFor={fieldId}
            className="text-sm font-semibold text-neutral-700 leading-none select-none"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-error-500" aria-hidden="true">
                *
              </span>
            )}
          </LabelPrimitive.Root>

          {/* ? icon with tooltip — from Figma label design */}
          {tooltip && (
            <LabelTooltip content={tooltip}>
              <HelpCircle
                className="h-3.5 w-3.5 text-neutral-400 cursor-help hover:text-neutral-600 transition-colors"
                aria-label={`Help: ${tooltip}`}
              />
            </LabelTooltip>
          )}
        </div>
      )}

      {children}

      {/* Error takes priority over hint */}
      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1 text-xs text-error-600 font-medium"
        >
          <span aria-hidden="true">
            {/* Inline mini alert icon matching Figma error state */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 2.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V4a.5.5 0 01.5-.5zm0 5a.625.625 0 100-1.25A.625.625 0 006 8.5z"
                fill="currentColor"
              />
            </svg>
          </span>
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-neutral-400 leading-snug">{hint}</p>
      ) : null}
    </div>
  )
}

export { FormField, LabelTooltip }