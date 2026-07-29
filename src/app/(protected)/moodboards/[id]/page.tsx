'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { Trash2, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Button, Input, Spinner, ErrorState, EmptyState } from '@/components'
import {
  useMoodboard,
  useUpdateMoodboard,
  useDeleteMoodboard,
  useRemoveFromMoodboard,
} from '@/hooks/use-moodboards'
import { pickMoodboardThumbnail } from '@/features/moodboards/utils'

export default function MoodboardDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const { data: moodboard, isLoading, isError, refetch } = useMoodboard(id)
  const { mutate: updateMoodboard, isPending: isRenaming } = useUpdateMoodboard()
  const { mutate: deleteMoodboard, isPending: isDeleting } = useDeleteMoodboard()
  const { mutate: removeArtwork } = useRemoveFromMoodboard()

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')

  const startEditing = () => {
    if (!moodboard) return
    setTitleDraft(moodboard.title)
    setIsEditingTitle(true)
  }

  const commitTitle = () => {
    const trimmed = titleDraft.trim()
    if (!trimmed || !moodboard || trimmed === moodboard.title) {
      setIsEditingTitle(false)
      return
    }
    updateMoodboard(
      { id: moodboard.id, title: trimmed },
      { onSuccess: () => setIsEditingTitle(false) },
    )
  }

  const handleDelete = () => {
    if (!moodboard) return
    if (!window.confirm(`Delete "${moodboard.title}"? This can't be undone.`)) return
    deleteMoodboard(moodboard.id, { onSuccess: () => router.push('/moodboards') })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !moodboard) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-24">
          <ErrorState
            title="Couldn't load this moodboard"
            description="It may have been deleted, or you may not have access."
            onRetry={() => refetch()}
          />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <button
          onClick={() => router.push('/moodboards')}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All moodboards
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {isEditingTitle ? (
            <Input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => e.key === 'Enter' && commitTitle()}
              disabled={isRenaming}
              className="h-12 max-w-md text-lg font-semibold"
            />
          ) : (
            <h1
              onClick={startEditing}
              className="font-raleway font-semibold text-[28px] text-neutral-700 cursor-pointer hover:text-primary-500 transition-colors"
              title="Click to rename"
            >
              {moodboard.title}
            </h1>
          )}

          <Button
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            onClick={handleDelete}
            leftIcon='/icons/trash-red.svg'
          >
            Delete board
          </Button>
        </div>

        {moodboard.artworks.length === 0 ? (
          <EmptyState
            title="This board is empty"
            description="Save artworks here from any artwork page using the moodboard icon."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {moodboard.artworks.map((artwork) => {
              const thumbnail = pickMoodboardThumbnail(artwork);
              return (
                <div
                  key={artwork.id}
                  className="group relative rounded-[24px] overflow-hidden aspect-square bg-neutral-100"
                >
                  {thumbnail && (
                    <Image src={thumbnail} alt={artwork.title} fill className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <button
                    onClick={() => removeArtwork({ moodboardId: moodboard.id, artworkId: artwork.id })}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${artwork.title} from moodboard`}
                  >
                    <Trash2 className="h-4 w-4 text-error-500" />
                  </button>
                  <span className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {artwork.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
