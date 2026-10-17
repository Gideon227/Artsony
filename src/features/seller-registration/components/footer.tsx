import Link from 'next/link'
import React from 'react'

const LINK_CLASS = 'p-2 font-poppins font-medium text-body-s leading-6 text-body tracking-wide'

const Footer = () => {
    return (
        <div className='w-full flex flex-wrap gap-x-2 justify-center items-center px-4 py-3 bg-white'>
            <Link href='/privacy' className={LINK_CLASS}>Privacy</Link>
            <Link href='/privacy' className={LINK_CLASS}>Terms & Conditions</Link>
            <Link href='/privacy' className={LINK_CLASS}>FAQ</Link>
            <Link href='/privacy' className={LINK_CLASS}>About</Link>
            <Link href='/privacy' className={LINK_CLASS}>Language</Link>
        </div>
    )
}

export default Footer