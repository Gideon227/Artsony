'use client'

import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { DownloadsPageContent } from '@/features/orders/downloads/downloads-page-content'

export default function MyDownloadsPage() {
  const router = useRouter()

  return (
    <>
      <Navbar />
      <div className="px-8 py-6 flex bg-white min-h-[calc(100vh-96px)]">
        <div className="bg-secondary-50 rounded-2xl p-4 flex flex-col gap-y-8 w-full max-w-3xl mx-auto">
          <div className="flex items-center justify-start gap-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="p-2 border border-gray-50 rounded-full"
            >
              <ArrowLeft color="#525965" size={24} />
            </button>
            <h4 className="font-raleway font-semibold text-h5 text-body tracking-wide leading-10">My Downloads</h4>
          </div>
          <Suspense fallback={null}>
            <DownloadsPageContent />
          </Suspense>
        </div>
      </div>
    </>
  )
}
