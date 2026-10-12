'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Save, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import type { JobInput } from '@/lib/validations/member'

type Job = JobInput & { id: string; createdAt: string; updatedAt: string }

const emptyForm: JobInput = {
  title: '',
  description: '',
  location: '',
  contactEmail: '',
  companyId: '',
  published: false,
}

export default function MemberJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState<JobInput & { id?: string }>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch('/api/members/jobs')
        if (!res.ok) throw new Error('Failed to load jobs')
        const data = await res.json()
        setJobs(data.jobs || [])
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [])

  function reset() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function edit(job: Job) {
    setForm({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location || '',
      contactEmail: job.contactEmail,
      companyId: job.companyId || '',
      published: job.published,
    })
    setEditingId(job.id)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const method = editingId ? 'PATCH' : 'POST'
      const payload = editingId ? { id: editingId, ...form } : form
      const res = await fetch('/api/members/jobs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save job')
      }

      reset()
      setMessage({ type: 'success', text: 'Job saved. It will appear after admin approval.' })
      router.refresh()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this job posting?')) return
    const res = await fetch(`/api/members/jobs?id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setMessage({ type: 'error', text: data.error || 'Delete failed' })
      return
    }
    setJobs((prev) => prev.filter((j) => j.id !== id))
    if (editingId === id) reset()
    setMessage({ type: 'success', text: 'Job deleted.' })
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Job Postings</h1>
        <p className="text-muted-foreground">Post opportunities from your business for the NHBBI community.</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-sm ${
            message.type === 'success'
              ? 'bg-gold/10 text-gold-700'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Job' : 'Post a New Job'}</CardTitle>
          <CardDescription>All job postings require admin approval before going live.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(published) => setForm((f) => ({ ...f, published }))}
              />
              <Label htmlFor="published">Submit for approval</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="gold" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {editingId ? 'Update Job' : 'Post Job'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={reset}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-navy">Your Jobs</h2>
        {jobs.length === 0 && <p className="text-muted-foreground">No jobs posted yet.</p>}
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-base">{job.title}</CardTitle>
                <CardDescription>{job.location || 'No location'} • {job.contactEmail}</CardDescription>
              </div>
              <Badge variant={job.published ? 'gold' : 'secondary'}>{job.published ? 'Published' : 'Pending'}</Badge>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => edit(job)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(job.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
