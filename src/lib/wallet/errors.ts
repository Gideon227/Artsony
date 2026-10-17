import { HttpError } from '@/lib/api-client'

// The API reports what was wrong per field (minimum amount, address format,
// insufficient balance); show that rather than a generic "Validation failed".
// 400/422 mean the request itself was wrong (below the minimum, bad address…) and
// the person can fix it on the form; anything else is a failed attempt.
export function isCorrectableWithdrawalError(err: unknown): boolean {
  return err instanceof HttpError && (err.statusCode === 400 || err.statusCode === 422)
}

export function withdrawalErrorMessage(err: unknown): string {
  if (err instanceof HttpError && err.fields && !Array.isArray(err.fields)) {
    const details = Object.values(err.fields).filter(Boolean)
    if (details.length > 0) return details.join(' ')
  }
  return err instanceof Error ? err.message : 'Could not process your withdrawal.'
}
