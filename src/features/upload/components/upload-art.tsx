'use client'

import { Navbar } from "@/components/layout/navbar";
import Image from "next/image";
import { useState } from "react"

interface btnCompProps {
    imgSrc: string;
    text: string;
    onClickFunction: () => void;
}

const UploadArt = () => {
    const [step, setStep] = useState<'first'|'second'|'third'|'fourth'>('first');

    const btnComp: btnCompProps[] = [
        { imgSrc: '/icons/image.svg', text: 'Image', onClickFunction: () => {} },
        { imgSrc: '/icons/code-square.svg', text: 'Embed', onClickFunction: () => {} },
        { imgSrc: '/icons/video.svg', text: 'Video', onClickFunction: () => {} },
        { imgSrc: '/icons/box.svg', text: '3D', onClickFunction: () => {} },
    ]

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="p-8 gap-4 flex">
                <div className="flex flex-col gap-7 justify-center items-center w-2/3 ">
                    <div className="flex items-center justify-center relative border border-gray-50 rounded-4xl">
                        <div className="flex items-center justify-center gap-x-8">
                            {btnComp.map((item) => (
                                <button onClick={item.onClickFunction} className="gap-y-2 items-center flex flex-col justify-center">
                                    <div className="p-6 bg-[#121417] rounded-[64px] items-center">
                                        <Image src={item.imgSrc} width={32} height={32} alt="icon" />
                                    </div>
                                
                                    <h5 className="font-poppins text-[16px] leading-6 text-center tracking-wide text-black ">{item.text}</h5>
                                </button>
                            ))}
                        </div>

                        <div className="absolute top-6 left-6 p-2 gap-2.5 border border-gray-50 rounded-3xl">
                            <button className="border-2 border-gray-50 rounded-full p-2">
                                <Image src='/icons/pen.svg' width={24} height={24} alt="pencil icon" />
                            </button>
                            <button className="border-2 border-gray-50 rounded-full p-2">
                                <Image src='/icons/arrow-up-round.svg' width={24} height={24} alt="Arrow icon" />
                            </button>
                            <button className="border-2 border-gray-50 rounded-full p-2">
                                <Image src='/icons/arrow-down-round.svg' width={24} height={24} alt="Arrpw icon" />
                            </button>
                        </div>
                    </div>
                    <button className="items-center w-20 h-20 rounded-full bg-primary-50 cursor-pointer">
                        <Image src='/icons/plus-red-bg.svg' width={20} height={20} alt="plus icon" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UploadArt