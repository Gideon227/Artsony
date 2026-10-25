'use client'

import * as React from 'react'
import { ReportReasonModal, type ReportReasonOption } from '@/components/ui/report-reason-modal'
import { useReportArtwork } from '@/hooks/use-artwork'

const REPORT_REASONS: readonly ReportReasonOption[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment or Bullying' },
  { value: 'COPYRIGHT', label: 'Copyright Infringement' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content' },
  { value: 'MISLEADING', label: 'False or Misleading Information' },
  { value: 'OTHER', label: 'Others' },
]

type ReportModalProps = {
  artworkId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ReportModal = ({ artworkId, open, onOpenChange }: ReportModalProps) => {
  const { mutate: submitReport, isPending } = useReportArtwork()

  return (
    <ReportReasonModal
      open={open}
      onOpenChange={onOpenChange}
      title="Report Artwork"
      notesPrompt="Please tell us more about why you're reporting this post."
      reasons={REPORT_REASONS}
      isPending={isPending}
      onSubmit={({ reason, notes }) =>
        submitReport({ id: artworkId, reason, notes }, { onSuccess: () => onOpenChange(false) })
      }
    />
  )
}

export default ReportModal