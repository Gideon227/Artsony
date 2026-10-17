'use client'

import { useState } from 'react'
import { BadgeCheck } from 'lucide-react'
import { Button, Textarea } from '@/components'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useReviewSellerRegistration } from '@/hooks/use-seller'
import { getCountryName } from '@/hooks/use-location-data'
import type {
  SellerRegistration,
  SellerRegistrationStatus,
  SellerReviewAction,
} from '@/services/seller.service'

export const STATUS_BADGE: Record<SellerRegistrationStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'error' },
  SUSPENDED: { label: 'Suspended', variant: 'default' },
}

type ActionConfig = {
  action: SellerReviewAction
  label: string
  variant: 'primary' | 'danger'
  needsNotes: boolean
}

const ACTIONS: Record<SellerRegistrationStatus, ActionConfig[]> = {
  PENDING: [
    { action: 'reject', label: 'Reject', variant: 'danger', needsNotes: true },
    { action: 'approve', label: 'Approve', variant: 'primary', needsNotes: false },
  ],
  APPROVED: [{ action: 'suspend', label: 'Suspend seller', variant: 'danger', needsNotes: true }],
  SUSPENDED: [
    { action: 'reject', label: 'Reject permanently', variant: 'danger', needsNotes: true },
    { action: 'reactivate', label: 'Reactivate', variant: 'primary', needsNotes: false },
  ],
  REJECTED: [],
}

const MIN_REQUIRED_NOTE_LENGTH = 3
const MAX_NOTE_LENGTH = 2000

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

const Detail = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className='flex min-w-0 flex-col gap-y-1'>
    <dt className='font-poppins text-body-xs font-medium text-text-disabled tracking-wide'>{label}</dt>
    <dd className='font-poppins text-body-s text-heading tracking-wide break-words'>{children}</dd>
  </div>
)

interface ApplicationDialogProps {
  registration: SellerRegistration | undefined
  onClose: () => void
}

export function ApplicationDialog({ registration, onClose }: ApplicationDialogProps) {
  const [notes, setNotes] = useState('')
  const [notesError, setNotesError] = useState<string>()
  const { mutate: review, isPending, variables } = useReviewSellerRegistration()

  const handleOpenChange = (open: boolean) => {
    if (open || isPending) return
    setNotes('')
    setNotesError(undefined)
    onClose()
  }

  const handleAction = (config: ActionConfig) => {
    if (!registration || isPending) return

    const trimmed = notes.trim()
    if (config.needsNotes && trimmed.length < MIN_REQUIRED_NOTE_LENGTH) {
      setNotesError('Add a short note explaining this decision — the applicant will see it.')
      return
    }

    review(
      { id: registration.id, action: config.action, ...(trimmed && { notes: trimmed }) },
      {
        onSuccess: () => {
          setNotes('')
          setNotesError(undefined)
          onClose()
        },
      },
    )
  }

  const actions = registration ? ACTIONS[registration.status] : []
  const badge = registration ? STATUS_BADGE[registration.status] : undefined

  return (
    <Dialog open={Boolean(registration)} onOpenChange={handleOpenChange}>
      <DialogContent size='xl' className='max-h-[90vh] overflow-y-auto'>
        {registration && badge && (
          <div className='flex flex-col gap-y-6'>
            <DialogHeader>
              <div className='flex flex-wrap items-center gap-3 pr-8'>
                <DialogTitle className='font-raleway text-h5 font-semibold text-primary-500 tracking-wide'>
                  {registration.full_name}
                </DialogTitle>
                <Badge variant={badge.variant} size='lg'>{badge.label}</Badge>
              </div>
              <DialogDescription className='font-poppins text-body-xs text-body'>
                Submitted {formatDate(registration.created_at)}
              </DialogDescription>
            </DialogHeader>

            <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Detail label='Username'>@{registration.username}</Detail>
              <Detail label='Email'>
                <span className='inline-flex flex-wrap items-center gap-x-2'>
                  {registration.email}
                  {registration.email_verified_at && (
                    <span className='inline-flex items-center gap-1 text-xs font-medium text-secondary-500'>
                      <BadgeCheck className='size-4' aria-hidden='true' /> Verified
                    </span>
                  )}
                </span>
              </Detail>
              <Detail label='Phone'>{registration.phone_number}</Detail>
              <Detail label='Country'>{getCountryName(registration.country) ?? registration.country}</Detail>
              <Detail label='Address'>{registration.address}</Detail>
              <Detail label='State/Province'>{registration.state}</Detail>
              {registration.city && <Detail label='City'>{registration.city}</Detail>}
              {registration.postal_code && <Detail label='Postal code'>{registration.postal_code}</Detail>}
              {registration.review_notes && (
                <div className='sm:col-span-2'>
                  <Detail label='Previous review note'>
                    <span className='whitespace-pre-line'>{registration.review_notes}</span>
                  </Detail>
                </div>
              )}
            </dl>

            {actions.length > 0 ? (
              <div className='flex flex-col gap-y-4'>
                <div className='flex flex-col gap-y-1.5'>
                  <label
                    htmlFor='seller-review-notes'
                    className='font-poppins font-medium text-body-s text-heading tracking-wide'
                  >
                    Review note
                  </label>
                  <Textarea
                    id='seller-review-notes'
                    rows={3}
                    maxLength={MAX_NOTE_LENGTH}
                    value={notes}
                    disabled={isPending}
                    variant={notesError ? 'error' : 'default'}
                    placeholder='Shared with the applicant. Required to reject or suspend.'
                    onChange={(e) => {
                      setNotes(e.target.value)
                      if (notesError) setNotesError(undefined)
                    }}
                  />
                  {notesError && <p role='alert' className='pl-1 text-xs font-semibold text-error-500'>{notesError}</p>}
                </div>

                <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
                  {actions.map((config) => (
                    <Button
                      key={config.action}
                      size='lg'
                      variant={config.variant}
                      className='w-full sm:w-auto'
                      isLoading={isPending && variables?.action === config.action}
                      loadingText='Working…'
                      disabled={isPending}
                      onClick={() => handleAction(config)}
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className='font-poppins text-body-xs text-body tracking-wide'>
                Rejected applicants can update their details and apply again, which sends a new application for review.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}