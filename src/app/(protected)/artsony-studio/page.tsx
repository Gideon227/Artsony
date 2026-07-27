import { Navbar } from '@/components/layout/navbar'
import StudioPageContent from '@/features/studio/components/studio-page-content'
import React, { Suspense } from 'react'

const ArtsonyStudioPage = () => {
    return (
        <>
            <Navbar />
            <div className="bg-white rounded-2xl px-8 py-6 flex gap-x-4 w-full">
                <Suspense fallback={null}>
                    <StudioPageContent />
                </Suspense>
            </div>
        </>
    )
}

export default ArtsonyStudioPage