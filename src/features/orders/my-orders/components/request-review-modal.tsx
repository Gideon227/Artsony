'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { Button, Textarea } from '@/components'
import { useToast } from '@/components/ui/toaster'

interface Props {
  open: boolean
  onClose: () => void
  artworkTitle: string
}

// TODO: no review/rating service exists yet. This UI is complete and functional
// up to the point of submission — wire `handleSubmit` to the real mutation
// (e.g. useSubmitReview({ physicalId, rating, comment })) once the backend
// contract (rating scale, artwork vs seller target, endpoint) is defined.
export function RequestReviewModal({ open, onClose, artworkTitle }: Props) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { success } = useToast()

    if (!open) return null

    const handleSubmit = async () => {
        if (rating === 0) return
        setIsSubmitting(true)
        await new Promise((r) => setTimeout(r, 600)) // placeholder — replace with real mutation
        setIsSubmitting(false)
        success('Review submitted', 'Thanks for sharing your feedback.')
        setRating(0)
        setComment('')
        onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="w-full max-w-[480px] bg-white rounded-2xl border border-gray-50 p-10 relative flex flex-col gap-y-8"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-3 left-3 w-10 h-10 rounded-full border border-gray-50 flex items-center justify-center"
                    >
                        <span className="bg-gray-400 w-6 h-6 rounded-full flex items-center justify-center">
                            <X color="white" size={16} />
                        </span>
                    </button>

                    <div className="flex flex-col items-center gap-y-2 text-center pt-4">
                        <h4 className="font-raleway font-medium text-h4 text-[#333333] tracking-wide">Rate your purchase</h4>
                        <p className="font-poppins text-body-xs text-body">{artworkTitle}</p>
                    </div>

                    <div className="flex items-center justify-center gap-x-2" role="radiogroup" aria-label="Rating">
                        {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={rating === value}
                            aria-label={`${value} star${value > 1 ? 's' : ''}`}
                            onClick={() => setRating(value)}
                        >
                            <Star
                                size={32}
                                className={value <= rating ? 'fill-primary-500 text-primary-500' : 'text-gray-100'}
                            />
                        </button>
                        ))}
                    </div>

                    <Textarea
                        placeholder="Tell us about your experience (optional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />

                    <Button
                        className="mx-auto"
                        disabled={rating === 0 || isSubmitting}
                        isLoading={isSubmitting}
                        onClick={handleSubmit}
                    >
                        Submit Review
                    </Button>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}