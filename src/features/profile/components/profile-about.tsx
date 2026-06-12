import { User } from '@/types'
import { LinkIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const ProfileAboutTab = ({ user }: { user: User }) => {
    const socialLinks = [
        { icon: '/socials/instagram-grey.svg', link: user.instagramLink },
        { icon: '/socials/facebook-grey.svg', link: user.facebookLink },
        { icon: '/socials/twitter-grey.svg', link: user.twitterLink },
        { icon: '/socials/behance-grey.svg', link: user.behanceLink }
    ].filter(social => social.link)

    return (
        <div className='flex flex-col justify-center items-center w-full bg-white'>
            <div className='w-full py-12 px-[148px] flex flex-col md:flex-row gap-12 md:gap-[132px]' style={{ paddingInline: 148, gap: 132 }}>                
                {/* LEFT COLUMN - flex-1 allows it to stretch and fill 50% of the available width */}
                <div className='flex-1 flex flex-col gap-y-6 w-full' style={{ gap: 24 }}>
                    
                    {/* BIO SECTION */}
                    <div className='flex flex-col w-full gap-y-6'>
                        <p className='font-raleway font-semibold text-gray-500 text-body-xl leading-8 tracking-wide'>Bio</p>
                        <div className='flex flex-col border border-gray-50 rounded-2xl p-6 gap-2 w-full'>
                            <h5 className='font-poppins text-body-l text-gray-400 leading-8 tracking-wide line-clamp-3'>
                                {user?.bio || 'No bio available.'}
                            </h5>
                            
                            <button className='flex items-center gap-2 w-fit'>
                                <p className='font-poppins font-medium text-body-s text-primary-500 leading-6 tracking-wide'>Read more</p>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Note: React requires camelCase for strokeWidth */}
                                    <path d="M11 19L17 12L11 5" stroke="#F25B38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6.99976 19L12.9998 12L6.99976 5" stroke="#F25B38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* ART FOCUS */}
                    <div className='flex flex-col gap-y-6 w-full'>
                        <p className='font-raleway font-semibold text-gray-500 text-body-xl leading-8 tracking-wide'>Art Focus</p>
                        <div className='flex flex-col gap-3 w-full'>
                            {user?.interests?.map((item, index) => (
                                <div key={index} className='border border-gray-50 rounded-2xl py-3 px-6 w-full'>
                                    <p className='font-poppins font-medium text-body-s text-primary-500 leading-6 tracking-wide'>{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LOCATION */}
                    <div className='flex flex-col gap-y-6 w-full'>
                        <p className='font-raleway font-semibold text-gray-500 text-body-xl leading-8 tracking-wide'>Location</p>
                        <div className='border border-gray-50 rounded-2xl py-3 px-6 w-full flex gap-3 items-center'>
                            <Image src='/icons/map-point.svg' width={20} height={20} alt='location' />
                            <p className='font-poppins font-medium text-body-s leading-6 text-primary-500 tracking-wide'>
                                {user?.state}, {user?.country}
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - flex-1 allows it to match the left column's width */}
                <div className='flex-1 flex flex-col w-full' style={{ gap: 24 }}>
                    
                    {/* STATS */}
                    <div className='flex flex-col gap-y-6 w-full'>
                        <p className='font-raleway font-semibold text-gray-500 text-body-xl leading-8 tracking-wide'>Stat</p>
                        <div className='border border-gray-50 rounded-2xl p-6 flex w-full justify-between items-center'>
                            <div className='flex flex-col gap-4'>
                                <p className='font-poppins text-gray-400 text-body-xl leading-8 tracking-wide'>
                                    <span className='text-primary-500'>{user?.followingCount || 0}</span> Following
                                </p>
                                <p className='font-poppins text-gray-400 text-body-xl leading-8 tracking-wide'>
                                    <span className='text-primary-500'>{user?.likesCount || 0}</span> Likes
                                </p>
                            </div>

                            <div className='flex flex-col gap-4'>
                                <p className='font-poppins text-gray-400 text-body-xl leading-8 tracking-wide'>
                                    <span className='text-primary-500'>{user?.followersCount || 0}</span> Followers
                                </p>
                                <p className='font-poppins text-gray-400 text-body-xl leading-8 tracking-wide'>
                                    <span className='text-primary-500'>{user?.viewsCount || 0}</span> Views
                                </p>
                            </div>
                        </div>
                    </div> 

                    {/* LINKS */}
                    <div className='flex flex-col gap-y-6 w-full'>
                        <p className='font-raleway font-semibold text-gray-500 text-body-xl leading-8 tracking-wide'>Links</p>
                        
                        <div className='flex flex-col gap-3 w-full'>
                            {user?.website && (
                                <div className='border border-gray-50 rounded-2xl py-3 px-6 w-full flex items-center gap-3'>
                                    <LinkIcon color='#525965' width={20} height={20} className='shrink-0' />
                                    <a href={user.website} target='_blank' rel="noopener noreferrer" className='font-poppins text-primary-500 text-body-s leading-6 underline truncate'>
                                        {user.website}
                                    </a>
                                </div>
                            )}

                            {socialLinks.map((item, index) => (
                                <div key={index} className='border border-gray-50 rounded-2xl py-3 px-6 w-full flex items-center gap-3'>
                                    <Image src={item.icon} width={20} height={20} alt='social icon' className='shrink-0' />
                                    <a href={item.link as string} target='_blank' rel="noopener noreferrer" className='font-poppins text-gray-400 text-body-s leading-6 underline truncate'>
                                        {item.link}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* FOOTER */}
            <div className='py-12 flex justify-center items-center text-center w-full'>
                <p className='font-poppins text-[#A19D9D] text-body-xl leading-8 tracking-wide'>
                    Member Since {user?.created_at ? new Date(user.created_at).getFullYear() : ''}
                </p>
            </div>
        </div>
    )
}

export default ProfileAboutTab