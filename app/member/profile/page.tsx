'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react'
import type { ProfileUpdateInput } from '@/lib/validations/member'

export default function MemberProfilePage() {
  const { update } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState<ProfileUpdateInput>({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    website: '',
    bio: '',
    category: '',
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/members/profile')
        if (!res.ok) throw new Error('Failed to load profile')
        const data = await res.json()
        setForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || '',
          companyName: data.profile?.companyName || '',
          website: data.profile?.website || '',
          bio: data.profile?.bio || '',
          category: data.profile?.category || '',
        })
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/members/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save profile')
      }

      await update({ firstName: form.firstName, lastName: form.lastName })
      setMessage({ type: 'success', text: 'Profile saved successfully.' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Member Profile</h1>
        <p className="text-muted-foreground">
          Keep your contact and business details current.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-sm ${
            message.type === 'success'
              ? 'bg-gold/10 text-gold-700'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>This information is visible to NHBBI staff and may appear in the directory.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company / Business Name</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Business Category</Label>
              <Input
                id="category"
                placeholder="e.g. Consulting, Retail, Faith-based Services"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / About</Label>
              <Textarea
                id="bio"
                rows={5}
                placeholder="Tell the community about your business and mission..."
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>

            <Button type="submit" variant="gold" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
