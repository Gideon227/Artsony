import { HttpError } from '@/lib/api-client'

export type OrdersLoadError = {
  title: string
  description: string
  retryable: boolean
}

export function describeOrdersLoadError(error: unknown): OrdersLoadError {
  if (error instanceof HttpError) {
    if (error.statusCode === 401) {
      return {
        title: 'Your session has expired',
        description: 'Please sign in again to see your orders.',
        retryable: false,
      }
    }
    if (error.statusCode === 403) {
      return {
        title: "You don't have access to these orders",
        description: 'This page is not available for your account type.',
        retryable: false,
      }
    }
    if (error.statusCode === 429) {
      return {
        title: 'Too many requests',
        description: 'Please wait a moment and try again.',
        retryable: true,
      }
    }
    if (error.statusCode >= 500) {
      return {
        title: 'Something went wrong on our side',
        description: "We couldn't load your orders right now. Please try again shortly.",
        retryable: true,
      }
    }
    return {
      title: "We couldn't load your orders",
      description: error.message,
      retryable: true,
    }
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return {
      title: "You're offline",
      description: 'Check your internet connection and try again.',
      retryable: true,
    }
  }

  if (error instanceof TypeError) {
    return {
      title: "We couldn't reach the server",
      description: 'Check your connection and try again.',
      retryable: true,
    }
  }

  return {
    title: "We couldn't load your orders",
    description: 'Please try again.',
    retryable: true,
  }
}
