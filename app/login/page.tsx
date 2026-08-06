import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'

export const metadata = {
  title: 'Sign in — NHBBJ',
  description: 'Sign in to your NHBBJ account.',
}

export default function LoginPage() {
  return (
    <PublicShell>
      <PageBanner title="Sign in" subtitle="Access your member or admin account." />
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-xl bg-muted" />}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </PublicShell>
  )
}
