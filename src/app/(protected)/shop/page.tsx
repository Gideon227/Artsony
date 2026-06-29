import { Navbar } from '@/components/layout/navbar'
import AroundTheWorld from '@/features/shop/components/around-the-world'
import ArtGrid from '@/features/shop/components/art-grid'
import { HeroSection } from '@/features/shop/components/hero-section'
import SearchSection from '@/features/shop/components/search-section'
import TopArt from '@/features/shop/components/top-arts'
import TopPicks from '@/features/shop/components/top-picks'
import React from 'react'

const ShopPage = () => {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <SearchSection />
            <TopPicks />
            <TopArt />
            <AroundTheWorld />
            {/* <ArtGrid 
            
            /> */}
        </div>
    )
}

export default ShopPage