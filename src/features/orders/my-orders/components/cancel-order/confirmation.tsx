import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components'
import { CloseButton } from './close-button'

interface Props {
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
  errorMessage: string | null
}

export function Confirmation({ onClose, onConfirm, isPending, errorMessage }: Props) {
  return (
    <div className="relative py-16 px-10 rounded-2xl border border-gray-50 relative bg-white flex flex-col gap-y-12">
        <div className='absolute left-6 top-6 -translate-x-1/2 -translate-y-1/2'>
            <CloseButton onClose={onClose} />
        </div>

        <h4 className="font-raleway font-medium text-h4 text-[#333333] leading-10 tracking-wide text-center">Are you sure?</h4>

        <div className="flex flex-col gap-y-4 items-center justify-center">
            <p className="font-poppins text-body-xs text-body tracking-wide text-center">
                This action can&apos;t be undone once confirmed. The order will be permanently canceled, and your refund
                will be processed according to Artsony&apos;s policy.
            </p>
            <div className="flex gap-x-3 items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75ZM12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z" fill-rule="evenodd" clip-rule="evenodd" fill="#F25B38"/>
                </svg>
                <p className="font-poppins text-body-xs text-body tracking-wide text-center">
                    This item may not be available for repurchase once canceled.
                </p>
            </div>
            {errorMessage && (
                <p className="font-poppins text-body-xs text-error-500 text-center" role="alert">{errorMessage}</p>
            )}
        </div>

        <div className="flex items-center w-full gap-x-6">
            <Button variant="outline" size="lg" onClick={onClose} fullWidth disabled={isPending}>Cancel</Button>
            <Button size="lg" onClick={onConfirm} isLoading={isPending} fullWidth disabled={isPending} aria-label="Confirm order cancellation">
                Finish
            </Button>
        </div>
    </div>
  )
}