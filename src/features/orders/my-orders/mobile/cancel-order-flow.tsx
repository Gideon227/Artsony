'use client'

import { useCallback, useState, type ReactNode } from 'react'
import { ArrowLeft, Check, Info, X } from 'lucide-react'
import Link from 'next/link'
import { Button, Textarea } from '@/components'
import { useCancelPhysicalItem } from '@/hooks/use-physical-order'
import { HttpError } from '@/lib/api-client'
import { REFUND_POLICY_HREF } from './constants'
import { cn } from '@/lib/utils'

type Step = 'reason' | 'other' | 'confirm'

// Same options and rules as the desktop flow, so both submit identical reasons.
const REASONS = [
  'I ordered by mistake',
  'The wrong artwork was selected',
  'I changed my mind',
  'I found a problem with the listing',
  'Other',
]
const OTHER_MIN = 5
const OTHER_MAX = 1000

interface Props {
  physicalId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-50 active:scale-95"
    >
      {children}
    </button>
  )
}

function CloseIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-white">
      <X size={14} strokeWidth={3} aria-hidden="true" />
    </span>
  )
}

function ModalHeader({ title, onBack, onClose }: { title: string; onBack?: (() => void) | undefined; onClose?: (() => void) | undefined }) {
  return (
    <>
      {(onBack || onClose) && (
        <div className="flex items-center justify-between">
          {onBack ? (
            <IconButton label="Back" onClick={onBack}>
              <ArrowLeft size={18} className="text-body" aria-hidden="true" />
            </IconButton>
          ) : (
            <span aria-hidden="true" />
          )}
          {onClose && (
            <IconButton label="Close dialog" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </div>
      )}
      <h4 className="text-center font-poppins text-h6 font-normal tracking-wide text-heading">{title}</h4>
    </>
  )
}

function PolicyCopy() {
  return (
    <div className="flex flex-col gap-3 text-center font-poppins text-body-xs leading-5 tracking-wide text-body">
      <p>
        Cancellations are only available until the seller activates shipping. Your payment, excluding transaction fees,
        will be refunded once the cancellation is processed.
      </p>
      <p>Refunds are typically completed within 2–3 business days.</p>
    </div>
  )
}

export function MobileCancelOrderFlow({ physicalId, open, onOpenChange }: Props) {
  const [step, setStep] = useState<Step>('reason')
  const [selected, setSelected] = useState<string | null>(null)
  const [otherText, setOtherText] = useState('')
  const [reason, setReason] = useState<string | null>(null)
  const { mutate, reset: resetMutation, isPending, isError, error } = useCancelPhysicalItem()

  const reset = useCallback(() => {
    setStep('reason')
    setSelected(null)
    setOtherText('')
    setReason(null)
    resetMutation()
  }, [resetMutation])

  const close = useCallback(() => {
    onOpenChange(false)
    setTimeout(reset, 200)
  }, [onOpenChange, reset])

  const requestClose = useCallback(() => {
    if (!isPending) close()
  }, [isPending, close])

  if (!open) return null

  const otherTrimmed = otherText.trim()
  const otherTooShort = otherTrimmed.length > 0 && otherTrimmed.length < OTHER_MIN

  const handleReasonContinue = () => {
    if (!selected) return
    if (selected === 'Other') {
      setStep('other')
      return
    }
    setReason(selected)
    setStep('confirm')
  }

  const handleOtherContinue = () => {
    if (otherTrimmed.length < OTHER_MIN) return
    setReason(otherTrimmed)
    setStep('confirm')
  }

  const handleConfirm = () => {
    if (!reason) return
    mutate({ physicalId, reason }, { onSuccess: close })
  }

  const errorMessage = isError
    ? error instanceof HttpError
      ? error.message
      : 'Could not cancel this order. Please try again.'
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cancel order"
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[420px] flex-col gap-6 overflow-y-auto rounded-3xl border border-gray-50 bg-white px-6 pb-8 pt-6">
        {step === 'reason' && (
          <>
            <ModalHeader title="Cancel Order" onClose={requestClose} />
            <PolicyCopy />

            <div className="flex flex-col" role="radiogroup" aria-label="Cancellation reason">
              {REASONS.map((text) => {
                const isSelected = selected === text
                return (
                  <button
                    key={text}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelected(text)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-gray-50 px-1 py-4 text-left"
                  >
                    <span className="font-poppins text-body-s font-medium tracking-wide text-body">{text}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                        isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-100 bg-white',
                      )}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                  </button>
                )
              })}
            </div>

            <Button
              rightIcon="/icons/alt-arrow-right-double.svg"
              className="mx-auto"
              disabled={!selected}
              onClick={handleReasonContinue}
            >
              Continue
            </Button>
          </>
        )}

        {step === 'other' && (
          <>
            <ModalHeader title="Cancel Order" onBack={() => setStep('reason')} onClose={requestClose} />
            <PolicyCopy />

            <div className="flex flex-col gap-2">
              <label htmlFor="mobile-other-reason" className="font-poppins text-body-s font-medium tracking-wide text-heading">
                Others
              </label>
              <Textarea
                id="mobile-other-reason"
                placeholder="Write your reason"
                value={otherText}
                maxLength={OTHER_MAX}
                aria-invalid={otherTooShort}
                onChange={(e) => setOtherText(e.target.value)}
              />
              {otherTooShort ? (
                <p className="font-poppins text-body-xxs text-error-500" role="alert">
                  Please tell us a little more (at least {OTHER_MIN} characters).
                </p>
              ) : (
                <p className="font-poppins text-body-xxs text-gray-200">
                  {otherText.length}/{OTHER_MAX} characters
                </p>
              )}
            </div>

            <Button
              rightIcon="/icons/alt-arrow-right-double.svg"
              className="mx-auto"
              disabled={otherTrimmed.length < OTHER_MIN}
              onClick={handleOtherContinue}
            >
              Continue
            </Button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <ModalHeader title="Are you sure?" />

            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                  <Info size={14} strokeWidth={3} aria-hidden="true" />
                </span>
                <p className="font-poppins text-body-s tracking-wide text-body">
                  This item may not be available for repurchase once canceled.
                </p>
              </div>

              <p className="font-poppins text-body-s leading-6 tracking-wide text-body">
                This action can&apos;t be undone once confirmed. The order will be permanently canceled, and your refund
                will be processed according to{' '}
                <Link href={REFUND_POLICY_HREF} className="text-primary-500 underline">
                  Artsony&apos;s policy.
                </Link>
              </p>

              {errorMessage && (
                <p className="font-poppins text-body-xs text-error-500" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg" className="flex-1 rounded-full" onClick={requestClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                size="lg"
                className="flex-1 rounded-full"
                onClick={handleConfirm}
                isLoading={isPending}
                disabled={isPending}
                aria-label="Confirm order cancellation"
              >
                Finish
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
