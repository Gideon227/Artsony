import Image from 'next/image'
import type { ReactNode } from 'react'
// clsx (not cn/twMerge): twMerge treats the custom `text-body-*` size tokens as colours
// and would drop them next to a `text-<color>` class.
import { clsx } from 'clsx'

/**
 * Presentational layout of the "Delivery Information" (completed) and
 * "Canceled Order Info" (canceled) panels. No data fetching here — see
 * order-details.tsx, which maps the order into these props.
 */

export interface DetailLine {
  label: string
  value: string
  /** Tailwind text colour for the value, defaults to the body colour. */
  tone?: string
}

export interface DetailField {
  label: string
  value: string
  /** Label colour override (the design draws "Refund Status" darker). */
  labelTone?: string
  /** Value colour override. */
  tone?: string
}

export interface DetailProof {
  id: string
  url: string
}

export interface OrderDetailsViewProps {
  variant: 'completed' | 'canceled'
  title: string
  /** The "..." actions menu. */
  menu: ReactNode
  /** Left column of the summary: Artwork Type / Order ID / Status. */
  summary: DetailLine[]
  /** Right column of the summary: three dated lines. */
  dates: DetailLine[]
  artwork: { imageUrl: string | null; title: string }
  artworkFields: DetailField[]
  sectionTitle: string
  /** Fields of the second section (refund / shipping details). */
  fields: DetailField[]
  /** Right-hand fields column of the refund section (canceled only). */
  fieldsRight?: DetailField[]
  proofs?: DetailProof[]
  onOpenProof?: (index: number) => void
  children?: ReactNode
}

const LABEL = 'text-gray-200'
const BODY = 'text-body'

function SummaryLine({ label, value, tone }: DetailLine) {
  return (
    <p className="font-poppins text-body-xs leading-4 tracking-wide">
      <span className={LABEL}>{label}</span> <span className={tone ?? BODY}>{value}</span>
    </p>
  )
}

/** Label above a pill-shaped read-only value. */
function Field({ label, value, labelTone, tone, className }: DetailField & { className?: string }) {
  return (
    <div className={clsx('flex min-w-0 flex-col gap-y-2', className)}>
      <p className={clsx('relative top-px font-poppins text-body-xxs leading-4 tracking-wide', labelTone ?? LABEL)}>{label}</p>
      <div className="flex h-12 items-center rounded-full border border-gray-50 bg-white px-[15px]">
        <span className={clsx('truncate font-poppins text-body-xs tracking-wide', tone ?? BODY)}>{value}</span>
      </div>
    </div>
  )
}

/**
 * Stack of fields with the spacing the design uses: no gap between fields, and
 * the last field sits 8px lower than an even rhythm would put it.
 */
function FieldColumn({ fields, className }: { fields: DetailField[]; className?: string }) {
  return (
    <div className={clsx('flex min-w-0 flex-col gap-y-2', className)}>
      {fields.map((field, i) => (
        <Field key={field.label} {...field} className={i === fields.length - 1 && i > 0 ? 'mt-2' : undefined} />
      ))}
    </div>
  )
}

function DeliveryGallery({ proofs, onOpen }: { proofs: DetailProof[]; onOpen?: (index: number) => void }) {
  return (
    <div className="flex shrink-0 flex-col gap-y-4">
      <p className="font-poppins text-body-m leading-6 tracking-wide text-body">Delivery Gallery</p>
      {proofs.length === 0 ? (
        <p className="font-poppins text-body-xs tracking-wide text-gray-200">No delivery photos yet.</p>
      ) : (
        <div className="flex">
          {proofs.slice(0, 3).map((proof, i) => (
            <button
              key={proof.id}
              type="button"
              onClick={() => onOpen?.(i)}
              aria-label="View delivery photo"
              className="relative -ml-[99px] size-[138px] shrink-0 overflow-hidden rounded-[28px] border border-gray-50 bg-gray-50 shadow-[0_4px_3px_-2px_rgba(0,0,0,0.18)] first:ml-0"
            >
              <Image src={proof.url} alt="Delivery proof" fill sizes="138px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function OrderDetailsView({
  variant,
  title,
  menu,
  summary,
  dates,
  artwork,
  artworkFields,
  sectionTitle,
  fields,
  fieldsRight,
  proofs = [],
  onOpenProof,
  children,
}: OrderDetailsViewProps) {
  return (
    <div className="flex flex-col rounded-xl border-2 border-gray-50 bg-white">
      {/* Title + actions + summary */}
      <div className="flex flex-col gap-y-10 border-b border-gray-50 p-4">
        <div className="flex w-full items-center justify-between">
          <h5 className="font-raleway text-h5 font-semibold leading-10 tracking-wide text-body">{title}</h5>
          {menu}
        </div>

        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-gray-50">
              <Image src="/home/box-black.svg" width={38} height={38} alt="delivery box" />
            </span>
            <div className="flex translate-y-1 flex-col gap-y-2">
              {summary.map((line) => (
                <SummaryLine key={line.label} {...line} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start gap-y-2">
            {dates.map((line) => (
              <SummaryLine key={line.label} {...line} />
            ))}
          </div>
        </div>
      </div>

      {/* Artwork details */}
      <div className="flex flex-col gap-y-[15px] border-b border-gray-50 px-4 pb-[23px] pt-6">
        <p className="font-poppins text-body-m font-medium leading-6 tracking-wide text-body">Artwork Details</p>
        <div className="flex items-center gap-x-4">
          <div className="relative size-60 shrink-0 overflow-hidden rounded-[20px] bg-gray-50">
            {artwork.imageUrl ? (
              <Image src={artwork.imageUrl} alt={artwork.title} fill sizes="240px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-poppins text-body-xxs text-gray-200">
                No image
              </div>
            )}
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-2">
            {artworkFields.map((field) => (
              <Field key={field.label} {...field} />
            ))}
          </div>
        </div>
      </div>

      {/* Refund details (canceled) / Shipping details (completed) */}
      <div className="flex flex-col gap-y-[23px] px-4 pb-4 pt-[9px]">
        <p className="font-poppins text-body-m font-medium leading-6 tracking-wide text-body">{sectionTitle}</p>
        {variant === 'canceled' ? (
          <div className="grid grid-cols-2 items-start gap-x-8">
            <FieldColumn fields={fields} />
            <FieldColumn fields={fieldsRight ?? []} />
          </div>
        ) : (
          <div className="flex items-center gap-x-12">
            <FieldColumn fields={fields} className="flex-1" />
            <DeliveryGallery proofs={proofs} onOpen={onOpenProof} />
          </div>
        )}
      </div>

      {children}
    </div>
  )
}
