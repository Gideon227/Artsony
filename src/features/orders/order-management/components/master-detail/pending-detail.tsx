'use client'

import * as React from 'react'
import { Check, ChevronDown, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/features/orders/my-orders/utils'
import type { SaveShippingInput, SellerSaleDetail } from '@/types/seller-sales'
import { 
  COURIER_OPTIONS, 
  PACKAGING_GUIDELINES_HREF,
  SERVICE_TYPE_OPTIONS,
  SHIPPING_POLICY_HREF
 } from '../../constants'
import { useNow } from '../../hooks/use-now'
import { validateShipping, type ShippingDraft } from '../../lib/activation'
import { formatDimensions, hoursRemaining, pad2, splitCountdown } from '../../lib/detail'
import { formatMoney } from '../../lib/format'
import { ArtworkThumb } from './artwork-thumb'
import { DetailHeader, DetailSection, DetailShell, InlineMeta, OrderCube, ReadOnlyField } from './detail-parts'

type Props = {
  detail: SellerSaleDetail
  actions: React.ReactNode
  onClose: () => void
  onContinue: (shipping: SaveShippingInput) => void
  isContinuing: boolean
  continueError: string | null
}

function PolicyLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <span className="text-info-500 underline">{children}</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-info-500 underline">
      {children}
    </a>
  )
}

const fieldShell =
  'flex min-h-12 w-full items-center rounded-[24px] border bg-white px-4 py-2 font-poppins text-body-s tracking-wide text-gray-500 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500'

function FieldLabel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="font-poppins text-body-xs tracking-wide text-gray-300">
      {children}
    </label>
  )
}

function FieldError({ id, message }: { id: string; message?: string | undefined }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="font-poppins text-body-xxs text-error-500">
      {message}
    </p>
  )
}

type SelectProps = {
  id: string
  label: string
  value: string
  placeholder: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
  disabled: boolean
  error?: string | undefined
}

function SelectField({ id, label, value, placeholder, options, onChange, disabled, error }: SelectProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <FieldLabel id={id}>{label}</FieldLabel>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            fieldShell,
            'cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-60',
            error ? 'border-error-500' : 'border-gray-50',
            !value && 'text-gray-300',
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

export function PendingDetail({ detail, actions, onClose, onContinue, isContinuing, continueError }: Props) {
  const [confirmed, setConfirmed] = React.useState(false)
  const [touched, setTouched] = React.useState(false)
  const [draft, setDraft] = React.useState<ShippingDraft>(() => ({
    courier: detail.courier_name ?? '',
    serviceType: detail.courier_service_type ?? '',
    pickupAddress: detail.pickup_address ?? '',
  }))

  const now = useNow(1000, detail.confirmation_deadline !== null)
  const countdown = splitCountdown(detail.confirmation_deadline, now)
  const hours = hoursRemaining(detail.confirmation_deadline, now)

  const couriers = COURIER_OPTIONS as readonly string[]
  const errors = validateShipping(draft, couriers, SERVICE_TYPE_OPTIONS.map((option) => option.value))
  const shown = touched ? errors : {}
  const canContinue = confirmed && !countdown.expired && !isContinuing

  const submit = () => {
    setTouched(true)
    if (Object.keys(errors).length > 0) return
    onContinue({
      courier_name: draft.courier,
      courier_service_type: draft.serviceType as SaveShippingInput['courier_service_type'],
      pickup_address: draft.pickupAddress.trim(),
    })
  }

  return (
    <DetailShell>
      <DetailHeader title="Shipment Activation" mobileTitle={detail.artwork_title} actions={actions} onClose={onClose} />

      <div className="flex flex-col gap-6 px-4 pb-8 lg:flex-row lg:items-start lg:justify-between lg:px-6">
        <div className="flex items-center gap-4">
          <OrderCube />
          <div className="flex flex-col gap-2">
            <InlineMeta label="Order ID:" value={detail.order_code} valueClassName="text-info-500 lg:text-gray-500" />
            <InlineMeta label="Status:" value="Pending Activation" valueClassName="text-warning-500" />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 lg:w-[360px]">
          <p className="font-poppins text-body-s tracking-wide text-gray-500">
            Timestamp: <span className="text-primary-500">Ordered {timeAgo(detail.purchased_at)}</span>
          </p>
          <p className="font-poppins text-body-xs tracking-wide text-gray-300">
            {countdown.expired ? (
              'The activation window for this order has closed.'
            ) : (
              <>
                You have <span className="text-primary-500">{hours}</span> hours to activate this order before it auto-cancels.
              </>
            )}
          </p>
          <p
            role="timer"
            aria-live="off"
            className="flex min-h-12 items-center justify-between gap-2 rounded-[24px] border border-gray-50 px-4 py-2 font-poppins text-body-s tracking-wide text-primary-500"
          >
            <span>
              {countdown.expired
                ? 'Expired'
                : `${countdown.days}d : ${pad2(countdown.hours)}h : ${pad2(countdown.minutes)}m : ${pad2(countdown.seconds)}s`}
            </span>
            <Clock className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </p>
        </div>
      </div>

      <DetailSection title="Artwork Details">
        <div className="flex flex-col gap-6 sm:flex-row">
          <ArtworkThumb src={detail.artwork_thumbnail_url} alt={detail.artwork_title} sizes="(min-width: 640px) 320px, 100vw" className="aspect-square w-full rounded-[24px] sm:h-80 sm:w-80" />
          <div className="grid flex-1 grid-cols-2 content-start gap-4">
            <ReadOnlyField label="Artwork Name" value={detail.artwork_title} className="col-span-2 sm:col-span-1" />
            <ReadOnlyField label="Variant" value={detail.variant_label ?? '—'} className="col-span-2 sm:col-span-1" />
            <ReadOnlyField label="Quantity" value={detail.quantity} />
            <ReadOnlyField label="Weight" value="—" />
            <ReadOnlyField label="Net Earning" value={formatMoney(detail.net_earning, detail.currency)} />
            <ReadOnlyField label="Dimensions (lxbxh)" value={formatDimensions(detail.dimensions)} />
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Shipping Details">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (canContinue) submit()
          }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <div className="flex flex-col gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <FieldLabel id="pickup-address">Pickup Address:</FieldLabel>
              <textarea
                id="pickup-address"
                rows={2}
                maxLength={300}
                value={draft.pickupAddress}
                disabled={isContinuing}
                aria-invalid={Boolean(shown.pickupAddress)}
                aria-describedby={shown.pickupAddress ? 'pickup-address-error' : undefined}
                onChange={(event) => setDraft((current) => ({ ...current, pickupAddress: event.target.value }))}
                onBlur={() => setTouched(true)}
                className={cn(fieldShell, 'resize-none disabled:cursor-not-allowed disabled:opacity-60', shown.pickupAddress ? 'border-error-500' : 'border-gray-50')}
              />
              <FieldError id="pickup-address-error" message={shown.pickupAddress} />
            </div>
            <SelectField
              id="courier"
              label="Courier"
              value={draft.courier}
              placeholder="Select a courier"
              options={COURIER_OPTIONS.map((courier) => ({ value: courier, label: courier }))}
              onChange={(courier) => setDraft((current) => ({ ...current, courier }))}
              disabled={isContinuing}
              error={shown.courier}
            />
            <SelectField
              id="service-type"
              label="Service Type"
              value={draft.serviceType}
              placeholder="Select a service type"
              options={SERVICE_TYPE_OPTIONS}
              onChange={(serviceType) => setDraft((current) => ({ ...current, serviceType }))}
              disabled={isContinuing}
              error={shown.serviceType}
            />
          </div>

          <div className="flex flex-col gap-6">
            <p className="font-poppins text-body-s tracking-wide">
              <PolicyLink href={PACKAGING_GUIDELINES_HREF}>Read Artsony Order Packaging Guidelines</PolicyLink>
            </p>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500',
                  confirmed ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-100 bg-white',
                )}
              >
                {confirmed && <Check className="h-4 w-4" />}
              </span>
              <span className="font-poppins text-body-s leading-5 tracking-wide text-gray-400">
                By continuing, you confirm that your artwork has been securely packaged following [
                <PolicyLink href={PACKAGING_GUIDELINES_HREF}>Artsony&apos;s Packaging Guidelines</PolicyLink>] and that you agree to [
                <PolicyLink href={SHIPPING_POLICY_HREF}>Artsony&apos;s Shipping</PolicyLink> Policy]. You&apos;ll be asked to upload clear
                packaging photos before shipment.
              </span>
            </label>

            {continueError && (
              <p role="alert" className="font-poppins text-body-xs text-error-500">
                {continueError}
              </p>
            )}

            <button
              type="submit"
              disabled={!canContinue}
              aria-label="Continue to upload packaging photos"
              className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-primary-500 font-poppins text-body-m font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300 active:scale-[0.99]"
            >
              {isContinuing ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
              Continue
              <span aria-hidden="true">»</span>
            </button>
          </div>
        </form>
      </DetailSection>
    </DetailShell>
  )
}
