'use client'

import * as React from 'react'
import { AnimatePresence, motion, animate, useMotionValue } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useUIStore, type Toast, type ToastVariant } from '@/store'
import { cn } from '@/utils'

const DEFAULT_DURATION = 4000

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2.25} />,
  error: <AlertCircle className="h-[18px] w-[18px]" strokeWidth={2.25} />,
  warning: <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={2.25} />,
  info: <Info className="h-[18px] w-[18px]" strokeWidth={2.25} />,
}

const chipClasses: Record<ToastVariant, string> = {
  success: 'bg-successful-100 text-successful-600',
  error: 'bg-error-100 text-error-600',
  warning: 'bg-warning-100 text-warning-600',
  info: 'bg-info-100 text-info-600',
}

const barClasses: Record<ToastVariant, string> = {
  success: 'bg-successful-500',
  error: 'bg-error-500',
  warning: 'bg-warning-500',
  info: 'bg-info-500',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast)
  const duration = toast.duration ?? DEFAULT_DURATION
  const isPersistent = !Number.isFinite(duration) || duration <= 0

  // 1 → 0 over `duration`, driving both the visible progress bar and the
  // actual dismiss timing, so the bar never "lies" about time remaining.
  const progress = useMotionValue(1)
  const controlsRef = React.useRef<ReturnType<typeof animate> | null>(null)

  React.useEffect(() => {
    if (isPersistent) return
    controlsRef.current = animate(progress, 0, {
      duration: duration / 1000,
      ease: 'linear',
      onComplete: () => removeToast(toast.id),
    })
    return () => controlsRef.current?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -28, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
      onHoverStart={() => controlsRef.current?.pause()}
      onHoverEnd={() => controlsRef.current?.play()}
      role="alert"
      aria-live="polite"
      className={cn(
        'relative flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 overflow-hidden',
        'rounded-2xl border border-gray-100 bg-white pb-3.5 pl-4 pr-3 pt-4 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)]'
      )}
    >
      <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', chipClasses[toast.variant])}>
        {icons[toast.variant]}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
        <p className="font-poppins text-[14px] font-semibold leading-snug text-heading">{toast.title}</p>
        {toast.description && (
          <p className="font-poppins text-[13px] leading-snug text-gray-400">{toast.description}</p>
        )}
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 rounded-full p-1 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>

      {!isPersistent && (
        <motion.div
          style={{ scaleX: progress }}
          className={cn('absolute inset-x-0 bottom-0 h-[3px] origin-left rounded-b-2xl', barClasses[toast.variant])}
        />
      )}
    </motion.div>
  )
}

export function Toaster() {
  const toasts = useUIStore((s) => s.toasts)

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[600] flex flex-col items-center gap-3 px-4"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for imperative usage
export function useToast() {
  const addToast = useUIStore((s) => s.addToast)
  return {
    toast: addToast,
    success: (title: string, description?: string) =>
      addToast({ variant: 'success', title, description }),
    error: (title: string, description?: string) =>
      addToast({ variant: 'error', title, description }),
    warning: (title: string, description?: string) =>
      addToast({ variant: 'warning', title, description }),
    info: (title: string, description?: string) =>
      addToast({ variant: 'info', title, description }),
  }
}
