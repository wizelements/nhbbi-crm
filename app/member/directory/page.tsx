'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import type { DirectoryListingInput } from '@/lib/validations/member'

const emptyForm: DirectoryListingInput = {
  companyName: '',
  slug: '',
  description: '',
  category: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  logoUrl: '',
}

export default function MemberDirectoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState<DirectoryListingInput & { id?: string }>(emptyForm)
  const [hasListing, setHasListing] = useState(false)

  useEffect(() => {
    async function loadListing() {
      try {
        const res = await fetch('/api/members/directory')
        if (!res.ok) throw new Error('Failed to load listing')
        const data = await res.json()
        if (data.listings?.length > 0) {
          const l = data.listings[0]
          setForm({
            id: l.id,
            companyName: l.companyName || '',
            slug: l.slug || '',
            description: l.description || '',
            category: l.category || '',
            contactEmail: l.contactEmail || '',
            contactPhone: l.contactPhone || '',
            website: l.website || '',
            logoUrl: l.logoUrl || '',
          })
          setHasListing(true)
        }
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }
    loadListing()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const method = hasListing ? 'PATCH' : 'POST'
      const payload = hasListing ? { id: form.id, ...form } : form
      const res = await fetch('/api/members/directory', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save listing')
      }

      setHasListing(true)
      setMessage({ type: 'success', text: 'Directory listing saved. It will appear after admin approval.' })
      router.refresh()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!form.id || !confirm('Delete your directory listing?')) return
    const res = await fetch(`/api/members/directory?id=${form.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setMessage({ type: 'error', text: data.error || 'Delete failed' })
      return
    }
    setForm(emptyForm)
    setHasListing(false)
    setMessage({ type: 'success', text: 'Listing deleted.' })
    router.refresh()
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
        <h1 className="text-2xl font-bold text-navy">Directory Listing</h1>
        <p className="text-muted-foreground">Showcase your business in the NHBBI member directory.</p>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Business Details</CardTitle>
            <CardDescription>All listings require admin approval before going live.</CardDescription>
          </div>
          {hasListing && (
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                placeholder="my-business"
                required
              />
              <p className="text-xs text-muted-foreground">Letters, numbers, and hyphens only.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Consulting, Retail"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={form.logoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                />
              </div>
            </div>

            <Button type="submit" variant="gold" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {hasListing ? 'Update Listing' : 'Create Listing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
