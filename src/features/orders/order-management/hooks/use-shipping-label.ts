'use client'

import * as React from 'react'
import { useToast } from '@/components/ui/toaster'
import { sellerActivationService } from '@/services/order/seller-activation.service'

// The tab is opened synchronously on click so popup blockers allow it, then
// pointed at the generated PDF once it arrives.
export function useShippingLabel(orderItemId: string) {
  const { error: toastError } = useToast()
  const [isDownloading, setIsDownloading] = React.useState(false)

  const download = React.useCallback(async () => {
    setIsDownloading(true)
    const opened = window.open('', '_blank')
    try {
      const url = await sellerActivationService.labelUrl(orderItemId)
      if (opened) opened.location.href = url
      else window.location.assign(url)
    } catch (err) {
      opened?.close()
      toastError('Shipping label unavailable', err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }, [orderItemId, toastError])

  return { download, isDownloading }
}
