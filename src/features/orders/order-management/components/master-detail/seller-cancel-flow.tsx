'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, X } from 'lucide-react'
import { Button, Textarea } from '@/components'
import { HttpError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { CANCEL_REASONS, CANCEL_REASON_OTHER } from '../../constants'

type Step = 'reason' | 'other' | 'confirm'

type Props = {
  open: boolean
  isPending: boolean
  error: unknown
  onClose: () => void
  onConfirm: (reason: string) => void
}

const otherSchema = z.object({
  reason: z.string().trim().min(5, 'Please tell us a little more (at least 5 characters).').max(1000, 'Max 1000 characters.'),
})
type OtherValues = z.infer<typeof otherSchema>

function Card({ children, onClose, closeDisabled }: { children: React.ReactNode; onClose?: () => void; closeDisabled?: boolean }) {
  return (
    <div className="relative flex flex-col gap-8 rounded-[32px] border border-gray-50 bg-white px-6 pb-10 pt-16 sm:gap-10 sm:px-10">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          disabled={closeDisabled}
          aria-label="Close dialog"
          className="absolute left-3 top-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-white">
            <X className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>
      )}
      {children}
    </div>
  )
}

function Intro() {
  return (
    <div className="flex flex-col gap-1 text-center font-poppins text-body-xs leading-4 tracking-wide text-gray-400">
      <p>You&apos;re about to cancel this order.</p>
      <p>Canceling will issue a full refund to the buyer, excluding transaction fees.</p>
      <p>Once confirmed, this order will be removed from your sales and can&apos;t be reactivated.</p>
    </div>
  )
}

function Title({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-center font-raleway text-h4 font-medium leading-10 tracking-wide text-gray-500">
      {children}
    </h2>
  )
}

function errorMessage(error: unknown): string | null {
  if (!error) return null
  return error instanceof HttpError ? error.message : 'Could not cancel this order. Please try again.'
}

export function SellerCancelFlow({ open, isPending, error, onClose, onConfirm }: Props) {
  const [step, setStep] = React.useState<Step>('reason')
  const [selected, setSelected] = React.useState<string | null>(null)
  const [reason, setReason] = React.useState<string | null>(null)

  const form = useForm<OtherValues>({ resolver: zodResolver(otherSchema), mode: 'onChange', defaultValues: { reason: '' } })

  React.useEffect(() => {
    if (open) return
    setStep('reason')
    setSelected(null)
    setReason(null)
    form.reset({ reason: '' })
  }, [open, form])

  const requestClose = React.useCallback(() => {
    if (!isPending) onClose()
  }, [isPending, onClose])

  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && requestClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, requestClose])

  if (!open) return null

  const heading = step === 'confirm' ? 'confirm-title' : 'cancel-title'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={heading}
      onClick={(event) => event.target === event.currentTarget && requestClose()}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
    >
      <div className="w-full max-w-[520px]">
        {step === 'reason' && (
          <Card onClose={requestClose}>
            <Title id="cancel-title">Cancel Order</Title>
            <Intro />
            <div role="radiogroup" aria-label="Cancellation reason" className="flex flex-col">
              {CANCEL_REASONS.map((text) => {
                const isSelected = selected === text
                return (
                  <button
                    key={text}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelected(text)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 px-6 py-3 text-left transition-colors',
                      isSelected ? 'bg-primary-500 text-white' : 'border-b border-gray-50 bg-white text-gray-400 hover:bg-secondary-50',
                    )}
                  >
                    <span className="flex-1 font-poppins text-body-xs font-medium tracking-wide">{text}</span>
                    <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white', !isSelected && 'border-2 border-gray-50')}>
                      {isSelected && <Check className="h-4 w-4 text-primary-500" aria-hidden="true" />}
                    </span>
                  </button>
                )
              })}
            </div>
            <Button
              rightIcon="/icons/alt-arrow-right-double.svg"
              className="mx-auto"
              disabled={!selected}
              onClick={() => {
                if (!selected) return
                if (selected === CANCEL_REASON_OTHER) {
                  setStep('other')
                } else {
                  setReason(selected)
                  setStep('confirm')
                }
              }}
            >
              Continue
            </Button>
          </Card>
        )}

        {step === 'other' && (
          <form
            noValidate
            onSubmit={form.handleSubmit((values) => {
              setReason(values.reason)
              setStep('confirm')
            })}
          >
            <Card onClose={requestClose}>
              <Title id="cancel-title">Cancel Order</Title>
              <Intro />
              <div className="flex flex-col gap-2">
                <label htmlFor="cancel-other-reason" className="font-poppins text-body-s font-medium tracking-wide text-gray-500">
                  Others
                </label>
                <Textarea
                  id="cancel-other-reason"
                  placeholder="Write your reason"
                  aria-invalid={!!form.formState.errors.reason}
                  {...form.register('reason')}
                />
                {form.formState.errors.reason ? (
                  <p role="alert" className="font-poppins text-body-xxs text-error-500">{form.formState.errors.reason.message}</p>
                ) : (
                  <p className="font-poppins text-body-xxs text-gray-300">Max 1000 characters</p>
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="outline" onClick={() => setStep('reason')}>Back</Button>
                <Button type="submit" rightIcon="/icons/alt-arrow-right-double.svg" disabled={!form.formState.isValid}>Continue</Button>
              </div>
            </Card>
          </form>
        )}

        {step === 'confirm' && (
          <Card>
            <Title id="confirm-title">Are you sure ?</Title>
            <div className="flex flex-col gap-4 text-center font-poppins text-body-xs leading-5 tracking-wide text-gray-400">
              <p>This action can&apos;t be undone once confirmed, and the buyer will be refunded automatically.</p>
              <p>Frequent cancellations may affect your seller performance.</p>
              {errorMessage(error) && (
                <p role="alert" className="text-error-500">{errorMessage(error)}</p>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" size="lg" onClick={requestClose} disabled={isPending}>Cancel</Button>
              <Button
                size="lg"
                isLoading={isPending}
                disabled={isPending || !reason}
                aria-label="Confirm order cancellation"
                onClick={() => reason && onConfirm(reason)}
              >
                Finish
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
