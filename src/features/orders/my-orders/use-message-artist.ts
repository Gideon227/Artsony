'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { messagingService } from '@/services/messaging.service'
import { HttpError } from '@/lib/api-client'
import { useToast } from '@/components/ui/toaster'

export function useMessageArtist() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { error } = useToast()

  return useMutation({
    mutationFn: (artistId: string) => messagingService.createDirect(artistId),

    onSuccess: (conversation) => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
      router.push(`/messages?conversation=${conversation.id}`)
    },

    onError: (err) =>
      error('Could not open the conversation', err instanceof HttpError ? err.message : 'Please try again.'),
  })
}
