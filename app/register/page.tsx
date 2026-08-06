import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata = {
  title: 'Create account — NHBBJ',
  description: 'Create your NHBBJ member account.',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="h-[40rem] w-full max-w-md animate-pulse rounded-xl bg-muted" />}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
