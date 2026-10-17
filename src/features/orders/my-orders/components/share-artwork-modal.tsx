'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Link2, X } from 'lucide-react'
import { useToast } from '@/components/ui/toaster'
import Image from 'next/image'

interface Props {
  open: boolean
  onClose: () => void
  artworkSlug: string
  artworkTitle: string
}

interface Channel {
  id: string
  label: string
  icon: string;
  buildShareUrl?: (url: string, title: string) => string
}

const CHANNELS: Channel[] = [
  { id: 'behance', label: 'Behance', icon: "/socials/behance.svg" },
  // {
  //   id: 'whatsapp',
  //   label: 'WhatsApp',
  //   icon: "/socials/b",
  //   buildShareUrl: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  // },
  { id: 'instagram', label: 'Instagram', icon: "/socials/instagram.svg" },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: "/socials/facebook.svg",
    buildShareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'twitter',
    label: 'Twitter',
    icon: "/socials/twitter.svg",
    buildShareUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: "/socials/linkedin.svg",
    buildShareUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  // { id: 'dribbble', label: 'Dribbble', icon: "/socials/dribbble.svg" },
]

const COPIED_RESET_MS = 2000

function CopyGlyph() {
  return (
    <span className="relative block w-7 h-7" aria-hidden>
      <span className="absolute left-0 top-0 w-5 h-5 rounded-md bg-gray-400" />
      <span className="absolute right-0 bottom-0 w-5 h-5 rounded-md bg-primary-500" />
    </span>
  )
}

export function ShareArtworkModal({ open, onClose, artworkSlug, artworkTitle }: Props) {
  const [copied, setCopied] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const { success, error, info } = useToast()

  const shareUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/artworks/${artworkSlug}`

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), COPIED_RESET_MS)
    return () => clearTimeout(timeout)
  }, [copied])

  const copyLink = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      return true
    } catch {
      error('Could not copy the link', 'Copy it manually from the field above.')
      return false
    }
  }, [shareUrl, error])

  const handleChannel = async (channel: Channel) => {
    if (channel.buildShareUrl) {
      window.open(channel.buildShareUrl(shareUrl, artworkTitle), '_blank', 'noopener,noreferrer')
      return
    }
    if (await copyLink()) info('Link copied', `Paste it into ${channel.label} to share this artwork.`)
  }

  const handleCopy = async () => {
    if (await copyLink()) success('Link copied')
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="relative w-full max-w-[564px] bg-white rounded-[40px] border border-gray-50 px-10 pt-10 pb-14 flex flex-col gap-y-12"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-8 right-8 w-12 h-12 rounded-full border-2 border-gray-50 flex items-center justify-center"
          >
            <span className="bg-gray-400 w-7 h-7 rounded-full flex items-center justify-center">
              <X color="white" size={16} />
            </span>
          </button>

          <h4 id="share-title" className="font-raleway font-medium text-h4 text-[#333333] tracking-wide text-center">
            Share
          </h4>

          <div className="flex items-center gap-x-3 border border-gray-50 rounded-full px-6 py-4">
            <Link2 size={24} className="text-body shrink-0" aria-hidden />
            <input
              readOnly
              value={shareUrl}
              aria-label="Artwork link"
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 bg-transparent font-poppins text-body-s text-body tracking-wide truncate outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Link copied' : 'Copy link'}
              className="shrink-0 w-8 h-8 flex items-center justify-center"
            >
              {copied ? <Check size={24} className="text-successful-500" /> : <CopyGlyph />}
            </button>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-3" aria-label="Share on">
            {CHANNELS.map((channel) => (
              <li key={channel.id}>
                <button
                  type="button"
                  onClick={() => void handleChannel(channel)}
                  aria-label={`Share on ${channel.label}`}
                  className="w-12 h-12 relative rounded-full bg-primary-500 text-white flex items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  <Image src={channel.icon} fill alt='icon' />
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
