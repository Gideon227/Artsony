'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, User, BellOff, Bell, MailOpen, Flag, Ban, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components'
import { useToast } from '@/components/ui/toaster'
import { ROUTES } from '@/constants'
import {
  useMuteConversation,
  useMarkConversationUnread,
  useLeaveConversation,
  useBlockUser,
} from '@/hooks/use-messaging'
import type { ConversationSummary } from '@/types/messaging'

type ConversationOptionsMenuProps = {
  conversation: ConversationSummary
  onDeleted?: () => void
}

export function ConversationOptionsMenu({ conversation, onDeleted }: ConversationOptionsMenuProps) {
  const router = useRouter()
  const { success } = useToast()
  const [isOpen, setIsOpen] = React.useState(false)
  const [confirmAction, setConfirmAction] = React.useState<'delete' | 'block' | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const muteMutation = useMuteConversation()
  const unreadMutation = useMarkConversationUnread()
  const leaveMutation = useLeaveConversation()
  const blockMutation = useBlockUser()

  const otherUser = conversation.other_user
  const canTargetUser = conversation.type === 'direct' && !!otherUser

  React.useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const closeMenu = () => setIsOpen(false)

  const handleViewProfile = () => {
    closeMenu()
    if (otherUser?.username) router.push(ROUTES.profile(otherUser.username))
  }

  const handleMarkUnread = () => {
    closeMenu()
    unreadMutation.mutate(conversation.id)
  }

  const handleToggleMute = () => {
    closeMenu()
    muteMutation.mutate({ conversationId: conversation.id, muted: !conversation.is_muted })
  }

  const handleConfirmDelete = () => {
    leaveMutation.mutate(conversation.id, {
      onSuccess: () => {
        success('Chat deleted')
        setConfirmAction(null)
        onDeleted?.()
      },
    })
  }

  const handleConfirmBlock = () => {
    if (!otherUser) return
    blockMutation.mutate(otherUser.user_id, {
      onSuccess: () => setConfirmAction(null),
    })
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((v) => !v)
        }}
        aria-label="Conversation options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-neutral-100 hover:text-gray-600"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-[calc(100%+4px)] z-50 w-56 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleViewProfile}
            disabled={!canTargetUser}
            className="flex w-full items-center gap-2.5 bg-primary-500 px-4 py-3 text-left text-[13px] font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <User className="h-4 w-4" />
            View Profile
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleMarkUnread}
            disabled={unreadMutation.isPending}
            className="flex w-full items-center gap-2.5 border-t border-neutral-50 px-4 py-3 text-left text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            <MailOpen className="h-4 w-4 text-neutral-400" />
            Mark as Unread
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleToggleMute}
            disabled={muteMutation.isPending}
            className="flex w-full items-center gap-2.5 border-t border-neutral-50 px-4 py-3 text-left text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            {conversation.is_muted ? (
              <Bell className="h-4 w-4 text-neutral-400" />
            ) : (
              <BellOff className="h-4 w-4 text-neutral-400" />
            )}
            {conversation.is_muted ? 'Unmute Notification' : 'Mute Notification'}
          </button>

          <button
            type="button"
            role="menuitem"
            disabled
            title="Reporting a user isn't available yet"
            className="flex w-full cursor-not-allowed items-center gap-2.5 border-t border-neutral-50 px-4 py-3 text-left text-[13px] font-medium text-neutral-300"
          >
            <Flag className="h-4 w-4 text-neutral-300" />
            Report User
            <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-400">
              Soon
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={!canTargetUser}
            onClick={() => {
              closeMenu()
              setConfirmAction('block')
            }}
            className="flex w-full items-center gap-2.5 border-t border-neutral-50 px-4 py-3 text-left text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Ban className="h-4 w-4 text-neutral-400" />
            Block User
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu()
              setConfirmAction('delete')
            }}
            className="flex w-full items-center gap-2.5 border-t border-neutral-50 px-4 py-3 text-left text-[13px] font-medium text-error-600 transition-colors hover:bg-error-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete Chat
          </button>
        </div>
      )}

      <Dialog open={confirmAction === 'delete'} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete this chat?</DialogTitle>
            <DialogDescription>
              This removes the conversation from your inbox. The other person will still see the
              message history on their end.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={leaveMutation.isPending}
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmAction === 'block'} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Block this user?</DialogTitle>
            <DialogDescription>
              They won&apos;t be able to message you or see your activity. You can unblock them
              later from Settings → Privacy &amp; Safety.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={blockMutation.isPending}
              onClick={handleConfirmBlock}
            >
              Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
