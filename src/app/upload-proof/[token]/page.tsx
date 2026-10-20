import type { Metadata } from 'next'
import { PhoneUploadPage } from '@/features/orders/order-management/components/activation/phone-upload-page'

export const metadata: Metadata = {
  title: 'Upload packaging proof',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function UploadProofPage() {
  return <PhoneUploadPage />
}
