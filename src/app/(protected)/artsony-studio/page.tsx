import { Navbar } from '@/components/layout/navbar'
import StudioPageContent from '@/features/studio/components/studio-page-content'
import React, { Suspense } from 'react'

const ArtsonyStudioPage = () => {
    return (
        <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
            <div className="shrink-0 max-md:hidden">
                <Navbar />
            </div>
            <main className="flex min-h-0 w-full flex-1 flex-col bg-white lg:flex-row lg:gap-x-4 lg:rounded-2xl max-md:pb-20 lg:px-8 lg:py-6">
                <Suspense fallback={null}>
                    <StudioPageContent />
                </Suspense>
            </main>
        </div>
    )
}

export default ArtsonyStudioPage
