import { HttpError } from '@/lib/api-client'

export function studioRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof HttpError && error.statusCode >= 400 && error.statusCode < 500) return false
  return failureCount < 2
}

export function studioErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.statusCode === 403) return 'Artsony Studio is only available to artist accounts.'
    if (error.statusCode === 401) return 'Your session has expired. Please sign in again.'
  }
  return "We couldn't load this right now. Please try again."
}
