'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CancelReason } from './cancel-reason'
import { CancelOtherReason } from './cancel-other-reason'
import { Confirmation } from './confirmation'
import { useCancelPhysicalItem } from '@/hooks/use-physical-order'
import { HttpError } from '@/lib/api-client'

type Step = 'reason' | 'other' | 'confirm'

interface Props {
  physicalId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelOrderFlow({ physicalId, open, onOpenChange }: Props) {
  const [step, setStep] = useState<Step>('reason')
  const [reason, setReason] = useState<string | null>(null)
  const mutation = useCancelPhysicalItem()

  const reset = useCallback(() => {
    setStep('reason')
    setReason(null)
    mutation.reset()
  }, [mutation])

  const close = useCallback(() => {
    onOpenChange(false)
    setTimeout(reset, 200)
  }, [onOpenChange, reset])

  const requestClose = useCallback(() => {
    if (!mutation.isPending) close()
  }, [mutation.isPending, close])

  const handleReasonPicked = (value: string) => {
    setReason(value)
    setStep(value === 'Other' ? 'other' : 'confirm')
  }

  const handleOtherReasonSubmit = (text: string) => {
    setReason(text)
    setStep('confirm')
  }

  const handleConfirm = () => {
    if (!reason) return
    mutation.mutate(
      { physicalId, reason },
      { onSuccess: close },
    )
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-[520px]"
        >
          {step === 'reason' && <CancelReason onClose={requestClose} onContinue={handleReasonPicked} />}
          {step === 'other' && (
            <CancelOtherReason onClose={requestClose} onBack={() => setStep('reason')} onContinue={handleOtherReasonSubmit} />
          )}
          {step === 'confirm' && (
            <Confirmation
              onClose={requestClose}
              onConfirm={handleConfirm}
              isPending={mutation.isPending}
              errorMessage={
                mutation.isError
                  ? mutation.error instanceof HttpError
                    ? mutation.error.message
                    : 'Could not cancel this order. Please try again.'
                  : null
              }
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}