'use client'

import Image from 'next/image'
import Link from 'next/link'
import { 
  Copyright, 
  ChevronsRight, 
  ArrowDown
} from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useAuthStore } from '@/store'
import { truncate } from '@/utils'

const Footer = () => {
  const { user } = useAuthStore()
  const userRole = user?.role

  const footerLinks = {
    explore: [
      { name: 'Discover art', href: '/discover' },
      { name: 'Artsony shop', href: '/shop' },
      ...(userRole !== 'ARTIST' ? [{ name: 'Categories', href: '/categories' }] : []),
      { name: 'Art of the week', href: '/explore' },
      { name: 'Trending', href: '/trending' },
    ],
    creators: [
      userRole === 'ARTIST' 
        ? { name: 'Sell Artwork', href: '/artworks/upload' } 
        : { name: 'Upload Artworks', href: '/artworks/upload' },
      userRole === 'ARTIST' 
        ? { name: 'Create Post', href: '/artworks/upload' } 
        : { name: 'My Orders', href: '/my-orders' },
      userRole === 'ARTIST' 
        ? { name: 'Order Management', href: '/all-orders' } 
        : { name: 'Cart', href: '/cart' },
      userRole === 'ARTIST' 
        ? { name: 'Artsony Studio', href: '/artsony-studio' } 
        : { name: 'Messages', href: '/messages' },
      ...(userRole === 'ARTIST' ? [{ name: 'Wallet', href: '/artsony-studio' }] : []),
    ],
    company: [
      { name: 'My Profile', href: '/profile' },
      userRole === 'ARTIST' 
        ? { name: 'Creator Guidelines', href: '/creator-guideline' } 
        : { name: 'Help Center', href: '/help-center' },
      userRole === 'ARTIST' 
        ? { name: 'Shipping and Packaging', href: '/' } 
        : { name: 'Buyers Guide', href: '/' },
      userRole === 'ARTIST' 
        ? { name: 'Help Center', href: '/help-center' } 
        : { name: 'Shipping and Guide', href: '/' },
      userRole === 'ARTIST' 
        ? { name: 'Contact Support', href: '/support' } 
        : { name: 'Become a Creator', href: '/' },
    ],
  }

  const bottomFooterLinks = [
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
    { name: 'Community Guidelines', href: '/community-guidelines' },
  ]

  return (
    <footer className="relative w-full text-white pt-32 pb-10 overflow-hidden max-md:hidden">
      {/* Background Mural Image with Overlay */}
      <div className="absolute inset-0 z-0 bg-white">
        <Image 
          src="/images/footer-mural-bg.png"
          alt="Mural Background"
          fill
          className="object-fill select-none pointer-events-none"
        />
        <div className="absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-full 2xl:max-w-[95%] mx-auto px-6 lg:px-8">
        {/* Main Content Grid - 100% Height Matching */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 w-full">
          
          {/* Left Column: Brand & Newsletter (Structured 100% Height) */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full">
            <div>
              {/* Logo Header Container (Aligned to 40px height) */}
              <div className="h-10 flex items-center mb-6">
                <Image 
                  src="/icons/logo-text.svg" 
                  alt="Artsony Logo" 
                  width={200} 
                  height={40} 
                  className="h-10 w-auto object-contain"
                />
              </div>

              <p className="font-poppins text-body-s text-white leading-6 tracking-wide">
                Where art finds its people.<br /><br />
                Discover, share, and collect original works from a growing community of visual creators.
              </p>
            </div>

            {/* Newsletter Anchored to the Bottom */}
            <div className="flex flex-col space-y-4 max-w-sm mt-auto pt-8">
              <Input 
                leftIcon="/home/message.svg"
                type="email"
                placeholder="Enter Email"
                className="h-12"
              />
              <Button className="h-12" fullWidth>
                Subscribe to Newsletter
              </Button>
            </div>
          </div>

          {/* Right Columns Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 items-start mt-auto">

            {/* Explore Column */}
            <div className="flex flex-col items-start gap-y-6">
              <div className="h-10 flex items-center">
                <h4 className="font-semibold text-body-l font-poppins leading-none">Explore</h4>
              </div>
              <ul className="space-y-4">
                {footerLinks.explore.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white hover:text-primary-500 font-poppins text-body-s transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Creator Hub Column */}
            <div className="flex flex-col items-start gap-y-6">
              <div className="h-10 flex items-center">
                <h4 className="font-semibold text-body-l font-poppins leading-none">
                  {userRole ? 'Creator Hub' : 'My Artsony'}
                </h4>
              </div>
              <ul className="space-y-4">
                {footerLinks.creators.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white hover:text-primary-500 font-poppins text-[14px] transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account & Support Column */}
            <div className="flex flex-col items-start gap-y-6">
              <div className="h-10 flex items-center">
                <h4 className="font-semibold text-body-l font-poppins leading-none">Account & Support</h4>
              </div>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white hover:text-primary-500 font-poppins text-[14px] transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Profile Quote Section — only shown for signed-in users. Guests
                don't have an account to reflect here, so the block is left
                out entirely rather than showing a "Guest" placeholder. */}
            {user && (
              <div className="flex flex-col items-start justify-start">
                <div className="h-10 flex items-center mb-6">
                  <Link href="/profile" className="flex items-center gap-3 group cursor-pointer w-fit">
                    <Image 
                      src={user.avatarUrl ?? "/images/image-avatar.svg"} 
                      alt={user.username ?? "User"} 
                      width={40} 
                      height={40} 
                      className="object-cover border border-gray-50 rounded-full h-10 w-10" 
                    />
                    
                    <div className="flex items-center gap-2">
                      <span className="text-white text-[12px] font-poppins font-medium tracking-tight">
                        {user.username}
                      </span>
                      <ChevronsRight className="text-white/70 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </div>

                <p className="text-[14px] font-poppins leading-6 italic tracking-wide text-white">
                  {truncate((user.bio || "I paint like I'm remembering something I've never seen before."), 120)}
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Divider */}
        <hr className="w-full h-px text-primary-500 mb-8" />

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <Link href="#">
              <Image src="/socials/instagram.svg" width={28} height={28} alt="instagram icon" className="hover:opacity-80"/>
            </Link>
            <Link href="#">
              <Image src="/socials/facebook.svg" width={28} height={28} alt="facebook icon" className="hover:opacity-80"/>
            </Link>
            <Link href="#">
              <Image src="/socials/linkedin.svg" width={28} height={28} alt="linkedin icon" className="hover:opacity-80"/>
            </Link>
            <Link href="#">
              <Image src="/socials/twitter.svg" width={28} height={28} alt="twitter icon" className="hover:opacity-80"/>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm font-medium">
            {bottomFooterLinks.map((link) => (
              <Link key={link.name} href={link.href} className="font-poppins text-body-s text-white hover:text-primary-500 cursor-pointer font-normal leading-6 tracking-wide">
                {link.name}
              </Link>
            ))}
            
            <button className="flex cursor-pointer items-center gap-2 px-4 py-2">
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.37041 7.83515L13.8001 1.20467C14.2013 0.790938 13.9581 0 13.4297 0H0.570303C0.0418882 0 -0.201306 0.790938 0.199896 1.20467L6.62959 7.83515C6.84274 8.05495 7.15726 8.05495 7.37041 7.83515Z" fill="white"/>
              </svg>
              Language
            </button>

            <div className="flex items-center gap-2 text-white">
              <Copyright className="w-5 h-5" />
              <span>2026 Artsony All rights reserved</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer