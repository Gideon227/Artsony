'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AlertTriangle, Clock, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components'
import { cn } from '@/lib/utils'
import type { SellerRegistration } from '@/services/seller.service'

interface ApplicationStatusProps {
    registration: SellerRegistration
    onResubmit: () => void
}

const SUPPORT_EMAIL = 'support@artsony.io'

const CARD = 'mx-auto w-full max-w-3xl border border-gray-50 rounded-2xl flex flex-col items-center justify-center gap-y-10 px-4 py-10 sm:px-12 md:px-26 md:py-16'
const TITLE = 'font-raleway font-semibold text-h5 tracking-wide text-center'
const BODY = 'font-poppins text-body-s text-body tracking-wide leading-6 text-center'
const ICON_CIRCLE = 'p-2 rounded-full w-25 h-25 flex items-center justify-center'
const ACTIONS = 'flex flex-col-reverse sm:flex-row items-center justify-center gap-4 w-full'
const LINK_BUTTON = 'w-full sm:w-auto'

const Notes = ({ notes }: { notes: string | null }) =>
    notes?.trim() ? (
        <div className='w-full rounded-xl bg-secondary-50 p-4 text-left'>
            <p className='font-poppins text-body-xs font-medium text-heading tracking-wide'>Note from our team</p>
            <p className='mt-1 font-poppins text-body-xs text-body tracking-wide leading-5 whitespace-pre-line break-words'>
                {notes.trim()}
            </p>
        </div>
    ) : null

const ApplicationStatus = ({ registration, onResubmit }: ApplicationStatusProps) => {
    const firstName = registration.full_name.trim().split(/\s+/)[0] ?? ''

    if (registration.status === 'PENDING') {
        return (
            <div className={CARD} role='status' aria-live='polite'>
                <div className={cn(ICON_CIRCLE, 'bg-primary-500')}>
                    <Clock color='#fff' size={48} />
                </div>
                <div className='flex flex-col items-center gap-y-4'>
                    <h5 className={cn(TITLE, 'text-primary-500')}>Application Under Review</h5>
                    <p className={BODY}>
                        Thanks, {firstName}. Our team is reviewing your seller application. We&apos;ll email{' '}
                        <span className='text-primary-500 break-all'>{registration.email}</span> as soon as a decision is made.
                        This page updates automatically.
                    </p>
                </div>
                <div className={ACTIONS}>
                    <Link href='/home' className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), LINK_BUTTON)}>
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    if (registration.status === 'APPROVED') {
        return (
            <div className={CARD} role='status'>
                <div className='flex flex-col items-center justify-center gap-y-6'>
                    <Image src='/icons/verified-check.svg' width={104} height={104} alt='' className='size-20 sm:size-26' />
                    <h5 className={cn(TITLE, 'text-secondary-500')}>You&apos;re an Artsony Seller</h5>
                    <p className={BODY}>
                        Your application was approved. You can now list artwork for sale, manage your orders and receive payouts.
                    </p>
                </div>
                <div className={ACTIONS}>
                    <Link href='/artsony-studio' className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), LINK_BUTTON)}>
                        Open Studio
                    </Link>
                    <Link href='/artworks/upload' className={cn(buttonVariants({ size: 'lg' }), LINK_BUTTON)}>
                        Upload Artwork
                    </Link>
                </div>
            </div>
        )
    }

    if (registration.status === 'REJECTED') {
        return (
            <div className={CARD} role='status'>
                <div className={cn(ICON_CIRCLE, 'bg-error-500')}>
                    <X color='#fff' size={48} />
                </div>
                <div className='flex flex-col items-center gap-y-4 w-full'>
                    <h5 className={cn(TITLE, 'text-primary-500')}>Application Not Approved</h5>
                    <p className={BODY}>
                        We couldn&apos;t approve your seller application this time. You can update your details and apply again.
                    </p>
                    <Notes notes={registration.review_notes} />
                </div>
                <div className={ACTIONS}>
                    <Button size='lg' onClick={onResubmit} className='w-full sm:w-auto'>
                        Update &amp; Resubmit
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className={CARD} role='status'>
            <div className={cn(ICON_CIRCLE, 'bg-error-500')}>
                <AlertTriangle color='#fff' size={48} />
            </div>
            <div className='flex flex-col items-center gap-y-4 w-full'>
                <h5 className={cn(TITLE, 'text-primary-500')}>Seller Account Suspended</h5>
                <p className={BODY}>
                    Your seller privileges are paused and your marketplace listings are hidden. Your likes, comments and saves are unaffected.
                </p>
                <Notes notes={registration.review_notes} />
            </div>
            <div className={ACTIONS}>
                <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), LINK_BUTTON)}
                >
                    Contact Support
                </a>
            </div>
        </div>
    )
}

export default ApplicationStatus