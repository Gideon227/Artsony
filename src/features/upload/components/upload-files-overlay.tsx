'use client'
import { Button } from '@/components';
import React, { useEffect, useState } from 'react'

interface Props {
    isOpen: boolean;
    onClose: () => void;
    type: 'draft' | 'upload'
    draftFunction: () => void
}

const UploadFilesOverlay = ({ isOpen, onClose, type, draftFunction }: Props) => {
    const [render, setRender] = useState(isOpen)
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        if (isOpen) {
            // Lock the background from scrolling
            document.body.style.overflow = 'hidden';
            
            setRender(true)
            setTimeout(() => setAnimate(true), 10) 
        } else {
            // Unlock the background scrolling when closing
            document.body.style.overflow = 'unset';
            
            setAnimate(false)
            setTimeout(() => {
                setRender(false)
            }, 300) 
        }

        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            
            {/* Backdrop: Black with 0.4 opacity */}
            <div 
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            
            <div 
                className={`relative scrollbar-hide rounded-2xl transition-all duration-500 ease-out transform flex flex-col px-10 py-16 gap-y-12 justify-center items-center overflow-hidden ${
                    animate ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-[10vh] opacity-0 scale-95'
                }`}
                style={{ width: '564px', height: '368px' }}
            >
                <h2 className='font-raleway font-medium text-h4 text-[#333333] leading-10 text-center tracking-wide'>{type === 'upload' ? 'Save to Draft?' : type === 'draft' ? 'Save to Draft?' : null }</h2>
                <p className='font-poppins text-body text-body-xs leading-4 tracking-wide text-center'>This action can’t be undone once confirmed, and the buyer will be refunded automatically.
                    <br />Frequent cancellations may affect your seller performance.</p>
                <div className='flex justify-center items-center gap-x-[21px]'>
                    <Button fullWidth onClick={draftFunction}>Save as Draft</Button>
                    <Button fullWidth variant='outline' >Discard</Button>
                </div>
            </div>
        </div>
    )
}

export default UploadFilesOverlay