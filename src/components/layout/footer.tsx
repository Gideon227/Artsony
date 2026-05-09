'use client'
import Image from 'next/image';
import Link from 'next/link';
import { 
  Mail, 
  ChevronDown, 
  Copyright, 
  ChevronsRight 
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const Footer = () => {
  const footerLinks = {
    explore: [
      { name: 'Discover art', href: '#' },
      { name: 'Artsony shop', href: '#' },
      { name: 'Art of the week', href: '#' },
      { name: 'Categories', href: '#' },
    ],
    creators: [
      { name: 'Sell artwork', href: '#' },
      { name: 'Post artwork', href: '#' },
      { name: 'Upload guidelines', href: '#' },
      { name: 'Community rules', href: '#' },
    ],
    company: [
      { name: 'FAQ', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Terms & conditions', href: '#' },
      { name: 'Privacy policy', href: '#' },
    ]
  };

  return (
    <footer className="relative w-full bg-black text-white pt-32 pb-10 overflow-hidden">
      {/* 1. The Wavy Mask/Background */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        {/* <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-[calc(135%+1.3px)] h-[100px] fill-white"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V120c63.59-1.4,124.58-14,187.43-33.15C240.54,72.34,282.23,63.73,321.39,56.44Z"></path>
        </svg> */}
      </div>

      {/* 2. Background Mural Image with Overlay */}
      <div className="absolute inset-0 z-0 bg-white">
        <Image 
          src="/images/footer-mural-bg.png" // Replace with your actual asset
          alt="Mural Background"
          fill
          className="object-cover select-none pointer-events-none"
        />
        <div className="absolute inset-0" />
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <div className="relative">
              <Image src="/icons/logo-text.svg" alt="Artsony Logo" width={270} height={72} />
            </div>

            <p className='font-poppins text-[14px] text-white leading-6 tracking-wide'>
              Where art finds its people.<br /><br />
              Discover, share, and collect original works from a growing community of visual creators.
            </p>

            <div className="flex flex-col space-y-3 max-w-sm mt-14">
              <Input 
                leftIcon={<Mail width={20} height={16} />}
                type='email'
                placeholder='Enter Email'
              />
              <Button className='h-12'>
                Subscribe to Newsletter
              </Button>
              
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-6 items-end grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-6">Explore</h4>
              <ul className="space-y-4">
                {footerLinks.explore.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white hover:text-primary-500 font-poppins text-[14px] transition-colors">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">For Creators</h4>
              <ul className="space-y-4">
                {footerLinks.creators.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white hover:text-primary-500 font-poppins text-[14px] transition-colors">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white hover:text-primary-500 font-poppins text-[14px] transition-colors">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Artist Quote Section */}
          <div className="lg:col-span-2 flex flex-col justify-start">
            <div className="flex items-center gap-3 group cursor-pointer w-fit mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                <Image src="/images/image-avatar.png" alt="Ivan" width={40} height={40} className="object-cover" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-[12px] font-poppins font-medium tracking-tight">
                  Ivan Kovačević
                </span>
                <ChevronsRight className="text-white/70 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <p className="text-[14px] font-poppins leading-6 italic tracking-wide text-white">
              "I paint like I'm remembering something I've never seen before."
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-orange-500 via-gray-800 to-transparent mb-8" />

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Link href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
              <Image src='/socials/instagram.svg' width={32} height={32} alt='instagram icon'/>
            </Link>
            <Link href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
              <Image src='/socials/facebook.svg' width={32} height={32} alt='facebook icon'/>
            </Link>
            <Link href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
              <Image src='/socials/linkedin.svg' width={32} height={32} alt='linkedin icon'/>
            </Link>
            <Link href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                <Image src='/socials/twitter.svg' width={32} height={32} alt='twitter icon'/>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium">
            <button className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-md hover:bg-white/5 transition-all">
              <ChevronDown className="w-4 h-4" />
              Language
            </button>
            <div className="flex items-center gap-2 text-gray-400">
              <Copyright className="w-4 h-4" />
              <span>2025 Artsony All rights reserved</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;