'use client'
import React from 'react'
import UploadArtIndex from './upload-art';

interface SplitFlowLayoutProps {
    currentStepIndex: number;
    flowComponents: React.ReactNode;
    leftWorkspace?: React.ReactNode; 
}

export default function UploadFlowLayout({ 
    currentStepIndex, 
    flowComponents,
    leftWorkspace 
}: SplitFlowLayoutProps) {
    
    // Safety check to prevent index out of bounds crashes
    const ActiveStepComponent = flowComponents || null;

    return (
        // 1. Added `overflow-hidden` to prevent the whole page from expanding and scrolling
        // 2. Removed `justify-center items-center` so the flex container behaves correctly for full-height layouts
        <div className="h-full w-full bg-white flex flex-col overflow-hidden">
            
            {/* 3. Removed `items-start` to let children stretch to the full container height naturally */}
            <div className="h-full w-full px-8 py-8 flex gap-8 overflow-hidden">
                
                {/* Left Workspace */}
                <div className="h-screen w-full min-w-0 flex-1 overflow-y-auto scrollbar-hide">
                    {!leftWorkspace ? <UploadArtIndex /> : leftWorkspace }
                </div>
                
                {/* Right Form Context Panel */}
                <div className="h-screen w-md shrink-0 overflow-y-auto scrollbar-hide pb-12">
                    {ActiveStepComponent}
                </div>

            </div>
        </div>
    );
}