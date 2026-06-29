import { useAuthStore } from '@/store'
import { ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const SettingLeftBar = () => {
    const { user } = useAuthStore()
    
    return (
        <div className='border border-gray-50 rounded-2xl py-8 px-6 flex flex-col gap-y-8'>
            <div className='flex items-center gap-x-4 '>
                <span className='w-10 h-10 border-gray-50 rounded-full items-center justify-center'>
                    <ArrowLeftIcon color='#525965' size={16} />
                </span>

                <h6 className='font-raleway font-semibold text-h6 text-body leading-8 tracking-wide'>Settings</h6>
            </div>

            <div className='flex gap-x-4 items-center justify-center'>
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <Image
                        src="/home/profile-ring.svg"
                        alt="Profile Ring"
                        width={112}
                        height={112}
                        className="object-contain"
                        priority
                    />
                    
                    {/* The actual User Avatar */}
                    <div className="relative w-26 h-26 rounded-full overflow-hidden z-10">
                        <Image
                            src={user?.avatarUrl || '/images/image-avatar.svg'}
                            alt={`${user?.username}'s profile`}
                            width={86}
                            height={86}
                            className="object-cover border-gray-50 border shadow-[0px_0px_4px_0px_#00000040]"
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-y-2 flex-1 justify-center items-start'>
                    <h6 className='font-poppins font-medium text-h6 text-[#02272F] leading-10  tracking-wide'>{user?.username}</h6>
                    <p className='font-poppins text-body-xs text-[#F25B38B2] leading-6 tracking-wide'>Member since {new Date(user?.createdAt as string).getFullYear()}</p>
                    <span className='border border-gray-50 rounded-full p-2 w-10 h-10 items-center justify-center'>
                        <Link href='/logout' >
                            <Image src='/icons/' width={20} height={20} alt='log out icon' />
                        </Link>
                    </span>
                </div>

                <div className='border-t border-gray-50 pt-4 gap-y-4 flex flex-col'>
                    {/* {navContent?.map((nav) => (
                        <div key={nav.id} className={`flex group items-center justify-center border rounded-m py-6 px-4 gap-x-4 bg-transparent border-transparent group-hover:bg-primary-50 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:border-gray-50 `}>
                            <Image src={nav.icon} width={19} height={18} alt='icons' />
                            <p className='font-poppins text-body-s leading-6 text-body group-hover-text-primary-500 '>{nav.text}</p>
                            <span className='border rounded-s bg-primary-500 p-1 items-center justify-center'>
                                <p className='text-white text-body-xs'>
                                    {nav.notification > 0 && String(nav.notification)}
                                </p>
                            </span>
                        </div>
                    ))} */}
                </div>
            </div>
        </div>
    )
}

export default SettingLeftBar