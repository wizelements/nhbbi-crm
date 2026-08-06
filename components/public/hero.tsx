'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative bg-navy text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Become a BBI Champion Today
            </h1>
            <p className="text-lg text-white/90 md:text-xl">
              Encouraging, equipping, and empowering men and women of God to
              launch, grow, and expand successful businesses.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="gold">
                <Link href="/membership">Join BBI</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-navy">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-2 shadow-xl">
            <video
              controls
              poster="/images/banner/banner_2FdF0B1c-4BD4-B406-b6D6-CBd074FE6060.jpg"
              className="aspect-video w-full rounded-lg"
            >
              <source
                src="https://www.nhbbi.org/videos/NxLeveL_Promo_FINAL.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
