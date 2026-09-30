import { Navbar } from '@/components/layout/navbar'
import StudioPageContent from '@/features/studio/components/studio-page-content'
import React, { Suspense } from 'react'

const ArtsonyStudioPage = () => {
    return (
        <div className="flex min-h-dvh flex-col md:h-dvh md:overflow-hidden">
            <div className="shrink-0">
                <Navbar />
            </div>
            <main className="flex min-h-0 w-full flex-1 gap-x-4 rounded-2xl bg-white px-8 py-6">
                <Suspense fallback={null}>
                    <StudioPageContent />
                </Suspense>
            </main>
        </div>
    )
}

export default ArtsonyStudioPage
