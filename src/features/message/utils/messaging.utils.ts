import type { ConversationSummary } from '@/types/messaging'

export function formatMessageDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86_400_000)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`
}

export function getConvDisplayName(
  conv: ConversationSummary,
  myId: string
): string {
  if (conv.type === 'broadcast') return conv.title ?? 'Broadcast'
  if (conv.other_user?.display_name) return conv.other_user.display_name
  return conv.other_user?.email?.split('@')[0] ?? 'Unknown'
}

export function getConvAvatar(conv: ConversationSummary): string | null {
  return conv.other_user?.avatar_url ?? null
}