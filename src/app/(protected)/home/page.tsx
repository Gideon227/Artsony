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
import FilterComponent from '@/features/home/components/filter'

const HomePage = () => {
  const isHydrated = useAuthStore((s) => s.isHydrated)

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

      {/* ── Featured Today (teal strip) ─────────────────────────── */}
      <FeaturedSection />
      <FilterComponent />

      {/* ── Main feed ───────────────────────────────────────────── */}
      <FeedSection />

      {/* ── Creator / Artist spotlight CTA ──────────────────────── */}
      <CreatorCTASection />

      {/* ── Footer ──────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}

export default HomePage