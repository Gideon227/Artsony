'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mocked featured artist — replace with /api/users/spotlight hook when ready
const SPOTLIGHT = {
  name: 'Ivan Kovačević',
  avatarUrl: '/images/image-avatar.svg',
  artworkUrl: '/images/mural-bg.jpg',
  quote: "I paint like I'm remembering something I've never seen before.",
  artworksCount: 47,
  followersCount: '2.3K',
  profileHref: '/@ivan',
}

export function CreatorCTASection() {
  return (
    <section className="w-full bg-secondary-100 py-12 md:py-16 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* ── Left: Artist spotlight ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <span className="w-1 h-6 rounded-full bg-primary-500 shrink-0" />
              <p className="font-poppins text-[12px] font-semibold text-primary-500 uppercase tracking-[0.08em]">
                Artist Spotlight
              </p>
            </div>

            {/* Artist card */}
            <Link
              href={SPOTLIGHT.profileHref}
              className="flex items-center gap-4 group w-fit"
            >
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/60 shadow-sm">
                <Image
                  src={SPOTLIGHT.avatarUrl}
                  alt={SPOTLIGHT.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-raleway font-semibold text-[18px] text-neutral-700 group-hover:text-primary-500 transition-colors leading-tight">
                  {SPOTLIGHT.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-poppins text-[12px] text-neutral-400">
                    {SPOTLIGHT.artworksCount} works
                  </span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span className="font-poppins text-[12px] text-neutral-400">
                    {SPOTLIGHT.followersCount} followers
                  </span>
                </div>
              </div>
              <ChevronsRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 transition-all group-hover:translate-x-0.5 ml-2" />
            </Link>

            {/* Quote */}
            <blockquote className="border-l-2 border-primary-500 pl-4">
              <p className="font-poppins text-[14px] italic leading-7 text-neutral-500">
                "{SPOTLIGHT.quote}"
              </p>
            </blockquote>

            {/* Stats row */}
            <div className="flex items-center gap-6">
              <Stat label="Works" value={String(SPOTLIGHT.artworksCount)} />
              <Stat label="Followers" value={SPOTLIGHT.followersCount} />
              <Stat label="Collections" value="12" />
            </div>
          </motion.div>

          {/* ── Right: Artwork image + Upload CTA ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="relative rounded-[32px] overflow-hidden aspect-video md:aspect-[4/3]">
              <Image
                src={SPOTLIGHT.artworkUrl}
                alt="Featured artwork"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3">
              <p className="font-raleway font-semibold text-[20px] md:text-[24px] text-neutral-700 leading-tight">
                Ready to share your art with the world?
              </p>
              <p className="font-poppins text-[13px] text-neutral-400 leading-6">
                Join thousands of creators and collectors on Artsony. Upload your first piece in minutes.
              </p>
              <div className="flex items-center gap-3 mt-1">
                <Button
                  variant="primary"
                  size="md"
                  className="font-poppins"
                  asChild
                >
                  <Link href="/upload">Start Uploading</Link>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="font-poppins"
                  asChild
                >
                  <Link href="/discover">Explore Art</Link>
                </Button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-raleway font-semibold text-[20px] text-neutral-700">{value}</span>
      <span className="font-poppins text-[11px] text-neutral-400 uppercase tracking-wider">{label}</span>
    </div>
  )
}