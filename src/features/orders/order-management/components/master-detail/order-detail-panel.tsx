'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ErrorState } from '@/components/feedback/states'
import { useCancelPhysicalItem, useDownloadInvoice } from '@/hooks/use-physical-order'
import { sellerSalesKeys, useSaveShipping, useSellerSaleDetail } from '@/hooks/queries/use-seller-sales'
import { HttpError } from '@/lib/api-client'
import { OrderActionsMenu, type OrderActionsMenuItem } from '@/features/orders/my-orders/ui/order-actions-menu'
import { openDocumentAfter } from '@/features/orders/my-orders/open-document'
import { supportMailto } from '@/features/orders/my-orders/utils'
import type { SaveShippingInput, SellerSaleDetail } from '@/types/seller-sales'
import { PACKAGING_GUIDELINES_HREF } from '../../constants'
import { useShippingLabel } from '../../hooks/use-shipping-label'
import { getMenuActions, type MenuActionId } from '../../lib/menu'
import { ActivationFlow } from '../activation/activation-flow'
import { CancelledDetail } from './cancelled-detail'
import { CompletedDetail } from './completed-detail'
import { DetailSkeleton } from './detail-parts'
import { LiveDetail } from './live-detail'
import { PendingDetail } from './pending-detail'
import { ProofLightbox } from './proof-lightbox'
import { SellerCancelFlow } from './seller-cancel-flow'

type Props = {
  orderItemId: string
  onClose: () => void
  onCancelled: (orderItemId: string) => void
  onActivated: (orderItemId: string) => void
}

export function OrderDetailPanel({ orderItemId, onClose, onCancelled, onActivated }: Props) {
  const queryClient = useQueryClient()
  const detailQuery = useSellerSaleDetail(orderItemId)
  const invoice = useDownloadInvoice()
  const cancel = useCancelPhysicalItem()
  const saveShipping = useSaveShipping()
  const label = useShippingLabel(orderItemId)

  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [activationOpen, setActivationOpen] = React.useState(false)
  const [lightbox, setLightbox] = React.useState<{ kind: 'delivery' | 'packaging'; index: number } | null>(null)

  React.useEffect(() => {
    setCancelOpen(false)
    setActivationOpen(false)
    setLightbox(null)
    cancel.reset()
    saveShipping.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderItemId])

  const detail = detailQuery.data

  const handleAction = React.useCallback(
    (id: MenuActionId, current: SellerSaleDetail) => {
      switch (id) {
        case 'cancel':
          setCancelOpen(true)
          break
        case 'support':
          window.location.assign(supportMailto(`Order ${current.order_code}`))
          break
        case 'shipping-label':
          void label.download()
          break
        case 'packaging-proof':
          setLightbox({ kind: 'packaging', index: 0 })
          break
        case 'guidelines':
          if (PACKAGING_GUIDELINES_HREF) window.open(PACKAGING_GUIDELINES_HREF, '_blank', 'noopener,noreferrer')
          break
        case 'invoice': {
          const physicalId = current.physical_id
          if (!physicalId) return
          void openDocumentAfter(() => invoice.mutateAsync(physicalId).then((result) => result.invoice_url))
          break
        }
        default:
          break
      }
    },
    [invoice, label],
  )

  if (detailQuery.isPending) return <DetailSkeleton />

  if (detailQuery.isError || !detail) {
    const notFound = detailQuery.error instanceof HttpError && detailQuery.error.statusCode === 404
    return (
      <div className="lg:rounded-2xl lg:border lg:border-gray-50 bg-white">
        <ErrorState
          title={notFound ? 'Order not found' : "We couldn't load this order"}
          description={notFound ? 'It may have been removed or does not belong to your account.' : 'Check your connection and try again.'}
          {...(notFound ? {} : { onRetry: () => void detailQuery.refetch() })}
        />
        {notFound && (
          <div className="flex justify-center pb-8">
            <button type="button" onClick={onClose} className="cursor-pointer font-poppins text-body-s font-medium text-primary-500 hover:underline">
              Back to orders
            </button>
          </div>
        )}
      </div>
    )
  }

  const items: OrderActionsMenuItem[] = getMenuActions(detail).map((action) => ({
    id: action.id,
    label: action.label,
    disabled: action.disabled,
    isPending: action.id === 'invoice' && invoice.isPending,
    onSelect: () => handleAction(action.id, detail),
  }))
  const actions = <OrderActionsMenu items={items} />

  const handleConfirmCancel = (reason: string) => {
    if (!detail.physical_id) return
    cancel.mutate(
      { physicalId: detail.physical_id, reason },
      {
        onSuccess: () => {
          setCancelOpen(false)
          void queryClient.invalidateQueries({ queryKey: sellerSalesKeys.all })
          onCancelled(detail.order_item_id)
        },
      },
    )
  }

  const handleContinue = (shipping: SaveShippingInput) => {
    saveShipping.mutate(
      { orderItemId: detail.order_item_id, input: shipping },
      { onSuccess: () => setActivationOpen(true) },
    )
  }

  const lightboxImages = lightbox?.kind === 'packaging' ? detail.packaging_proofs : detail.delivery_proofs

  let screen: React.ReactNode
  switch (detail.seller_status) {
    case 'LIVE':
      screen = (
        <LiveDetail
          detail={detail}
          actions={actions}
          onClose={onClose}
          onRefresh={() => void detailQuery.refetch()}
          isRefreshing={detailQuery.isFetching}
        />
      )
      break
    case 'PENDING':
      screen = (
        <PendingDetail
          detail={detail}
          actions={actions}
          onClose={onClose}
          onContinue={handleContinue}
          isContinuing={saveShipping.isPending}
          continueError={
            saveShipping.error instanceof HttpError ? saveShipping.error.message : saveShipping.isError ? 'Could not save your shipping details.' : null
          }
        />
      )
      break
    case 'COMPLETED':
      screen = <CompletedDetail detail={detail} actions={actions} onClose={onClose} onOpenProof={(index) => setLightbox({ kind: 'delivery', index })} />
      break
    case 'CANCELLED':
      screen = <CancelledDetail detail={detail} actions={actions} onClose={onClose} />
      break
  }

  return (
    <>
      {activationOpen ? (
        <ActivationFlow
          detail={detail}
          onBack={() => setActivationOpen(false)}
          onDone={(id) => {
            setActivationOpen(false)
            onActivated(id)
          }}
        />
      ) : (
        screen
      )}
      <SellerCancelFlow
        open={cancelOpen}
        isPending={cancel.isPending}
        error={cancel.error}
        onClose={() => {
          setCancelOpen(false)
          cancel.reset()
        }}
        onConfirm={handleConfirmCancel}
      />
      <ProofLightbox
        title={lightbox?.kind === 'packaging' ? 'Packaging Image' : 'Delivery Image'}
        images={lightboxImages.map((proof) => ({ id: proof.id, url: proof.url }))}
        startIndex={lightbox?.index ?? 0}
        open={lightbox !== null}
        onClose={() => setLightbox(null)}
      />
    </>
  )
}
