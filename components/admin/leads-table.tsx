'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { leads, users } from '@/lib/db'

type Lead = typeof leads.$inferSelect & { assignedEmail: string | null }

const statuses = ['new', 'contacted', 'qualified', 'closed', 'lost'] as const

export function LeadsTable({ leads, admins }: { leads: Lead[]; admins: typeof users.$inferSelect[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  async function updateLead(leadId: string, payload: Record<string, unknown>) {
    setLoading((prev) => ({ ...prev, [leadId]: true }))
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, ...payload }),
      })
      if (!res.ok) throw new Error('Update failed')
      router.refresh()
    } finally {
      setLoading((prev) => ({ ...prev, [leadId]: false }))
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-left text-muted-foreground">
            <th className="pb-3 font-medium">Name / Email</th>
            <th className="pb-3 font-medium">Interest</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Assigned To</th>
            <th className="pb-3 font-medium">Received</th>
            <th className="pb-3 font-medium">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="py-3">
                <div className="font-medium">{lead.name}</div>
                <div className="text-xs text-muted-foreground">{lead.email}</div>
                {lead.phone && <div className="text-xs text-muted-foreground">{lead.phone}</div>}
              </td>
              <td className="py-3">
                <Badge variant="outline">{lead.interest || 'General'}</Badge>
              </td>
              <td className="py-3">
                <Select
                  value={lead.status}
                  onValueChange={(status) => updateLead(lead.id, { status })}
                  disabled={loading[lead.id]}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="py-3">
                <Select
                  value={lead.assignedTo || 'unassigned'}
                  onValueChange={(value) => updateLead(lead.id, { assignedTo: value === 'unassigned' ? null : value })}
                  disabled={loading[lead.id]}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="py-3">{lead.createdAt ? formatDate(lead.createdAt) : '—'}</td>
              <td className="max-w-xs py-3 text-xs text-muted-foreground">
                {lead.message || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
