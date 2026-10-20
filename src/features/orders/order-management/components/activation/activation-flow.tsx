'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { sellerSalesKeys, useActivationSessionState, useCreateActivationSession } from '@/hooks/queries/use-seller-sales'
import { HttpError } from '@/lib/api-client'
import type { SellerSaleDetail } from '@/types/seller-sales'
import { useIsDesktop } from '../../hooks/use-is-desktop'
import { useShippingLabel } from '../../hooks/use-shipping-label'
import { tokenFromUploadUrl } from '../../lib/activation'
import { DetailShell } from '../master-detail/detail-parts'
import { ProofUploader } from './proof-uploader'
import { QrStep } from './qr-step'
import { FailedScreen, ProcessingScreen, SuccessScreen } from './result-screens'

type Props = {
  detail: SellerSaleDetail
  onBack: () => void
  onDone: (orderItemId: string) => void
}

type Session = { id: string; uploadUrl: string } | null

// Desktop shows a QR code and waits for the phone to finish; on a phone the
// same upload steps run in the page itself. Both end in the same activation.
export function ActivationFlow({ detail, onBack, onDone }: Props) {
  const isDesktop = useIsDesktop()
  const queryClient = useQueryClient()
  const create = useCreateActivationSession()
  const [session, setSession] = React.useState<Session>(null)
  const [completed, setCompleted] = React.useState(false)
  const started = React.useRef(false)

  const orderItemId = detail.order_item_id
  const { download: downloadLabel, isDownloading } = useShippingLabel(orderItemId)
  const state = useActivationSessionState(orderItemId, isDesktop ? (session?.id ?? null) : null)

  const refreshOrders = React.useCallback(
    () => queryClient.invalidateQueries({ queryKey: sellerSalesKeys.all }),
    [queryClient],
  )

  const start = React.useCallback(() => {
    create.mutate(orderItemId, {
      onSuccess: (result) => {
        if (result.status === 'COMPLETED') {
          setCompleted(true)
          void refreshOrders()
          return
        }
        setSession({ id: result.session_id, uploadUrl: result.upload_url })
      },
    })
  }, [create, orderItemId, refreshOrders])

  React.useEffect(() => {
    if (started.current) return
    started.current = true
    start()
  }, [start])

  const status = state.data?.status
  React.useEffect(() => {
    if (status === 'COMPLETED') {
      setCompleted(true)
      void refreshOrders()
    }
  }, [status, refreshOrders])

  const finish = () => onDone(orderItemId)

  let content: React.ReactNode
  if (completed) {
    content = <SuccessScreen onDone={finish} onDownloadLabel={() => void downloadLabel()} isDownloading={isDownloading} />
  } else if (create.isError) {
    const message = create.error instanceof HttpError ? create.error.message : null
    content = <FailedScreen message={message} onBack={onBack} onRetry={start} />
  } else if (!session) {
    content = <ProcessingScreen />
  } else if (!isDesktop) {
    const token = tokenFromUploadUrl(session.uploadUrl)
    content = token ? (
      <ProofUploader
        token={token}
        onBack={onBack}
        onDone={finish}
        onSuccess={() => void refreshOrders()}
        onDownloadLabel={() => void downloadLabel()}
        isDownloadingLabel={isDownloading}
      />
    ) : (
      <FailedScreen message="The upload link could not be created." onBack={onBack} onRetry={start} />
    )
  } else if (status === 'PROCESSING') {
    content = <ProcessingScreen />
  } else if (status === 'FAILED') {
    content = <FailedScreen message={state.data?.failure_reason ?? null} onBack={onBack} onRetry={start} />
  } else {
    const expired = status === 'EXPIRED' || status === 'SUPERSEDED'
    content = (
      <QrStep
        uploadUrl={session.uploadUrl}
        expired={expired}
        onBack={onBack}
        onRegenerate={start}
        isRegenerating={create.isPending}
      />
    )
  }

  return <DetailShell className="justify-center">{content}</DetailShell>
}
