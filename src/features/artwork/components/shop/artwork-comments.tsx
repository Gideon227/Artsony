'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useComments, useCreateComment } from '@/hooks/use-comments'
import { useAuthStore } from '@/store/auth.store'

const MAX_LENGTH = 1000

function formatShortDate(value: string): string {
  const d = new Date(value)
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`
}

interface ArtworkCommentsProps {
  artworkId: string
}

export function ArtworkComments({ artworkId }: ArtworkCommentsProps) {
  const [body, setBody] = useState('')
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useComments(artworkId)
  const createComment = useCreateComment(artworkId)

  const comments = data?.data ?? []
  const total = data?.total ?? 0

  const handleSend = () => {
    const trimmed = body.trim()
    if (!trimmed || createComment.isPending) return
    createComment.mutate({ body: trimmed }, { onSuccess: () => setBody('') })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Composer */}
      <div className="flex gap-4">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100">
          <Image
            src={user?.avatarUrl || '/images/image-avatar.svg'}
            alt={user?.username ?? 'You'}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="rounded-[24px] border border-gray-100 p-5">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, MAX_LENGTH))}
              placeholder="Leave a comment"
              rows={3}
              className="w-full resize-none bg-transparent font-poppins text-[14px] text-gray-700 placeholder:text-gray-300 outline-none"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-poppins text-[12px] text-gray-300">
              {MAX_LENGTH} characters max
            </span>
            <button
              onClick={handleSend}
              disabled={!body.trim() || createComment.isPending}
              className="rounded-full bg-primary-500 px-8 py-2.5 font-poppins text-[14px] font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createComment.isPending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div>
        <h3 className="mb-4 font-poppins text-[16px] font-semibold text-gray-800">
          Comments <span className="text-primary-500">({total.toLocaleString()})</span>
        </h3>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-50" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="font-poppins text-[14px] text-gray-400">
            No comments yet — be the first to say something.
          </p>
        ) : (
          <div className="flex max-h-[360px] flex-col gap-5 overflow-y-auto pr-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100">
                  <Image
                    src={comment.author.avatar_url || '/images/image-avatar.svg'}
                    alt={comment.author.display_name || comment.author.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-poppins text-[14px] font-semibold text-gray-800">
                      {comment.author.display_name || comment.author.username}
                    </span>
                    <span className="font-poppins text-[12px] text-gray-300">
                      {formatShortDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 font-poppins text-[13px] leading-5 text-gray-500">
                    {comment.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
