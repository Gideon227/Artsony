// @/features/upload/components/upload-type.tsx
'use client'
import { Button, Input } from '@/components'
import Image from 'next/image'
import React from 'react'

interface Props {
    title: string;
    subText: string;
    cardOne: {
        iconStr: string;
        text: string;
        onClickFunction: () => void;
    }
    cardTwo: {
        iconStr: string;
        text: string;
        onClickFunction: () => void;
    }
    backButton?: boolean;
    onBackHandle?: () => void; // Made optional since step 1 doesn't need it
    onClose?: () => void;
}


const UploadCard = ({ iconSrc, text, onClick }: { iconSrc: string, text: string, onClick: () => void }) => {
    return (
        <div 
            onClick={onClick} 
            className='flex flex-row md:flex-col py-10 justify-center items-center gap-6 border border-gray-50 rounded-2xl group bg-white hover:bg-primary-50 focus:bg-transparent focus:ring-2 focus:ring-primary-500 cursor-pointer transition-colors' 
            style={{ width: 216 }}
        >
            <div className='md:border-2 md:border-gray-50 md:group-hover:border-primary-500 rounded-full md:p-8 w-6 h-6 md:w-22 md:h-22 flex items-center justify-center transition-colors'>
                <Image src={iconSrc} width={20} height={20} alt='icon' />
            </div>
            <p className='font-poppins font-normal text-black text-body-m leading-6 tracking-wide text-center'>{text}</p>
        </div>
    )
}

const UploadType = ({ title, subText, cardOne, cardTwo, backButton = false, onBackHandle, onClose }: Props) => {
    return (
        <div className='h-full relative bg-white flex flex-col gap-y-8 max-md:gap-y-12 items-center justify-center overflow-hidden'>
            <div className='absolute max-md:-right-10 max-md:-top-10 rotate-90 md:-left-20 md:-top-20 md:rotate-90'>
                <Image src='/upload/vector.svg' width={250} height={250} alt='vector icon' className='md:w-62.5 w-31.25'/>
            </div>
            <div className='absolute max-md:-left-10 max-md:-bottom-10 md:-bottom-20 md:-right-20 md:-rotate-90'>
                <Image src='/upload/vector.svg' width={250} height={250} alt='vector icon' className='md:w-62.5 w-31.25'/>
            </div>

            <button onClick={onClose} className='absolute cursor-pointer max-md:top-[6%] max-md:left-[6%] md:top-[12%] md:right-[12%] border-2 rounded-full p-2 border-gray-50 hover:bg-gray-50 transition-colors z-10'>
                <Image src='/icons/cancel.svg' width={20} height={20} alt='cancel icon' />
            </button>

            <div className='flex flex-col justify-center items-center gap-y-4 z-10'>
                <h1 className='font-raleway font-medium text-h4 md:text-h2 leading-14 text-black text-center tracking-wide' style={{ fontSize: 48 }}>{title}</h1>
                <p className='font-poppins font-normal text-black text-body-s md:text-body-l w-60 md:w-87 text-wrap leading-8 text-center tracking-wide'>{subText}</p>
            </div>

            <div className='hidden md:flex flex-col md:flex-row gap-4 z-10'>
                <UploadCard iconSrc={cardOne.iconStr} text={cardOne.text} onClick={cardOne.onClickFunction} />
                <UploadCard iconSrc={cardTwo.iconStr} text={cardTwo.text} onClick={cardTwo.onClickFunction} />
            </div>

            <div className='md:hidden max-md:flex flex-col gap-y-6 z-10'>
                <Button fullWidth variant='outline' className='border-gray-50 outline-gray-50 text-body gap-x-4 h-14' onClick={cardOne.onClickFunction} leftIcon={cardOne.iconStr}>{cardOne.text}</Button>
                <Button fullWidth variant='outline' className='border-gray-50 outline-gray-50 text-body gap-x-4 h-14' onClick={cardTwo.onClickFunction} leftIcon={cardTwo.iconStr}>{cardTwo.text}</Button>
            </div>

            {backButton && onBackHandle && (
                <div className="z-10 mt-4">
                    <Button
                        leftIcon='/icons/arrow-left-double.svg'
                        onClick={onBackHandle}
                        variant='outline'
                        style={{ width: 168 }}    
                    >
                        Back
                    </Button>
                </div>
            )}
        </div>
    )
}

export default UploadType