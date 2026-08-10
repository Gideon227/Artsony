import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationPreferencesService, type NotificationPreferences } from '@/services/notification-preferences.service'
import { useToast } from '@/components/ui/toaster'
import { HttpError } from '@/lib/api-client'
import { STALE_TIMES } from '@/constants'

const KEY = ['notification-preferences'] as const

export function useNotificationPreferences() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => notificationPreferencesService.get().then((r) => r.data),
    staleTime: STALE_TIMES.fast,
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (changes: Partial<Pick<NotificationPreferences, 'push_enabled' | 'email_enabled' | 'ws_enabled' | 'types_muted'>>) =>
      notificationPreferencesService.update(changes),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(KEY, data)
      success('Saved', 'Your notification preferences have been updated.')
    },
    onError: (err) => {
      error('Could not save', err instanceof HttpError ? err.message : 'Please try again.')
    },
  })
}
