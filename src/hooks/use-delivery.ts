import { useMutation, useQuery } from '@tanstack/react-query'
import { deliveryService } from '@/services/order/delivery.service'
import { useToast } from '@/components/ui/toaster'
import { STALE_TIMES } from '@/constants'
import { HttpError } from '@/lib/api-client'

const DELIVERY_KEYS = {
  all: ['delivery'] as const,
  myDownloads: () => [...DELIVERY_KEYS.all, 'my-downloads'] as const,
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function useMyDownloads() {
  return useQuery({
    queryKey: DELIVERY_KEYS.myDownloads(),
    queryFn: () => deliveryService.getMyDownloads().then((r) => r.data),
    staleTime: STALE_TIMES.fast,
  })
}

// ── Download trigger ─────────────────────────────────────────────────────────
// Forces the browser to save the file under its real filename rather than
// just navigating to it. Cloudinary's response headers for a signed URL
// aren't guaranteed to set Content-Disposition, and the HTML `download`
// attribute is unreliable for cross-origin links — fetching as a blob and
// downloading from a same-origin blob: URL sidesteps both. Falls back to
// opening the URL directly if the fetch itself fails (e.g. a CORS
// misconfiguration on the storage side), so the buyer can still get the
// file manually rather than hitting a dead end.

async function triggerBrowserDownload(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Download fetch failed with status ${res.status}`)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

// ── Mutations ────────────────────────────────────────────────────────────────
// A mutation rather than a query: each call increments the token's
// download_count server-side, so this must never fire implicitly via
// TanStack Query's background refetch/caching behavior — only on explicit
// user action (clicking "Download").

export function useDownloadArtwork() {
  const { error } = useToast()

  return useMutation({
    mutationFn: async (orderItemId: string) => {
      const { data } = await deliveryService.getDownloadForOrderItem(orderItemId)
      await triggerBrowserDownload(data.signed_url, data.filename)
      return data
    },
    onError: (err) => {
      const message =
        err instanceof HttpError
          ? err.message
          : 'Could not start your download. Please try again.'
      error('Download Failed', message)
    },
  })
}
