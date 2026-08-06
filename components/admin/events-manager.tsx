'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import type { events } from '@/lib/db'

type Event = typeof events.$inferSelect

const emptyEvent: Partial<Event> = {
  title: '',
  slug: '',
  description: '',
  location: '',
  startAt: undefined as unknown as Date,
  endAt: undefined as unknown as Date,
  priceCents: 0,
  capacity: undefined,
  published: false,
}

export function EventsManager({ events: initial }: { events: Event[] }) {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>(initial)
  const [form, setForm] = useState<Partial<Event>>(emptyEvent)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function reset() {
    setForm(emptyEvent)
    setEditingId(null)
  }

  function edit(event: Event) {
    setForm({
      ...event,
      startAt: event.startAt ? new Date(event.startAt) : (undefined as unknown as Date),
      endAt: event.endAt ? new Date(event.endAt) : (undefined as unknown as Date),
    })
    setEditingId(event.id)
  }

  async function save() {
    setLoading(true)
    try {
      const payload = {
        ...form,
        id: editingId ?? undefined,
      }
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      reset()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this event?')) return
    const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Delete failed')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Event title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="event-slug"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Event description"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={form.location ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="Location"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startAt">Start</Label>
          <Input
            id="startAt"
            type="datetime-local"
            value={form.startAt ? new Date(form.startAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => setForm((f) => ({ ...f, startAt: new Date(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endAt">End</Label>
          <Input
            id="endAt"
            type="datetime-local"
            value={form.endAt ? new Date(form.endAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value ? new Date(e.target.value) : undefined }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceCents">Price (cents)</Label>
          <Input
            id="priceCents"
            type="number"
            min={0}
            value={form.priceCents ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min={0}
            value={form.capacity ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value ? Number(e.target.value) : undefined }))}
          />
        </div>
        <div className="flex items-center gap-3 md:col-span-2">
          <Switch
            id="published"
            checked={form.published ?? false}
            onCheckedChange={(published) => setForm((f) => ({ ...f, published }))}
          />
          <Label htmlFor="published">Published</Label>
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button onClick={save} disabled={loading}>{editingId ? 'Update' : 'Create'} Event</Button>
          {editingId && <Button variant="outline" onClick={reset}>Cancel</Button>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left text-muted-foreground">
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium">Start</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="py-3">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground">{event.location ?? 'No location'}</div>
                </td>
                <td className="py-3">{event.startAt ? formatDateTime(event.startAt) : '—'}</td>
                <td className="py-3">{formatCurrency(event.priceCents)}</td>
                <td className="py-3">
                  <Badge variant={event.published ? 'navy' : 'outline'}>{event.published ? 'Published' : 'Draft'}</Badge>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => edit(event)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(event.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
