import { Suspense } from 'react'
import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { getDirectoryListings, getDirectoryCategories } from '@/lib/public/data'
import { DirectoryClient } from './directory-client'

export const metadata = {
  title: 'Business Directory — NHBBJ',
  description: 'Search and filter the BBI CHAMPION business directory.',
}

export default async function DirectoryPage() {
  const listings = await getDirectoryListings()
  const categories = await getDirectoryCategories()

  return (
    <PublicShell>
      <PageBanner title="BBI CHAMPS Business Directory" subtitle="Connect with Christian-owned businesses." />

      <section className="container mx-auto px-4 py-16">
        <Suspense fallback={<p className="text-center text-muted-foreground">Loading directory…</p>}>
          <DirectoryClient listings={listings} categories={categories} />
        </Suspense>
      </section>
    </PublicShell>
  )
}
