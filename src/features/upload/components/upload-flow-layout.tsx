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
        <div className="h-full bg-white w-full flex flex-col justify-center items-center">
            
            <div className="max-w-[1440px] w-full px-8 py-8 flex gap-8 items-start h-full">
                
                {/* Left Workspace */}
                <div className="w-2/3 h-full flex-1">
                    {!leftWorkspace ? <UploadArtIndex /> : leftWorkspace }
                </div>
                
                {/* Right Form Context Panel */}
                <div className="w-1/3 h-full overflow-y-auto shrink-0 pb-12 scrollbar-hide">
                    {ActiveStepComponent}
                </div>

            </div>
        </div>
    );
}