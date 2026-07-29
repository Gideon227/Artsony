'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Button, Input, Spinner, EmptyState, ErrorState } from '@/components'
import { useMoodboards, useCreateMoodboard } from '@/hooks/use-moodboards'

export default function MoodboardsPage() {
  const { data: moodboards, isLoading, isError, refetch } = useMoodboards()
  const { mutate: createMoodboard, isPending } = useCreateMoodboard()
  const [title, setTitle] = useState('')

  const handleCreate = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    createMoodboard(trimmed, { onSuccess: () => setTitle('') })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="font-raleway font-semibold text-[28px] text-neutral-700">My Moodboards</h1>

          <div className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New moodboard name"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="h-11 w-64"
            />
            <Button
              onClick={handleCreate}
              isLoading={isPending}
              disabled={!title.trim()}
              leftIcon='/icons/plus-white-bg.svg'
            >
              Create
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <ErrorState
            description="Could not load your moodboards. Check your connection and try again."
            onRetry={() => refetch()}
          />
        ) : !moodboards || moodboards.length === 0 ? (
          <EmptyState
            title="No moodboards yet"
            description="Create one above and start saving artworks you love."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {moodboards.map((board) => (
              <Link
                key={board.id}
                href={`/moodboards/${board.id}`}
                className="flex flex-col gap-2 rounded-[24px] border border-neutral-100 bg-white p-5 shadow-[var(--shadow-card)] hover:border-primary-200 transition-colors"
              >
                <span className="text-base font-semibold text-neutral-800 truncate">{board.title}</span>
                <span className="text-sm text-neutral-400">
                  {board.artwork_count} artwork{board.artwork_count === 1 ? '' : 's'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
