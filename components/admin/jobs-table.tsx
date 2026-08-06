'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { jobs } from '@/lib/db'

type Job = typeof jobs.$inferSelect & { companyName: string | null; ownerEmail: string | null }

export function JobsTable({ jobs }: { jobs: Job[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  async function updateJob(jobId: string, payload: Record<string, unknown>) {
    setLoading((prev) => ({ ...prev, [jobId]: true }))
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, ...payload }),
      })
      if (!res.ok) throw new Error('Update failed')
      router.refresh()
    } finally {
      setLoading((prev) => ({ ...prev, [jobId]: false }))
    }
  }

  async function removeJob(jobId: string) {
    if (!confirm('Delete this job?')) return
    const res = await fetch(`/api/admin/jobs?id=${jobId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Delete failed')
    router.refresh()
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-left text-muted-foreground">
            <th className="pb-3 font-medium">Title</th>
            <th className="pb-3 font-medium">Company / Owner</th>
            <th className="pb-3 font-medium">Location</th>
            <th className="pb-3 font-medium">Published</th>
            <th className="pb-3 font-medium">Posted</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="py-3">
                <div className="font-medium">{job.title}</div>
                <div className="text-xs text-muted-foreground">{job.contactEmail}</div>
              </td>
              <td className="py-3 text-muted-foreground">
                {job.companyName || job.ownerEmail || '—'}
              </td>
              <td className="py-3">{job.location || '—'}</td>
              <td className="py-3">
                <Switch
                  checked={job.published ?? false}
                  onCheckedChange={(published) => updateJob(job.id, { published })}
                  disabled={loading[job.id]}
                />
              </td>
              <td className="py-3">{job.createdAt ? formatDate(job.createdAt) : '—'}</td>
              <td className="py-3">
                <div className="flex gap-2">
                  {!job.published && (
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={() => updateJob(job.id, { published: true })}
                      disabled={loading[job.id]}
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeJob(job.id)}
                    disabled={loading[job.id]}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
