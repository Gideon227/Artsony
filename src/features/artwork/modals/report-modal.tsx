'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info } from 'lucide-react'
import { Button, Textarea } from '@/components'
import { useReportArtwork } from '@/hooks/use-artwork'

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment or Bullying' },
  { value: 'COPYRIGHT', label: 'Copyright Infringement' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content' },
  { value: 'MISLEADING', label: 'False or Misleading Information' },
  { value: 'OTHER', label: 'Others' },
] as const

type ReportReason = (typeof REPORT_REASONS)[number]['value']

const NOTES_MAX = 1000

type ReportModalProps = {
  artworkId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ReportModal = ({ artworkId, open, onOpenChange }: ReportModalProps) => {
  const [step, setStep] = React.useState<'reasons' | 'notes'>('reasons')
  const [selectedReason, setSelectedReason] = React.useState<ReportReason | null>(null)
  const [notes, setNotes] = React.useState('')

  const { mutate: submitReport, isPending } = useReportArtwork()

  const handleExitComplete = () => {
    setStep('reasons')
    setSelectedReason(null)
    setNotes('')
  }

  const handleSelectReason = (value: ReportReason) => {
    setSelectedReason(value)
    if (value === 'OTHER') setStep('notes')
  }

  const handleSubmit = () => {
    if (!selectedReason) return
    if (selectedReason === 'OTHER' && !notes.trim()) return

    submitReport(
      { id: artworkId, reason: selectedReason, notes: selectedReason === 'OTHER' ? notes.trim() : undefined },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  const canSubmitReasons = selectedReason !== null && selectedReason !== 'OTHER'
  const canSubmitNotes = notes.trim().length > 0

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {open && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Report artwork"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-[564px] flex-col gap-y-8 overflow-hidden rounded-2xl bg-white px-10 py-12"
          >
            <div className="absolute top-8 left-8">
              <div className="relative flex h-10 shrink-0 items-center justify-center">
                {step === 'notes' && (
                  <button
                    type="button"
                    aria-label="Back to reasons"
                    onClick={() => setStep('reasons')}
                    className="cursor-pointer"
                  >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <mask id="path-1-inside-1" fill="white">
                        <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" />
                      </mask>
                      <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1)" />
                      <path d="M28 20H12M18 26L12 20L18 14" stroke="#525965" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}

                {step === 'reasons' && (
                  <button
                    type="button"
                    aria-label="Close modal"
                    onClick={() => onOpenChange(false)}
                    className="cursor-pointer"
                  >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <mask id="path-2-inside-2" fill="white">
                        <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" />
                      </mask>
                      <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-2-inside-2)" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill="#525965" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <h2 className="shrink-0 text-center font-raleway text-h4 font-medium text-[#333333]">Report Artwork</h2>

            {step === 'reasons' ? (
              <>
                <div className="flex-1 overflow-y-auto">
                  {REPORT_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason.value
                    return (
                      <button
                        key={reason.value}
                        type="button"
                        onClick={() => handleSelectReason(reason.value)}
                        className="flex w-full cursor-pointer items-center justify-between border-b border-neutral-50 p-6 text-left last:border-b-0"
                      >
                        <span className="font-poppins text-body-s font-medium tracking-wide text-body">
                          {reason.label}
                        </span>
                        <span
                          className={
                            isSelected
                              ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white'
                              : 'h-7 w-7 shrink-0 rounded-full border border-neutral-200'
                          }
                        >
                          {isSelected && <Check className="h-4 w-4" strokeWidth={3} />}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <p className="shrink-0 px-6 text-center font-poppins text-body-s leading-6 text-body">
                  View Artsony&apos;s{' '}
                  <a href="/community-guidelines" className="font-medium text-primary-500 underline">
                    community guidelines
                  </a>{' '}
                  to know what is acceptable to post.
                </p>

                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmitReasons}
                  isLoading={isPending}
                  rightIcon="/icons/info-circle-white.svg"
                  className="mx-auto h-14 w-full max-w-[280px] shrink-0 rounded-full font-poppins text-base font-semibold"
                >
                  Report
                </Button>
              </>
            ) : (
              <>
                <p className="shrink-0 text-center font-poppins text-[14px] text-body">
                  Please tell us more about why you&apos;re reporting this post.
                </p>

                <div className="-mt-2 flex flex-col gap-y-2">
                  <p className="font-poppins text-body-s font-semibold text-heading">Others</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
                    placeholder="Placeholder"
                    wrapperClassName="mt-3"
                    className="h-44 resize-y"
                  />
                  <p className="mt-2 font-poppins text-xs text-neutral-300">
                    {notes.length}/{NOTES_MAX} characters
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmitNotes}
                  isLoading={isPending}
                  rightIcon="/icons/info-circle-white.svg"
                  className="mx-auto mt-2 h-14 w-full max-w-[280px] shrink-0 rounded-full font-poppins text-base font-semibold"
                >
                  Report
                </Button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ReportModal