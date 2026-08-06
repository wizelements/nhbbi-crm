import { Metadata } from 'next'
import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { DonateClient } from './donate-client'

export const metadata: Metadata = {
  title: 'Donate — NHBBJ',
  description: 'Support the Bronner Business Institute with a secure donation.',
}

export default function DonatePage() {
  return (
    <PublicShell>
      <PageBanner title="Lend A Hand" subtitle="Support the mission of BBI." />

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <DonateClient />
        </div>
      </section>
    </PublicShell>
  )
}
