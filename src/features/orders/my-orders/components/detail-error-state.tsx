import { HttpError } from '@/lib/api-client'

export function DetailErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const message = error instanceof HttpError ? error.message : 'Something went wrong loading this order.'
  return (
    <div className="border-2 border-gray-50 rounded-xl bg-white p-12 flex flex-col items-center gap-y-3 text-center" role="alert">
      <p className="font-poppins text-body-s text-body">{message}</p>
      <button type="button" onClick={onRetry} className="font-poppins text-body-s text-info-500 underline">
        Try again
      </button>
    </div>
  )
}