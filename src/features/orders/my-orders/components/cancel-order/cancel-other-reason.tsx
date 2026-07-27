'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Textarea } from '@/components'
import { CloseButton } from './close-button'

const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Please tell us why you\'re canceling.')
    .refine((val) => val.split(/\s+/).filter(Boolean).length <= 500, 'Max 500 words.'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onClose: () => void
  onBack: () => void
  onContinue: (reason: string) => void
}

export function CancelOtherReason({ onClose, onBack, onContinue }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onChange', defaultValues: { reason: '' } })

  return (
    <form
      onSubmit={handleSubmit((values) => onContinue(values.reason))}
      className="py-16 px-10 rounded-2xl border border-gray-50 relative bg-white flex flex-col gap-y-12"
    >
      <CloseButton onClose={onClose} />

      <h4 className="font-raleway font-medium text-h4 text-[#333333] leading-10 tracking-wide text-center">Cancel Order</h4>

      <div className="flex flex-col items-center justify-center gap-y-6">
        <p className="font-poppins text-body-xs leading-4 text-body tracking-wide text-center px-4">
          You&apos;re about to cancel this order. <br />
          Cancellations are only available until the seller activates shipping. <br />
          Your payment, excluding transaction fees, will be refunded once the cancellation is processed. <br />
          Refunds are typically completed within 2–3 business days.
        </p>

        <div className="flex flex-col gap-y-2 w-full">
          <label htmlFor="other-reason" className="font-poppins font-medium text-body-s tracking-wide text-heading">
            Others
          </label>
          <Textarea id="other-reason" placeholder="Write your reason" aria-invalid={!!errors.reason} {...register('reason')} />
          {errors.reason ? (
            <p className="font-poppins text-body-xxs text-error-500" role="alert">{errors.reason.message}</p>
          ) : (
            <p className="font-poppins text-body-xxs text-body">Max 500 words</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between w-full">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="submit" rightIcon="/icons/alt-arrow-right-double.svg" disabled={!isValid}>Continue</Button>
      </div>
    </form>
  )
}