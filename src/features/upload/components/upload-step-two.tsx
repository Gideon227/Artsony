'use client'

import { Button, Switch } from "@/components"
import Image from "next/image"
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const UploadStepTwo = () => {
    // Form State
    const [license, setLicense] = useState("All rights reserved")
    const [visibility, setVisibility] = useState("Everyone")
    const [moodboardSave, setMoodboardSave] = useState(true)
    const [allowComments, setAllowComments] = useState(true)
    const [allowLikes, setAllowLikes] = useState(true)

    return (
        <div className='border border-gray-50 rounded-4xl flex flex-col justify-between bg-white overflow-hidden'>
            <div>
                {/* HEADER */}
                <div className='flex justify-between px-6 py-4 items-center border-b border-gray-50/50'>
                    <div className='flex gap-4 items-center'>
                        <h6 className='font-raleway font-semibold text-primary-500 text-[24px] leading-8 tracking-wide'>Step</h6>
                        <h6 className='font-raleway font-semibold text-primary-500 text-[24px] leading-8 tracking-wide'>
                            2<span className='text-gray-500'>/4</span>
                        </h6>
                    </div>

                    <div className='flex gap-4 items-center'>
                        <Button
                            variant="outline"
                            className='py-3 px-6 leading-6'
                        >
                            Save Draft
                        </Button>

                        <button className='border border-gray-50 rounded-full p-2 hover:bg-gray-50 transition-colors'>
                            <Image src='/icons/cancel.svg' width={20} height={20} alt='cancel icon' />
                        </button>
                    </div>
                </div>

                {/* CONTENT SECTION */}
                <div className="p-6 flex flex-col gap-8">
                    
                    {/* LICENSING */}
                    <div className="flex flex-col gap-3 relative">
                         <label className='font-poppins font-medium text-black text-[14px] leading-6 tracking-wide flex items-start'>
                            <span className='text-primary-500 mr-1'>*</span> Licensing & Usage Rights
                        </label>
                        <div className="flex flex-col gap-1">
                            <p className="text-gray-400 text-[12px] leading-5">
                                Decide how others can use or share this artwork, if at all. You’re in full control — choose a license that reflects your intent.
                            </p>
                            <p className="text-gray-300 text-[11px]">
                                Not sure what each option means? Hover over a license
                            </p>
                        </div>
                        <div className="relative cursor-pointer group">
                            <select 
                                value={license}
                                onChange={(e) => setLicense(e.target.value)}
                                className="w-full border border-gray-100 rounded-full py-4 px-6 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 font-poppins text-gray-700 text-sm"
                            >
                                <option>All rights reserved</option>
                                <option>Creative Commons</option>
                                <option>Public Domain</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-primary-500" size={20} />
                        </div>
                    </div>

                    {/* VISIBILITY */}
                    <div className="flex flex-col gap-3 relative">
                        <label className='font-poppins font-medium text-black text-[14px] leading-6 tracking-wide flex items-start'>
                            <span className='text-primary-500 mr-1'>*</span> Who can see this artwork?
                        </label>
                        <div className="relative cursor-pointer group">
                            <select 
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                                className="w-full border border-gray-100 rounded-full py-4 px-6 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 font-poppins text-gray-700 text-sm"
                            >
                                <option>Everyone</option>
                                <option>Only Me</option>
                                <option>Followers</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-primary-500" size={20} />
                        </div>
                    </div>

                    {/* TOGGLES */}
                    <div className="flex flex-col gap-6">
                        {/* Moodboard Save */}
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-poppins font-medium text-black text-[14px]">Enable Moodboard Save</h3>
                                <p className="text-gray-400 text-[12px] leading-5">Let other users collect and save your work into personal moodboards</p>
                            </div>
                            <Switch checked={moodboardSave} onCheckedChange={setMoodboardSave} />
                        </div>

                        {/* Comments */}
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-poppins font-medium text-black text-[14px]">Allow comments on this artwork?</h3>
                                <p className="text-gray-400 text-[12px] leading-5">Turn on comments to receive feedback, love, or questions from the Artsony community.</p>
                            </div>
                            <Switch checked={allowComments} onCheckedChange={setAllowComments} />
                        </div>

                        {/* Likes & Stats */}
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-poppins font-medium text-black text-[14px]">Allow Likes & Stats</h3>
                                <div className="flex flex-col gap-2">
                                    <p className="text-gray-400 text-[12px] leading-5">Enable this to let viewers appreciate your work and help the algorithm learn what inspires others.</p>
                                    <p className="text-gray-400 text-[12px] leading-5">Hiding stats can be useful if you want a quieter, less metric-driven space.</p>
                                </div>
                            </div>
                            <Switch checked={allowLikes} onCheckedChange={setAllowLikes} />
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className='py-6 px-6 items-center flex gap-4 border-t border-gray-50'>
                <Button
                    leftIcon='/icons/alt-arrow-left-double-red.svg'
                    fullWidth
                    variant='outline'
                    className="border-primary-500 text-primary-500 hover:bg-primary-50"
                >
                    Back
                </Button>

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

export default UploadStepTwo