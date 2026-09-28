'use client'

import { useState } from 'react'
import { FolderPlus, Check, Loader2, Plus } from 'lucide-react'
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
} from './bottom-sheet'
import { useMoodboards, useAddToMoodboard, useCreateMoodboard } from '@/hooks/use-moodboards'
import { cn } from '@/utils'

interface MoodboardPickerSheetProps {
  artworkId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MoodboardPickerSheet({ artworkId, open, onOpenChange }: MoodboardPickerSheetProps) {
  const { data: moodboards, isLoading, isError } = useMoodboards()
  const { mutate: addToMoodboard, isPending: isAdding, variables } = useAddToMoodboard()
  const { mutate: createMoodboard, isPending: isCreating } = useCreateMoodboard()
  const [newTitle, setNewTitle] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)

  const handleSelect = (moodboardId: string) => {
    if (isAdding) return
    addToMoodboard(
      { moodboardId, artworkId },
      { onSuccess: () => setSavedId(moodboardId) }
    )
  }

  const handleCreateAndAdd = () => {
    const title = newTitle.trim()
    if (!title || isCreating) return
    createMoodboard(title, {
      onSuccess: (res) => {
        setNewTitle('')
        handleSelect(res.data.id)
      },
    })
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent onClick={(e) => e.stopPropagation()}>
        <BottomSheetHeader>
          <BottomSheetTitle>Save to moodboard</BottomSheetTitle>
          <BottomSheetDescription>Choose a moodboard to add this artwork to.</BottomSheetDescription>
        </BottomSheetHeader>

        <div className="flex flex-col gap-2 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
              placeholder="New moodboard name"
              maxLength={100}
              className="h-11 flex-1 rounded-[var(--radius-lg)] border border-neutral-200 px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreateAndAdd}
              disabled={!newTitle.trim() || isCreating}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              aria-label="Create moodboard and save"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8 text-neutral-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {isError && (
            <p className="py-4 text-center text-sm text-red-500">Could not load your moodboards.</p>
          )}

          {!isLoading && !isError && moodboards?.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-400">
              You don&apos;t have any moodboards yet — create one above.
            </p>
          )}

          {moodboards?.map((board) => {
            const isThisPending = isAdding && variables?.moodboardId === board.id
            const isSaved = savedId === board.id
            return (
              <button
                key={board.id}
                type="button"
                onClick={() => handleSelect(board.id)}
                disabled={isAdding}
                className={cn(
                  'flex items-center gap-3 rounded-[var(--radius-lg)] border border-neutral-100 px-4 py-3 text-left transition-colors',
                  'hover:border-primary-200 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                  <FolderPlus className="h-4.5 w-4.5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-neutral-800">{board.title}</span>
                  <span className="text-xs text-neutral-400">{board.artwork_count} artwork{board.artwork_count === 1 ? '' : 's'}</span>
                </div>
                {isThisPending && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary-500" />}
                {isSaved && !isThisPending && <Check className="h-4 w-4 shrink-0 text-primary-500" />}
              </button>
            )
          })}
        </div>
      </BottomSheetContent>
    </BottomSheet>
  )
}