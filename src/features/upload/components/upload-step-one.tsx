'use client'
import { Button, Input, Textarea } from '@/components'
import { X } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

const UploadStepOne = () => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])

    return (
        <div className='border border-gray-50 rounded-4xl flex flex-col justify-between '>
            <div className=''>
                <div className='flex justify-between px-6 py-4 items-center'>
                    <div className='flex gap-4 items-center'>
                        <h6 className='font-raleway font-semibold text-primary-500 text-[24px] leading-8 tracking-wide '>Step</h6>
                        <h6 className='font-raleway font-semibold text-primary-500 text-[24px] leading-8 tracking-wide '>
                            1<span className='text-gray-500'>/4</span>
                        </h6>
                    </div>

                    <div className='flex gap-4 items-center'>
                        <Button
                            variant="outline"
                            className='py-3 px-6 leading-6'
                        >
                            Save Draft
                        </Button>

                        <button className='border border-gray-50 rounded-full p-2 items-center'>
                            <Image src='/icons/cancel.svg' width={20} height={20} alt='cancel icon' />
                        </button>
                    </div>
                </div>

                {/* SECTION TWO */}
                <div className='p-6 flex flex-col justify-between'>
                    <div className='flex flex-col gap-2 relative'>
                        <label className='font-poppins font-medium text-black text-[14px] leading-6 tracking-wide'>Artwork name</label>
                        <Input
                            placeholder='What do you want to call this piece?'
                        />
                        <span className='text-[8px] text-primary-500 absolute top-0 -left-4'>*</span>
                    </div>

                    <div className='flex flex-col gap-2 relative'>
                        <label className='font-poppins font-medium text-black text-[14px] leading-6 tracking-wide'>Artwork description</label>
                        <Textarea
                            placeholder='Tell the story behind this piece'
                        />
                        <p className='font-poppins text-gray-200 text-[10px] tracking-wide text-start'>500 words maximum</p>
                        <span className='text-[8px] text-primary-500 absolute top-0 -left-4'>*</span>
                    </div>

                    <div className='flex flex-col gap-2 relative'>
                        <label className='font-poppins font-medium text-black text-[14px] leading-6 tracking-wide'>Categories</label>
                        <div className='flex items-center gap-2'>
                            {selectedCategories?.map((cat) => (
                                <div className='border border-gray-50 bg-primary-500 rounded-4xl py-1 px-2 items-center gap-2'>
                                    <p className='font-poppins font-medium text-white text-[12px] leading-6 tracking-wide'>{cat}</p>
                                    <button className=''>
                                        <Image src="/icons/cancel-close.svg" width={20} height={20} alt='cancel icon' />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Input
                            leftIcon='/home/magnifier.svg'
                            placeholder='Tell the story behind this piece'
                        />
                        <p className='font-poppins text-gray-200 text-[10px] tracking-wide text-start'>Maximum 3</p>
                        <span className='text-[8px] text-primary-500 absolute top-0 -left-4'>*</span>
                    </div>

                    <div className='flex flex-col gap-2 relative'>
                        <label className='font-poppins font-medium flex  text-black text-[14px] leading-6 tracking-wide'>Keywords {'  '} <Image src='/icon/question-circle.svg' width={20} height={20} alt='question mark icon' /> </label>
                        <div className='flex items-center gap-2'>
                            {selectedCategories?.map((cat) => (
                                <div className='py-1 px-2 items-center gap-2'>
                                    <p className='font-poppins font-medium text-white text-[12px] leading-6 tracking-wide'># {cat}</p>
                                    <button className='bg-primary-500 border rounded-full items-center p-2'>
                                        <X size={20} color='#fff'/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Input
                            placeholder='Enter Keyword'
                        />
                        <p className='font-poppins text-gray-200 text-[10px] tracking-wide text-start'>Minimum 1, Maximum 10</p>
                        <span className='text-[8px] text-primary-500 absolute top-0 -left-4'>*</span>
                    </div>

                </div>
            </div>

            <div className='py-4 px-6 items-center'>
                <Button
                    rightIcon='/icons/alt-arrow-right-double.svg'
                    fullWidth
                >
                    Next
                </Button>
            </div>
        </div>
    )
}

export default UploadStepOne