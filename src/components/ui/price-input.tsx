import Image from 'next/image';
import React from 'react'

const PriceInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="flex items-center h-14 w-full rounded-full border border-neutral-200 bg-white px-6 focus-within:border-primary-600 transition-all">
        <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🇳🇬</span>
            <span className="text-body-s font-semibold text-gray-500 mr-1">₦</span>
            <Image src="/icons/alt-arrow-down.svg" width={20} height={20} alt="arrow" />
        </div>

        <div className="w-[1px] h-8 bg-neutral-100 mx-5 shrink-0" />

        <input
            type="number"
            placeholder="00.00"
            className="flex-1 bg-transparent text-lg font-medium text-neutral-800 placeholder:text-neutral-300 outline-none"
            {...props}
        />
        
    </div>
);

export default PriceInput