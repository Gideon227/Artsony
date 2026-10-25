'use client'
import * as React from 'react'
import ReportReasonModal from '@/components/ui/report-reason-modal'
import type { ReportReasonOption } from '@/components/ui/report-reason-modal'
import { useReportUser } from '@/hooks/use-user'

const USER_REPORT_REASONS: readonly ReportReasonOption[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment or Bullying' },
  { value: 'SCAM', label: 'Scam or Fraud' },
  { value: 'IMPERSONATION', label: 'Impersonation' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content' },
  { value: 'OTHER', label: 'Others' },
]

export function ReportUserModal({ userId, conversationId, open, onOpenChange }: {
  userId: string; conversationId?: string; open: boolean; onOpenChange: (open: boolean) => void
}) {
  const { mutate: submitReport, isPending } = useReportUser()
  return (
    <ReportReasonModal
      open={open}
      onOpenChange={onOpenChange}
      title="Report User"
      notesPrompt="Please tell us more about why you're reporting this user."
      reasons={USER_REPORT_REASONS}
      isPending={isPending}
      onSubmit={({ reason, notes }: { reason: string, notes?: string | undefined }) =>
        submitReport({ userId, reason, notes, conversationId }, { onSuccess: () => onOpenChange(false) })
      }
    />
  )
}