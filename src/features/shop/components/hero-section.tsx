'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronsRight } from 'lucide-react';
import Image from 'next/image';

export const HeroSection = () => {
    // Hardcoded to a single static image and details: TODO: MAKE IT DYNAMIC
    const heroData = {
        image: '/images/mural-bg.jpg',
        title: <>Buy What You Love, <br /> Sell What You Make.</>,
        artistName: 'Ivan Kovačević',
        artistAvatar: '/images/image-avatar.svg',
        quote: "I paint like I'm remembering something I've never seen before.",
    };

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black">
            {/* Background Image with slow zoom effect */}
            <motion.div 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 8, ease: "linear" }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${heroData.image}')` }}
            >
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            </motion.div>

            {/* Content Layout */}
            <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-8">
                
                {/* Main Title */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="max-w-5xl mx-auto flex justify-center"
                >
                    <h1 className="text-white font-raleway font-semibold text-[64px] max-md:text-[32px] max-md:leading-10 leading-18 text-center tracking-wide">
                        {heroData.title}
                    </h1>
                </motion.div>

                {/* Artist Info */}
                <div className="absolute bottom-16 left-6 md:left-16 lg:left-24 max-w-2xl">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="flex items-center gap-2 mb-4 group cursor-pointer w-fit"
                    >
                        <Image 
                            src={heroData.artistAvatar} 
                            alt={heroData.artistName}
                            width={40}
                            height={40} 
                            className="w-10 h-10 rounded-full border border-white/30 object-cover"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-white text-[12px] font-poppins font-medium tracking-tight">
                                {heroData.artistName}
                            </span>
                            <ChevronsRight className="text-white/70 w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </div>
                    </motion.div>   

                    <motion.p 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="text-white/80 text-[12px] md:text-[14px] font-medium italic leading-relaxed max-w-lg"
                    >
                        “{heroData.quote}”
                    </motion.p>
                </div>
            </div>
        </div>
    );
};