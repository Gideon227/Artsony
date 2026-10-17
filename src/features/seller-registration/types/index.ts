export type AccountBasicsValues = {
  fullName: string
  email: string
  username: string
  phone: string
  dialCode: string
}

export type SellerAddressValues = {
  address: string
  country: string
  state: string
  city: string
  postalCode: string
}

export const DEFAULT_DIAL_CODE = '+234'

export const EMPTY_ADDRESS: SellerAddressValues = {
  address: '',
  country: '',
  state: '',
  city: '',
  postalCode: '',
}

export const REGISTRATION_STEPS = [
  'Account Basics',
  'Email Verification',
  'Fulfilment Address',
  'Agreement & Confirmation',
] as const

export const TOTAL_STEPS = REGISTRATION_STEPS.length

export function buildPhoneNumber({ dialCode, phone }: Pick<AccountBasicsValues, 'dialCode' | 'phone'>): string {
  const national = phone.replace(/\D/g, '').replace(/^0+/, '')
  return `${dialCode}${national}`
}

export const stripUsernamePrefix = (username: string): string => username.trim().replace(/^@+/, '')