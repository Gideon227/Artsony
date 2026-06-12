// 'use client';

// import { Spinner } from "@/components";
// import Footer from "@/components/layout/footer";
// import { Navbar } from "@/components/layout/navbar"
// import { HeroSection } from "@/features/home/components/hero";
// import { useLogout } from "@/hooks/use-auth-mutations";
// import { useAuthStore } from "@/store";

// const HomePage = () => {
//    const user   = useAuthStore((s) => s.user)
//   const isHydrated = useAuthStore((s) => s.isHydrated)
//   const { mutate: logout, isPending: isLoggingOut } = useLogout()
 
//   // Wait for session bootstrap before rendering — prevents flash
//   if (!isHydrated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <Spinner size="lg" />
//       </div>
//     )
//   }

//   return (
//     <div>
//       <Navbar />
//       <HeroSection 
//         // backgroundImage="/images/mural-bg.jpg" 
//         // title={<>Buy What You Love.<br />Sell What You Make.</>}
//         // artistName="Ivan Kovačević"
//         // artistAvatar="/avatar-ivan.jpg"
//         // quote="I paint like I'm remembering something I've never seen before."
//       />
//       <Footer />
//     </div>
//   )
// }

// export default HomePage


'use client'

import { Spinner } from '@/components'
import Footer from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { HeroSection } from '@/features/home/components/hero'
import { FeaturedSection } from '@/features/home/components/featured-section'
import { FeedSection } from '@/features/home/components/feed-section'
import { CreatorCTASection } from '@/features/home/components/creator-cta-section'
import { useAuthStore } from '@/store'
import FilterComponent, { FilterDropdownConfig } from '@/features/home/components/filter'
import { useState } from 'react'
import { DropdownOption } from '@/components/ui/dropdown'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { GalleryPulseSection } from '@/features/home/components/gallery-pulse-section'
import { ArtCard } from '@/components/ui/art-card'
import { MoodboardCard, MoodboardItem } from '@/components/ui/moodboard'

interface MoodboardGridProps {
  items: MoodboardItem[];
  onCreateNew: () => void;
  onCardClick: (id: string) => void;
}

const MOCK_DATA = {
  image: "/images/image-avatar.svg",
  title: "Placeholder",
  artist: [
    {
      id: '0',
      name: "Ivan Kovačević",
      avatarUrl: "/images/image-avatar.svg"
    },
    {
      id: '1',
      name: "Ivan Kovačević",
      avatarUrl: "/images/image-avatar.svg"
    },
    {
      id: '2',
      name: "Ivan Kovačević",
      avatarUrl: "/images/image-avatar.svg"
    },
  ],
  stats: { likes: "55.5k", views: "108k" },
  alternate: true
}

const HomePage = () => {
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const { user } = useAuthStore()

  console.log("User data: ", user)

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const categoriesOption: DropdownOption[] = INTERESTS.map((item) => ({
    id: item.id,
    icon: item.image,
    label: item.label
  }))

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedColor(null);
    setSelectedLocation(null);
  }

  const filterDropdowns: FilterDropdownConfig[] = [
    {
      id: 'category',
      options: categoriesOption,
      value: selectedCategory,
      onChange: (val) => setSelectedCategory(val),
      placeholder: 'Categories',
      leftIcon: '/icons/widget.svg'
    },
    {
      id: 'color',
      options: categoriesOption, // Replace with actual color options later
      value: selectedColor,
      onChange: (val) => setSelectedColor(val),
      placeholder: 'Color',
      leftIcon: '/icons/palette.svg'
    },
    {
      id: 'location',
      options: categoriesOption, // Replace with actual location options later
      value: selectedLocation,
      onChange: (val) => setSelectedLocation(val),
      placeholder: 'Location',
      leftIcon: '/icons/map-point.svg'
    },
  ]

  // Block render until SessionBootstrap completes so the feed
  // always has an access token ready when it first fetches.
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ──────────────────────────────────────────── */}
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <HeroSection />

      <GalleryPulseSection />

      <div className='w-1/4'>
        <ArtCard 
          {...MOCK_DATA}
        />
      </div>
      <div className='w-1/4'>
        <MoodboardCard 
          variant='populated'
          // data={{
          //   id: 'mood-board',
          //   title: 'Moodboard custom',
          //   // artworks: MOCK_DATA.stats
          // }}
        />
      </div>

      {/* ── Featured Today (teal strip) ───────────────────────────
      <FeaturedSection /> */}
      <FilterComponent
        dropdowns={filterDropdowns} 
        onClear={handleClearFilters}
      />

      {/* ── Main feed ───────────────────────────────────────────── */}
      <FeedSection />

      {/* ── Creator / Artist spotlight CTA ──────────────────────── */}
      <CreatorCTASection />

      <FeedSection />

      {/* ── Footer ──────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}

export default HomePage