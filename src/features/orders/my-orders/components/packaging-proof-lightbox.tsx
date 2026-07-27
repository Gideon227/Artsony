'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ImageOff } from 'lucide-react'
import Image from 'next/image'
import type { DeliveryProof } from '@/types/order'

interface Props {
  proofs: DeliveryProof[]
  startIndex?: number
  open: boolean
  onClose: () => void
}


export function PackagingProofLightbox({ proofs, startIndex = 0, open, onClose }: Props) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (open) setIndex(startIndex)
    }, [open, startIndex])

    useEffect(() => {
        if (!open) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, proofs.length - 1))
            if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [open, proofs.length, onClose])

    if (!open) return null
    const current = proofs[index]

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
                role="dialog"
                aria-modal="true"
                aria-label="Packaging proof"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <button
                type="button"
                onClick={onClose}
                aria-label="Close packaging proof"
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                <X size={20} className="text-white" />
                </button>

                {proofs.length === 0 ? (
                <div className="flex flex-col items-center gap-y-3 text-center px-6">
                    <ImageOff size={40} className="text-white/60" />
                    <p className="font-poppins text-body-s text-white">No packaging proof has been uploaded for this order yet.</p>
                </div>
                ) : (
                <div className="flex items-center gap-x-4 max-w-[90vw]">
                    {proofs.length > 1 && (
                    <button
                        type="button"
                        onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                        disabled={index === 0}
                        aria-label="Previous image"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center shrink-0"
                    >
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    )}

                    <div className="relative w-[480px] h-[480px] max-w-full rounded-xl overflow-hidden bg-gray-800">
                    <Image src={current?.secure_url as string} alt={`Packaging proof ${index + 1}`} fill sizes="480px" className="object-contain" />
                    </div>

                    {proofs.length > 1 && (
                    <button
                        type="button"
                        onClick={() => setIndex((i) => Math.min(i + 1, proofs.length - 1))}
                        disabled={index === proofs.length - 1}
                        aria-label="Next image"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center shrink-0"
                    >
                        <ChevronRight size={20} className="text-white" />
                    </button>
                    )}
                </div>
                )}

                {proofs.length > 1 && (
                <p className="absolute bottom-6 font-poppins text-body-xs text-white/70">
                    {index + 1} / {proofs.length}
                </p>
                )}
            </motion.div>
        </AnimatePresence>
    )
}