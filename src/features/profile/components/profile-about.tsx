'use client'

import { useState } from 'react'
import { User } from '@/types'
import { LinkIcon, MapPin } from 'lucide-react'
import Image from 'next/image'
import ProfileBioOverlay from './profile-bio-overlay'
import ProfileAboutEmpty from './profile-about-empty'

const ProfileAboutTab = ({ user }: { user: User }) => {
    const [showBioOverlay, setShowBioOverlay] = useState(false)

    const socialLinks = [
        { icon: '/socials/instagram-grey.svg', link: user.instagramLink },
        { icon: '/socials/facebook-grey.svg', link: user.facebookLink },
        { icon: '/socials/twitter-grey.svg', link: user.twitterLink },
        { icon: '/socials/behance-grey.svg', link: user.behanceLink }
    ].filter(social => social.link)

    const hasLocation = Boolean(user?.state || user?.country)

    if (!user.bio) {
        return (
            <ProfileAboutEmpty />
        )
    }

    return (
        <div className='flex w-full flex-col items-center justify-center bg-white'>
            <div className='flex w-full flex-col gap-8 px-4 py-10 md:px-8 md:py-12 lg:flex-row lg:gap-[132px] lg:px-[148px]'>
                {/* LEFT COLUMN */}
                <div className='flex w-full flex-1 flex-col gap-6'>

                    {/* BIO SECTION */}
                    <div className='flex w-full flex-col gap-6'>
                        <p className='font-raleway font-semibold text-headoing text-body-m lg:text-body-xl'>Bio</p>
                        <div className='flex w-full flex-col gap-2 rounded-2xl border border-gray-50 p-6'>
                            <h5 className='line-clamp-3 font-poppins text-body-s lg:text-body-l leading-8 tracking-wide text-body'>
                                {user?.bio || 'No bio available.'}
                            </h5>

                            {user?.bio && (
                                <button onClick={() => setShowBioOverlay(true)} className='flex w-fit items-center gap-2'>
                                    <p className='font-poppins font-medium text-body-xxs lg:text-body-s text-primary-500 leading-6 tracking-wide'>Read more</p>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 19L17 12L11 5" stroke="#F25B38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M6.99976 19L12.9998 12L6.99976 5" stroke="#F25B38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ART FOCUS */}
                    {user?.interests && user.interests.length > 0 && (
                        <div className='flex w-full flex-col gap-6'>
                            <p className='font-raleway font-semibold text-gray-500 text-body-xl leading-8 tracking-wide'>Art Focus</p>
                            <div className='flex w-full flex-col gap-3'>
                                {user.interests.map((item, index) => (
                                    <div key={index} className='w-full rounded-2xl border border-gray-50 px-6 py-3'>
                                        <p className='font-poppins font-medium text-body-s text-primary-500 leading-6 tracking-wide'>{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LOCATION */}
                    {hasLocation && (
                        <div className='flex w-full flex-col gap-6'>
                            <p className='font-raleway font-semibold text-gray-500 text-body-xl leading-8 tracking-wide'>Location</p>
                            <div className='flex w-full items-center gap-3 rounded-2xl border border-gray-50 px-6 py-3'>
                                <MapPin size={20} className='shrink-0 text-gray-400' />
                                <p className='font-poppins font-medium text-body-s leading-6 text-primary-500 tracking-wide'>
                                    {[user?.state, user?.country].filter(Boolean).join(', ')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN */}
                <div className='flex w-full flex-1 flex-col gap-6'>

                    {/* STATS */}
                    <div className='flex w-full flex-col gap-6'>
                        <p className='font-raleway font-semibold text-gray-500 text-body-xl leading-8 tracking-wide'>Stats</p>
                        <div className='flex w-full flex-wrap items-center justify-between gap-6 rounded-2xl border border-gray-50 p-6'>
                            <div className='flex flex-col gap-4'>
                                <p className='font-poppins text-gray-400 text-body-xl leading-8 tracking-wide'>
                                    <span className='text-primary-500'>{(user?.followingCount ?? 0).toLocaleString()}</span> Following
                                </p>
                                <p className='font-poppins text-gray-400 text-body-xl leading-8 tracking-wide'>
                                    <span className='text-primary-500'>{(user?.likesCount ?? 0).toLocaleString()}</span> Likes
                                </p>
                            </div>

                            <div className='flex flex-col gap-4'>
                                <p className='font-poppins text-gray-400 text-body-xl leading-8 tracking-wide'>
                                    <span className='text-primary-500'>{(user?.followersCount ?? 0).toLocaleString()}</span> Followers
                                </p>
                                <p className='font-poppins text-gray-400 text-body-xl leading-8 tracking-wide'>
                                    <span className='text-primary-500'>{(user?.viewsCount ?? 0).toLocaleString()}</span> Views
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* LINKS */}
                    {(user?.website || socialLinks.length > 0) && (
                        <div className='flex w-full flex-col gap-6'>
                            <p className='font-raleway font-semibold text-gray-500 text-body-xl leading-8 tracking-wide'>Links</p>

                            <div className='flex w-full flex-col gap-3'>
                                {user?.website && (
                                    <div className='flex w-full items-center gap-3 rounded-2xl border border-gray-50 px-6 py-3'>
                                        <LinkIcon color='#525965' width={20} height={20} className='shrink-0' />
                                        <a href={user.website} target='_blank' rel="noopener noreferrer" className='truncate font-poppins text-primary-500 text-body-s leading-6 underline'>
                                            {user.website}
                                        </a>
                                    </div>
                                )}

                                {socialLinks.map((item, index) => (
                                    <div key={index} className='flex w-full items-center gap-3 rounded-2xl border border-gray-50 px-6 py-3'>
                                        <Image src={item.icon} width={20} height={20} alt='' className='shrink-0' />
                                        <a href={item.link as string} target='_blank' rel="noopener noreferrer" className='truncate font-poppins text-gray-400 text-body-s leading-6 underline'>
                                            {item.link}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER */}
            <div className='flex w-full items-center justify-center py-10 text-center md:py-12'>
                <p className='font-poppins text-[#A19D9D] text-body-xl leading-8 tracking-wide'>
                    Member Since {user?.created_at ? new Date(user.created_at).getFullYear() : ''}
                </p>
            </div>

            {showBioOverlay && <ProfileBioOverlay user={user} onClose={() => setShowBioOverlay(false)} />}
        </div>
    )
}

export default ProfileAboutTab
