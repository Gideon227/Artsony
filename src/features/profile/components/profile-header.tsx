import { Button } from '@/components';
import { User } from '@/types'
import { DotSquare, Ellipsis } from 'lucide-react';
import Image from 'next/image'
import React from 'react'

interface Props {
    user: User;
    whoisthis: 'me' | 'others'
    onClick: () => void
}

const ProfileHeader = ({ user, whoisthis, onClick }: Props) => {
    return (
        <div className='pb-62 relative min-h-screen bg-white'>
            <div className='w-full h-[344px] bg-[#D9D9D9]'>

            </div>

            <div className="border-2 w-md h-124  rounded-2xl border-transparent bg-gradient-to-b from-white from-[44.96%] to-[#F25B38] to-[128.93%] bg-clip-padding [background-origin:border-box] backdrop-blur-xl z-20" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                <div className="w-full h-full rounded-2xl py-12 px-8 flex flex-col gap-12 items-center justify-center" style={{ background: "linear-gradient(180deg, rgba(9, 10, 11, 0) 0%, rgba(27, 27, 27, 0.9) 85.35%)" }}>
                    <div className='flex flex-col justify-center items-center gap-4'>
                        {/* Profile Image Container */}
                        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                            <Image
                                src="/home/profile-ring.svg"
                                alt="Profile Ring"
                                width={144}
                                height={144}
                                className="object-contain"
                                priority
                            />
                            
                            {/* The actual User Avatar */}
                            <div className="relative w-26 h-26 rounded-full overflow-hidden z-10">
                                <Image
                                    src={user?.avatarUrl || '/images/image-avatar.svg'}
                                    alt={`${user?.username}'s profile`}
                                    width={104}
                                    height={104}
                                    className="object-cover border-gray-50 border shadow-[0px_0px_4px_0px_#00000040]"
                                />
                            </div>
                        </div>
                        
                        <p className='font-raleway font-semibold text-[20px] text-white leading-8 tracking-wide text-center'>{user.username || 'John Doe'}</p>

                    </div>

                    <div className='flex flex-col gap-8 items-center justify-center w-full'>
                        <div className='w-full flex items-center justify-center'>
                            <div className='w-1/3 flex flex-col gap-4 items-center justify-center'>
                                <p className='font-poppins font-medium text-body-m leading-6 text-center text-secondary-500 tracking-wide'>{user.followersCount || '0'}</p>
                                <p className='font-poppins text-body-m leading-6 text-center text-white tracking-wide'>Followers</p>
                            </div>
                            <div className='w-1/3 flex flex-col gap-4 items-center justify-center border-l border-r border-gray-50'>
                                <p className='font-poppins font-medium text-body-m leading-6 text-center text-secondary-500 tracking-wide'>{user.likesCount || '0'}</p>
                                <p className='font-poppins text-body-m leading-6 text-center text-white tracking-wide'>Followers</p>
                            </div>
                            <div className='w-1/3 flex flex-col gap-4 items-center justify-center'>
                                <p className='font-poppins font-medium text-body-m leading-6 text-center text-secondary-500 tracking-wide'>{user.followingCount || '0'}</p>
                                <p className='font-poppins text-body-m leading-6 text-center text-white tracking-wide'>Following</p>
                            </div>
                        </div>

                        {/* Fixed W-full to w-full and itens-center to items-center */}
                        <div className='w-full flex gap-6 items-center justify-center'>
                            { whoisthis === 'me' ?
                                <Button 
                                    variant='primary'
                                    leftIcon='/icons/plus-white-bg.svg'
                                    fullWidth
                                    onClick={onClick}
                                >
                                    Post Artwork
                                </Button>
                                : <Button variant='primary' leftIcon='/icons/user-check.svg'>Following</Button>
                            }

                            {whoisthis === 'me' ?
                                <Button
                                    variant='outline'
                                    leftIcon='/icons/message-white.svg'
                                    fullWidth
                                >
                                    Inbox
                                </Button>
                                : <Button variant='outline' leftIcon='/icons/chat-round.svg'>Message</Button>
                            }
                        </div>
                    </div>

                    {/* Edit icon */}
                    {whoisthis === 'me' ? 
                        <button className='absolute border-2 border-white rounded-full p-2' style={{ top: 24, right: 24 }}>
                            <Image src='/icons/pen.svg' width={20} height={20} alt='edit icon' />
                        </button>
                        : whoisthis === 'others' 
                            ? <button className='absolute border-2 flex items-center justify-center border-white rounded-full p-2' style={{ top: 24, right: 24 }}>
                                    <Ellipsis color='#fff' />
                                </button>
                            : null
                    }
                </div>
            </div>
        </div>
    )
}

export default ProfileHeader    