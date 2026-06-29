import Link from 'next/link'
import React from 'react'

const Footer = () => {
    return (
        <div className='w-full flex gap-x-2 justify-center items-center py-3 bg-white'>
            <Link href='/privacy' className='p-2 font-poppins font-medium text-body-s leading-6 text-body tracking-wide'>Privacy</Link>
            <Link href='/privacy' className='p-2 font-poppins font-medium text-body-s leading-6 text-body tracking-wide'>Terms & Conditions</Link>
            <Link href='/privacy' className='p-2 font-poppins font-medium text-body-s leading-6 text-body tracking-wide'>FAQ</Link>
            <Link href='/privacy' className='p-2 font-poppins font-medium text-body-s leading-6 text-body tracking-wide'>About</Link>
            <Link href='/privacy' className='p-2 font-poppins font-medium text-body-s leading-6 text-body tracking-wide'>Language</Link>
        </div>
    )
}

export default Footer