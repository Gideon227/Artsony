'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
} from './bottom-sheet'
import { useDeleteArtwork } from '@/hooks/use-artwork'

interface DeleteConfirmSheetProps {
  artworkId: string
  artworkTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteConfirmSheet({ artworkId, artworkTitle, open, onOpenChange }: DeleteConfirmSheetProps) {
  const { mutate: deleteArtwork, isPending } = useDeleteArtwork()

  const handleConfirm = () => {
    deleteArtwork(artworkId, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent onClick={(e) => e.stopPropagation()}>
        <BottomSheetHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <BottomSheetTitle>Delete &ldquo;{artworkTitle}&rdquo;?</BottomSheetTitle>
          <BottomSheetDescription>
            This permanently removes the artwork, including its likes, comments, and saves. This can&apos;t be undone.
          </BottomSheetDescription>
        </BottomSheetHeader>

        <BottomSheetFooter className="mt-2 sm:mt-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-11 flex-1 rounded-full border border-neutral-200 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 sm:flex-none sm:px-6"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-500 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60 sm:flex-none sm:px-6"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  )
}