import { Suspense } from 'react'
import { PublicShell } from '@/components/layout/public-shell'
import { Hero } from '@/components/public/hero'
import { Mission } from '@/components/public/mission'
import { Services } from '@/components/public/services'
import { EventsPreview } from '@/components/public/events-preview'
import { MediaPreview } from '@/components/public/media-preview'
import { Connector } from '@/components/public/connector'

export default function HomePage() {
  return (
    <PublicShell>
      <Hero />
      <Mission />
      <Services />
      <Suspense fallback={<section className="bg-navy py-16 text-center text-white">Loading events…</section>}>
        <EventsPreview />
      </Suspense>
      <Suspense fallback={<section className="bg-gold py-16 text-center text-navy">Loading media…</section>}>
        <MediaPreview />
      </Suspense>
      <Connector />
    </PublicShell>
  )
}
