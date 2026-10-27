'use client'

import * as React from 'react'
import Image from 'next/image'
import { Check, ImageIcon, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, Spinner } from '@/components'
import { SearchInput } from '@/components/ui/search-input'
import { useDebouncedValue } from '@/hooks/queries/use-debounce'
import {
  useAddToMoodboard,
  useArtworkMoodboardMembership,
  useMoodboards,
} from '@/hooks/use-moodboards'
import { HttpError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { CreateMoodboardDialog } from './create-moodboard-dialog'

const SEARCH_DEBOUNCE_MS = 300

// Stable reference for the "no ids passed" case — a `= []` default would be a
// new array every render.
const EMPTY_IDS: string[] = []

type SaveToMoodboardDialogProps = {
  artworkId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  // Ids of moodboards this artwork is already saved to, if the caller knows
  // them. The dialog also works this out itself, so this is optional.
  savedMoodboardIds?: string[]
}

export function SaveToMoodboardDialog({
  artworkId,
  open,
  onOpenChange,
  savedMoodboardIds = EMPTY_IDS,
}: SaveToMoodboardDialogProps) {
  const { data: moodboards, isLoading } = useMoodboards()
  const { mutateAsync: addArtwork } = useAddToMoodboard()

  const [query, setQuery] = React.useState('')
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)
  const [createOpen, setCreateOpen] = React.useState(false)

  // Saved during this session (covers the gap before the membership refetch lands).
  const [sessionSavedIds, setSessionSavedIds] = React.useState<Set<string>>(() => new Set())
  const [pendingIds, setPendingIds] = React.useState<Set<string>>(() => new Set())
  // Synchronous guard: state updates are async, so a fast double-click could
  // otherwise fire two add requests for the same board.
  const inFlightRef = React.useRef<Set<string>>(new Set())

  const knownSavedIds = React.useMemo(() => new Set(savedMoodboardIds), [savedMoodboardIds])

  // A different artwork (e.g. next/previous in the overlay) starts clean.
  React.useEffect(() => {
    setSessionSavedIds(new Set())
  }, [artworkId])

  // Start fresh each time the dialog closes.
  React.useEffect(() => {
    if (!open) {
      setQuery('')
      setCreateOpen(false)
    }
  }, [open])

  const normalizedQuery = debouncedQuery.trim().toLowerCase()
  const filteredMoodboards = React.useMemo(() => {
    if (!moodboards) return []
    if (!normalizedQuery) return moodboards
    return moodboards.filter((b) => b.title.toLowerCase().includes(normalizedQuery))
  }, [moodboards, normalizedQuery])

  const visibleIds = React.useMemo(() => filteredMoodboards.map((b) => b.id), [filteredMoodboards])
  const { containing, checking } = useArtworkMoodboardMembership(artworkId, visibleIds, open)

  const isSaved = (id: string) => knownSavedIds.has(id) || sessionSavedIds.has(id) || containing.has(id)

  const markSaved = (id: string) => setSessionSavedIds((prev) => new Set(prev).add(id))

  const handleSelect = async (moodboardId: string) => {
    // Never add the same artwork to the same moodboard twice.
    if (isSaved(moodboardId) || inFlightRef.current.has(moodboardId)) return

    inFlightRef.current.add(moodboardId)
    setPendingIds((prev) => new Set(prev).add(moodboardId))
    try {
      await addArtwork({ moodboardId, artworkId })
      markSaved(moodboardId)
    } catch (err) {
      // The server already has it (e.g. saved from another tab): treat as saved.
      if (err instanceof HttpError && err.statusCode === 409) markSaved(moodboardId)
    } finally {
      inFlightRef.current.delete(moodboardId)
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(moodboardId)
        return next
      })
    }
  }

  return (
    <>
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
                  <path fillRule="evenodd" clipRule="evenodd" d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill="#525965"/>
                </svg>
              </button>

              {/* Title */}
              <h2 className="text-h4 font-medium text-[#d35c5c] text-center font-raleway">
                Moodboard
              </h2>

              <div className="flex items-center justify-center gap-4 w-full">
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Search"
                  leftIconPath="/home/magnifier.svg"
                  aria-label="Search your moodboards"
                  className="h-12 flex-1"
                />

                {/* Always active — opens the create-moodboard modal */}
                <Button
                  onClick={() => setCreateOpen(true)}
                  leftIcon="/icons/plus-white-bg.svg"
                  className="w-[115px]"
                >
                  New
                </Button>
              </div>

              {/* List */}
              <div className="flex max-h-[min(24rem,45dvh)] w-full flex-col overflow-y-auto pr-2">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="md" />
                  </div>
                ) : filteredMoodboards.length > 0 ? (
                  filteredMoodboards.map((board) => {
                    const saved = isSaved(board.id)
                    const pending = pendingIds.has(board.id)
                    const resolving = !saved && checking.has(board.id)

                    return (
                      <button
                        key={board.id}
                        type="button"
                        onClick={() => handleSelect(board.id)}
                        disabled={saved || pending || resolving}
                        aria-label={saved ? `${board.title} — already saved` : `Save to ${board.title}`}
                        className={cn(
                          'flex items-center gap-4 p-4 w-full',
                          saved ? 'cursor-default' : 'cursor-pointer',
                          (pending || resolving) && 'opacity-60',
                        )}
                      >
                        <span className="relative h-22 w-22 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                          {board.cover_thumbnail_url ? (
                            <Image src={board.cover_thumbnail_url} alt="" fill sizes="88px" className="object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-gray-200">
                              <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
                            </span>
                          )}
                        </span>

                        <span className="flex-1 w-full truncate font-poppins font-medium text-left text-body-s text-body">
                          &quot;{board.title}&quot;
                        </span>

                        <span
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                            saved ? 'bg-successful-500' : 'bg-primary-500',
                          )}
                        >
                          {pending || resolving ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                          ) : saved ? (
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
                    No moodboards match &quot;{query.trim()}&quot;.
                  </p>
                ) : (
                  <p className="text-sm text-gray-300 py-6 text-center font-sans">
                    You don&apos;t have any moodboards yet — tap New to create one.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateMoodboardDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}