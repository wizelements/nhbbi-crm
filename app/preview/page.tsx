import Link from 'next/link'
import { PublicShell } from '@/components/layout/public-shell'

export const metadata = {
  title: 'Release Preview — NHBBI',
  description: 'Safe NHBBI application preview with client data and payments disabled.',
}

export default function PreviewStatus() {
  return (
    <PublicShell>
      <section className="container mx-auto max-w-3xl px-4 py-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-700">Isolated release preview</p>
        <h1 className="mb-6 text-4xl font-bold text-navy">NHBBI administration — preview mode</h1>
        <p className="mb-6 text-lg">
          This deployment allows review of the NHBBI website presentation without connecting to customer accounts.
          Administrator sign-in, member data, registration, and payment processing are disabled until separate
          staging credentials and end-to-end verification are complete.
        </p>
        <p className="mb-8 text-muted-foreground">
          The existing production website and database are not changed by this preview.
        </p>
        <Link href="/" className="inline-flex rounded-lg bg-navy px-6 py-3 font-semibold text-white">
          View public preview
        </Link>
      </section>
    </PublicShell>
  )
}
