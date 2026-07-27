import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components'
import { CloseButton } from './close-button'

interface Props {
  onClose: () => void
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
  errorMessage: string | null
}

export function Confirmation({ onClose, onCancel, onConfirm, isPending, errorMessage }: Props) {
  return (
    <div className="py-16 px-10 rounded-2xl border border-gray-50 relative bg-white flex flex-col gap-y-12">
        <CloseButton onClose={onClose} />

        <h4 className="font-raleway font-medium text-h4 text-[#333333] leading-10 tracking-wide text-center">Are you sure?</h4>

        <div className="flex flex-col gap-y-4 items-center justify-center">
            <p className="font-poppins text-body-xs text-body tracking-wide text-center">
                This action can&apos;t be undone once confirmed. The order will be permanently canceled, and your refund
                will be processed according to Artsony&apos;s policy.
            </p>
            <div className="flex gap-x-4 items-start">
                <AlertTriangle size={16} className="text-error-500 shrink-0 mt-0.5" />
                <p className="font-poppins text-body-xs text-body tracking-wide text-center">
                    This item may not be available for repurchase once canceled.
                </p>
            </div>
            {errorMessage && (
                <p className="font-poppins text-body-xs text-error-500 text-center" role="alert">{errorMessage}</p>
            )}
        </div>

        <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="lg" onClick={onCancel} disabled={isPending}>Back</Button>
            <Button size="lg" onClick={onConfirm} isLoading={isPending} disabled={isPending} aria-label="Confirm order cancellation">
                Finish
            </Button>
        </div>
    </div>
  )
}