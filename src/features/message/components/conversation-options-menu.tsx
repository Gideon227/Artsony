'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components'
import { useToast } from '@/components/ui/toaster'
import { ROUTES } from '@/constants'
import { useMuteConversation, useMarkConversationUnread, useLeaveConversation, useBlockUser } from '@/hooks/use-messaging'
import type { ConversationSummary } from '@/types/messaging'
import { ReportUserModal } from './report-user-modal'

type ConversationOptionsMenuProps = {
  conversation: ConversationSummary | null
  // Called when the open chat should close (after delete / block / mark-unread)
  onCloseChat?: () => void
}

type MenuItem = { key: string; label: string; disabled?: boolean; onSelect: () => void }
type Overlay = 'delete' | 'block' | 'report' | null

export function ConversationOptionsMenu({ conversation, onCloseChat }: ConversationOptionsMenuProps) {
  const router = useRouter()
  const { success } = useToast()
  const [isOpen, setIsOpen] = React.useState(false)
  const [overlay, setOverlay] = React.useState<Overlay>(null)
  const [activeKey, setActiveKey] = React.useState<string | null>(null)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})

  const muteMutation = useMuteConversation()
  const unreadMutation = useMarkConversationUnread()
  const leaveMutation = useLeaveConversation()
  const blockMutation = useBlockUser()

  const otherUser = conversation?.other_user ?? null
  const canTargetUser = conversation?.type === 'direct' && !!otherUser
  const closeMenu = React.useCallback(() => setIsOpen(false), [])

  React.useEffect(() => { setIsOpen(false) }, [conversation?.id])

  React.useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); triggerRef.current?.focus() }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  const handleViewProfile = () => {
    closeMenu()
    if (otherUser) router.push(ROUTES.profile(otherUser.user_id)) // id, not username
  }
  const handleMarkUnread = () => {
    if (!conversation) return
    closeMenu()
    unreadMutation.mutate(conversation.id, { onSuccess: () => onCloseChat?.() })
  }
  const handleToggleMute = () => {
    if (!conversation) return
    const nextMuted = !conversation.is_muted
    closeMenu()
    muteMutation.mutate(
      { conversationId: conversation.id, muted: nextMuted },
      { onSuccess: () => success(nextMuted ? 'Notifications muted' : 'Notifications unmuted') },
    )
  }
  const handleConfirmDelete = () => {
    if (!conversation) return
    leaveMutation.mutate(conversation.id, {
      onSuccess: () => { success('Chat deleted'); setOverlay(null); onCloseChat?.() },
    })
  }
  const handleConfirmBlock = () => {
    if (!otherUser) return
    blockMutation.mutate(otherUser.user_id, {
      onSuccess: () => { setOverlay(null); onCloseChat?.() }, // hook already toasts "User blocked"
    })
  }
  const openOverlay = (next: Exclude<Overlay, null>) => { closeMenu(); setOverlay(next) }

  const items: MenuItem[] = conversation
    ? [
        { key: 'profile', label: 'View Profile', disabled: !canTargetUser, onSelect: handleViewProfile },
        { key: 'unread', label: 'Mark as Unread', disabled: unreadMutation.isPending, onSelect: handleMarkUnread },
        { key: 'mute', label: conversation.is_muted ? 'Unmute Notification' : 'Mute Notification', disabled: muteMutation.isPending, onSelect: handleToggleMute },
        { key: 'report', label: 'Report User', disabled: !canTargetUser, onSelect: () => openOverlay('report') },
        { key: 'block', label: 'Block User', disabled: !canTargetUser, onSelect: () => openOverlay('block') },
        { key: 'delete', label: 'Delete Chat', onSelect: () => openOverlay('delete') },
      ]
    : []

  const enabledItems = items.filter((i) => !i.disabled)
  const highlightedKey = activeKey ?? enabledItems[0]?.key ?? null

  const handleToggle = () => {
    if (isOpen) { setIsOpen(false); return }
    setActiveKey(null)
    setIsOpen(true)
    const firstKey = enabledItems[0]?.key
    if (firstKey) requestAnimationFrame(() => itemRefs.current[firstKey]?.focus())
  }

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') { closeMenu(); return }
    if (enabledItems.length === 0) return
    const current = enabledItems.findIndex((i) => itemRefs.current[i.key] === document.activeElement)
    let next: number
    switch (e.key) {
      case 'ArrowDown': next = current === -1 ? 0 : (current + 1) % enabledItems.length; break
      case 'ArrowUp': next = current === -1 ? enabledItems.length - 1 : (current - 1 + enabledItems.length) % enabledItems.length; break
      case 'Home': next = 0; break
      case 'End': next = enabledItems.length - 1; break
      default: return
    }
    e.preventDefault()
    itemRefs.current[enabledItems[next]!.key]?.focus()
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={!conversation}
        aria-label="Conversation options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="cursor-pointer border border-gray-50 rounded-m flex items-center justify-center p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MoreHorizontal className="lg:hidden" />
        {/* paste your existing <svg className="max-lg:hidden" ...> here unchanged */}
      </button>

      {isOpen && conversation && (
        <div
          role="menu"
          aria-label="Conversation options"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[246px] overflow-hidden rounded-m border border-gray-50 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-100"
        >
          {items.map((item, index) => {
            const isHighlighted = !item.disabled && highlightedKey === item.key
            return (
              <button
                key={item.key}
                ref={(el) => { itemRefs.current[item.key] = el }}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={item.onSelect}
                onMouseEnter={() => !item.disabled && setActiveKey(item.key)}
                onFocus={() => setActiveKey(item.key)}
                className={[
                  'flex h-[60px] w-full cursor-pointer items-center px-6 text-left font-poppins text-body-s font-medium tracking-wide outline-none transition-colors',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  index > 0 ? 'border-t border-gray-50' : '',
                  isHighlighted ? 'bg-primary-500 text-white' : 'bg-white text-body',
                ].join(' ')}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      )}

      <Dialog open={overlay === 'delete'} onOpenChange={(o) => !o && setOverlay(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete this chat?</DialogTitle>
            <DialogDescription>This removes the conversation from your inbox. The other person will still see the message history on their end.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverlay(null)}>Cancel</Button>
            <Button variant="danger" isLoading={leaveMutation.isPending} onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={overlay === 'block'} onOpenChange={(o) => !o && setOverlay(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Block this user?</DialogTitle>
            <DialogDescription>They won&apos;t be able to message you, comment on your work, or buy from you. You can unblock them later from Settings → Privacy &amp; Safety → Blocked Users.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverlay(null)}>Cancel</Button>
            <Button variant="danger" isLoading={blockMutation.isPending} onClick={handleConfirmBlock}>Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {otherUser && conversation && (
        <ReportUserModal
          userId={otherUser.user_id}
          conversationId={conversation.id}
          open={overlay === 'report'}
          onOpenChange={(o: any) => !o && setOverlay(null)}
        />
      )}
    </div>
  )
}