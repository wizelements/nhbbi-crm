import Link from 'next/link'
import { PublicShell } from '@/components/layout/public-shell'
import { PageBanner } from '@/components/public/page-banner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Register — NHBBJ',
  description: 'Create your BBI member account.',
}

export default function RegisterPage() {
  return (
    <PublicShell>
      <PageBanner title="Join BBI" subtitle="Create your member account." />

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardContent className="p-6">
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" />
                </div>
                <Button type="submit" variant="gold" className="w-full">
                  Create Account
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already a member?{' '}
                <Link href="/login" className="text-gold hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicShell>
  )
}
