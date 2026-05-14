'use client'
import { Button } from '@/components'
import Image from 'next/image'
import React from 'react'

interface Props{
    title: string;
    subText: string;
    cardOne: {
        iconStr: string,
        text: string
    }
    cardTwo: {
        iconStr: string,
        text: string
    }
    backButton?: boolean
    onClickFunction: () => void;
}

const UploadCard = ({ iconSrc, text }: { iconSrc: string, text: string }) => {
    return (
        <div className='flex flex-col py-10 justify-center items-center gap-6 border border-gray-50 rounded-4xl group bg-white group-hover:bg-primary-50 focus:bg-transparent focus:ring-2 focus:ring-primary-500 cursor-pointer' style={{ width: 216 }}>
            <div className='border-2 border-gray-50 group-hover:border-primary-500 rounded-full p-8 w-22 h-22 items-center'>
                <Image src={iconSrc} width={20} height={20} alt='icon' />
            </div>

            <p className='font-poppins font-normal text-black text-[16px] leading-6 tracking-wide text-center'>{text}</p>
        </div>
    )
}

const UploadType = ({ title, subText, cardOne, cardTwo, backButton = false, onClickFunction  }: Props) => {
    return (
        <div className='h-screen relative bg-white flex flex-col gap-y-8 items-center justify-center '>
            <div className='absolute top-0 left-0'>
                <Image src='/upload/vector-left.svg' width={250} height={250} alt='vector icon' className='shadow-[#00000040] md:w-62.5 w-50'/>
            </div>
            <div className='absolute bottom-0 right-0' style={{ bottom: 0 }}>
                <Image src='/upload/vector-right.svg' width={250} height={250} alt='vector icon' className='shadow-[#00000040] md:w-62.5 w-50'/>
            </div>

            <button className='absolute top-16 border-2 rounded-full p-2 border-gray-50' style={{ right: '12%', top: '12%' }}>
                <Image src='/icons/cancel.svg' width={20} height={20} alt='cancel icon' />
            </button>

            <div className='flex flex-col justify-center items-center gap-y-4'>
                <h1 className='font-raleway font-medium text-h4 md:text-h2 leading-14 text-black text-center tracking-wide' style={{ fontSize: 48 }}>{title}</h1>
                <p className='font-poppins font-normal text-black text-body-s md:text-body-l w-60 md:w-87 text-wrap leading-8 text-center tracking-wide'>{subText}</p>
            </div>

            <div className='flex flex-col md:flex-row gap-4'>
                <UploadCard iconSrc={cardOne.iconStr} text={cardOne.text} />
                <UploadCard iconSrc={cardTwo.iconStr} text={cardTwo.text} />
            </div>

            {backButton &&
                <Button
                    leftIcon='/icons/arrow-left-double.svg'
                    onClick={onClickFunction}
                    variant='outline'
                    style={{ width: 168 }}
                >Back</Button>
            }
        </div>
    )
}

export default UploadType