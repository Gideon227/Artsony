import { PACKAGING_ACCEPTED_TYPES, PACKAGING_MAX_BYTES } from '../constants'

export function validatePackagingPhoto(file: { type: string; size: number }): string | null {
  if (!(PACKAGING_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return 'Use a JPEG or PNG photo.'
  }
  if (file.size > PACKAGING_MAX_BYTES) return 'Each photo must be 50MB or smaller.'
  if (file.size === 0) return 'That photo is empty.'
  return null
}

export function tokenFromUploadUrl(uploadUrl: string): string | null {
  try {
    const segments = new URL(uploadUrl).pathname.split('/').filter(Boolean)
    return segments.length >= 2 && segments[segments.length - 2] === 'upload-proof' ? (segments.at(-1) ?? null) : null
  } catch {
    return null
  }
}

export type ShippingDraft = { courier: string; serviceType: string; pickupAddress: string }

export type ShippingErrors = Partial<Record<keyof ShippingDraft, string>>

export function validateShipping(draft: ShippingDraft, couriers: readonly string[], serviceTypes: readonly string[]): ShippingErrors {
  const errors: ShippingErrors = {}
  if (!couriers.includes(draft.courier)) errors.courier = 'Choose a courier.'
  if (!serviceTypes.includes(draft.serviceType)) errors.serviceType = 'Choose a service type.'
  const address = draft.pickupAddress.trim()
  if (address.length < 10) errors.pickupAddress = 'Enter the full pickup address (at least 10 characters).'
  else if (address.length > 300) errors.pickupAddress = 'Pickup address must be 300 characters or fewer.'
  return errors
}
