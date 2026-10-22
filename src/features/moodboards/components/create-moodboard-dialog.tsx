'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { Button, Input } from '@/components'
import { useCreateMoodboard } from '@/hooks/use-moodboards'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (moodboardId: string) => void
}

// Smooth "iOS-sheet" style easing
const EASE = [0.32, 0.72, 0, 1] as const

export function CreateMoodboardDialog({ open, onOpenChange, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useReducedMotion()
  const { mutate: createMoodboard, isPending } = useCreateMoodboard()

  // Portal target only exists on the client
  useEffect(() => setMounted(true), [])

  // Lock page scroll + close on Escape while open
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  // Start fresh every time the modal closes
  useEffect(() => {
    if (!open) setTitle('')
  }, [open])

  const handleCreate = () => {
    const trimmed = title.trim()
    if (!trimmed || isPending) return
    createMoodboard(trimmed, {
      onSuccess: (res) => {
        setTitle('')
        onOpenChange(false)
        onCreated?.(res.data.id)
      },
    })
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          key="create-moodboard-modal"
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />

          {/* Panel — slides up from the bottom of the screen */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-moodboard-title"
            className="relative flex h-auto max-h-screen w-full flex-col gap-y-12 rounded-t-2xl bg-white px-6 py-16 sm:max-h-screen sm:max-w-[564px] sm:rounded-2xl sm:px-10"
            initial={reduceMotion ? { opacity: 0 } : { y: '100vh' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100vh' }}
            transition={{ duration: reduceMotion ? 0.15 : 0.45, ease: EASE }}
          >
            <button
              type="button"
              aria-label="Back"
              className="absolute left-6 top-6 sm:left-10 sm:top-10 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="path-1-inside-1_9108_30125" fill="white">
                  <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" />
                </mask>
                <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_9108_30125)" />
                <path d="M28 20H12M18 26L12 20L18 14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#525965" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Close"
              className="absolute right-6 top-6 sm:right-10 sm:top-10 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="path-1-inside-1_9109_30198" fill="white">
                  <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" />
                </mask>
                <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_9109_30198)" />
                <path d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fillRule="evenodd" clipRule="evenodd" fill="#525965" />
              </svg>
            </button>

            <h2
              id="create-moodboard-title"
              className="text-center font-raleway text-h4 font-medium text-[#333333]"
            >
              New Moodboard
            </h2>

            <div className="relative w-full items-center justify-center flex p-6">
              <Image src="/images/moodboard.png" width={222} height={200} className='rounded-2xl' alt="moodboard default image" />
            </div>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Living Room Designs"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />

            <div className="flex items-center justify-center w-full">
              <Button
                onClick={handleCreate}
                isLoading={isPending}
                disabled={!title.trim()}
              >
                Create 
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}