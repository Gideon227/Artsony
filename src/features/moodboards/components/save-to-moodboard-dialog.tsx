'use client'

import * as React from 'react'
import Image from 'next/image'
import { Check, ImageIcon, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  Button,
  Spinner,
  Input,
} from '@/components'
import { SearchInput } from '@/components/ui/search-input'
import {
  useMoodboards,
  useCreateMoodboard,
  useAddToMoodboard,
  useRemoveFromMoodboard,
} from '@/hooks/use-moodboards'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

// Stable reference for the "no ids passed" case. A `= []` default parameter
// creates a NEW array on every render, which made the effect below think
// `savedMoodboardIds` changed on every single render (including the one its
// own setSavedIds call caused) — an unconditional infinite loop from mount,
// regardless of anything the user did.
const EMPTY_IDS: string[] = []

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
  savedMoodboardIds = EMPTY_IDS,
}: SaveToMoodboardDialogProps) {
  const { data: moodboards, isLoading } = useMoodboards()
  const { mutate: createMoodboard, isPending: isCreating } = useCreateMoodboard()
  const { mutate: addArtwork, isPending: isAdding } = useAddToMoodboard()
  const { mutate: removeArtwork, isPending: isRemoving } = useRemoveFromMoodboard()

  // Doubles as both the list filter and the name for a brand-new moodboard —
  // matches the design, which has one search field and a single "New"
  // button rather than a separate create-name input.
  const [query, setQuery] = React.useState('')
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set(savedMoodboardIds))

  React.useEffect(() => {
    setSavedIds(new Set(savedMoodboardIds))
  }, [savedMoodboardIds])

  // Reset the search/create field each time the dialog is (re)opened, so a
  // leftover query from a previous open doesn't linger.
  React.useEffect(() => {
    if (open) setQuery('')
  }, [open])

  const trimmedQuery = query.trim()
  const filteredMoodboards = React.useMemo(() => {
    if (!moodboards) return []
    if (!trimmedQuery) return moodboards
    return moodboards.filter((b) => b.title.toLowerCase().includes(trimmedQuery.toLowerCase()))
  }, [moodboards, trimmedQuery])

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
    if (!trimmedQuery) return
    createMoodboard(trimmedQuery, { onSuccess: () => setQuery('') })
  }
  
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
          />

          {/* Modal Box - Animates from bottom to center */}
            <motion.div
              initial={{ opacity: 0, y: 120, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative z-10 w-full max-w-141 bg-white rounded-2xl px-10 py-16 flex flex-col items-center gap-y-12"
            >
              {/* Close Button */}
              <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-6 left-6 w-10 h-10 hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Close modal"
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="path-1-inside-1_9075_36470" fill="white">
                      <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                  </mask>
                  <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_9075_36470)"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill="#525965"/>
                </svg>
              </button>

              {/* Title */}
              <h2 className="text-h4 font-medium text-[#333333] text-center mb-14 font-raleway">
                Moodboard
              </h2>

              <div className='flex items-center justify-center gap-4'>
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  onSearch={handleCreate}
                  placeholder="Search"
                  leftIconPath="/home/magnifier.svg"
                  className="h-12 flex-1"
                />

                <Button
                  onClick={handleCreate}
                  isLoading={isCreating}
                  disabled={!trimmedQuery}
                  leftIcon="/icons/plus-white-bg.svg"
                  className='w-[115px]'
                >
                  New
                </Button>
              </div>

              
         {/* List */}
         <div className="flex flex-col overflow-y-auto pr-2 w-full">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : filteredMoodboards.length > 0 ? (
                filteredMoodboards.map((board) => {
                  const isSaved = savedIds.has(board.id)
                   return (
                      <button
                        key={board.id}
                        type="button"
                        onClick={() => toggle(board.id)}
                        disabled={isAdding || isRemoving}
                        className="flex items-center gap-4 p-4 w-full disabled:opacity-60"
                      >
                        <span className="relative h-22 w-22 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                          <span className="flex h-full w-full items-center justify-center text-gray-200">
                            <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
                          </span>
                        </span>

                        <span className="flex-1 w-full truncate font-poppins font-medium text-left text-body-s text-body">
                          &quot;{board.title}&quot;
                        </span>

                        <span
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full bg-primary-500',
                          )}
                        >
                          {isSaved ? (
                            <Check className="h-4 w-4 text-white" strokeWidth={3} />
                          ) : (
                            <Image src="/icons/plus-white-bg.svg" width={24} height={24} alt="" aria-hidden="true" />
                          )}
                        </span>
                      </button>
                    )
                  })
                ) : moodboards && moodboards.length > 0 ? (
                  <p className="text-sm text-gray-300 py-6 text-center font-sans">
                    No moodboards match &quot;{trimmedQuery}&quot; — press New to create it.
                  </p>
                ) : (
                  <p className="text-sm text-gray-300 py-6 text-center font-sans">
                    You don&apos;t have any moodboards yet — type a name above and press New.
                  </p>
                )}
              </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}