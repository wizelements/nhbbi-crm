import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
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
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
