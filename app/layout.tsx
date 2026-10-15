import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { isReadOnlyPreview } from '@/lib/preview/read-only'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'NHBBJ — Bronner Business Institute',
  description: 'Encouraging, equipping, and empowering men and women of God to launch, grow, and expand successful businesses.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            {isReadOnlyPreview() && (
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-950" role="status">
                NHBBI release preview — public content only. Sign-in, administration, registrations and payment processing are disabled.
              </div>
            )}
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
