'use client'

import * as React from 'react'
import { Plus, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Spinner,
} from '@/components'
import {
  useMoodboards,
  useCreateMoodboard,
  useAddToMoodboard,
  useRemoveFromMoodboard,
} from '@/hooks/use-moodboards'
import { cn } from '@/lib/utils'

type SaveToMoodboardDialogProps = {
  artworkId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  // Ids of moodboards this artwork is already saved to, if the caller knows
  // them — lets the dialog render checked state without an extra fetch.
  savedMoodboardIds?: string[]
}

export function SaveToMoodboardDialog({
  artworkId,
  open,
  onOpenChange,
  savedMoodboardIds = [],
}: SaveToMoodboardDialogProps) {
  const { data: moodboards, isLoading } = useMoodboards()
  const { mutate: createMoodboard, isPending: isCreating } = useCreateMoodboard()
  const { mutate: addArtwork, isPending: isAdding } = useAddToMoodboard()
  const { mutate: removeArtwork, isPending: isRemoving } = useRemoveFromMoodboard()

  const [newTitle, setNewTitle] = React.useState('')
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set(savedMoodboardIds))

  React.useEffect(() => {
    setSavedIds(new Set(savedMoodboardIds))
  }, [savedMoodboardIds])

  const toggle = (moodboardId: string) => {
    const wasSaved = savedIds.has(moodboardId)

    setSavedIds((prev) => {
      const next = new Set(prev)
      if (wasSaved) next.delete(moodboardId)
      else next.add(moodboardId)
      return next
    })

    if (wasSaved) {
      removeArtwork(
        { moodboardId, artworkId },
        { onError: () => setSavedIds((prev) => new Set(prev).add(moodboardId)) },
      )
    } else {
      addArtwork(
        { moodboardId, artworkId },
        {
          onError: () =>
            setSavedIds((prev) => {
              const next = new Set(prev)
              next.delete(moodboardId)
              return next
            }),
        },
      )
    }
  }

  const handleCreate = () => {
    const title = newTitle.trim()
    if (!title) return
    createMoodboard(title, { onSuccess: () => setNewTitle('') })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Save to moodboard</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : moodboards && moodboards.length > 0 ? (
            moodboards.map((board) => {
              const isSaved = savedIds.has(board.id)
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => toggle(board.id)}
                  disabled={isAdding || isRemoving}
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors',
                    isSaved
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:bg-neutral-50',
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-800">{board.title}</span>
                    <span className="text-xs text-neutral-400">
                      {board.artwork_count} artwork{board.artwork_count === 1 ? '' : 's'}
                    </span>
                  </div>
                  {isSaved && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              )
            })
          ) : (
            <p className="text-sm text-neutral-400 py-6 text-center">
              You don&apos;t have any moodboards yet — create your first one below.
            </p>
          )}
        </div>

        <DialogFooter className="flex-col items-stretch gap-2 sm:flex-row">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New moodboard name"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex-1 h-11"
          />
          <Button
            onClick={handleCreate}
            isLoading={isCreating}
            disabled={!newTitle.trim()}
            leftIcon='/icons/plus-white-bg.svg'
            className="shrink-0"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
