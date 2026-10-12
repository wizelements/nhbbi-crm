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
import type { users, memberships, memberProfiles } from '@/lib/db'

type Member = Pick<typeof users.$inferSelect, 'id' | 'email' | 'role' | 'firstName' | 'lastName' | 'createdAt'> & {
  membership: typeof memberships.$inferSelect | null
  profile: typeof memberProfiles.$inferSelect | null
}

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  async function updateMember(userId: string, payload: Record<string, unknown>) {
    setLoading((prev) => ({ ...prev, [userId]: true }))
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...payload }),
      })
      if (!res.ok) throw new Error('Update failed')
      router.refresh()
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-left text-muted-foreground">
            <th className="pb-3 font-medium">Name / Email</th>
            <th className="pb-3 font-medium">Company</th>
            <th className="pb-3 font-medium">Tier</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Joined</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((member) => (
            <tr key={member.id} className="group">
              <td className="py-3">
                <div className="font-medium">{member.firstName} {member.lastName}</div>
                <div className="text-xs text-muted-foreground">{member.email}</div>
              </td>
              <td className="py-3">{member.profile?.companyName ?? '—'}</td>
              <td className="py-3">
                <Select
                  value={member.membership?.tier ?? 'bronze'}
                  onValueChange={(tier) => updateMember(member.id, { membershipTier: tier })}
                  disabled={loading[member.id]}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="py-3">
                <Badge variant={member.membership?.status === 'active' ? 'navy' : 'outline'}>
                  {member.membership?.status ?? 'none'}
                </Badge>
              </td>
              <td className="py-3">{member.createdAt ? formatDate(member.createdAt) : '—'}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  {member.membership?.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={() => updateMember(member.id, { membershipStatus: 'active', profileApproved: true })}
                      disabled={loading[member.id]}
                    >
                      Approve
                    </Button>
                  )}
                  {member.membership?.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMember(member.id, { membershipStatus: 'cancelled' })}
                      disabled={loading[member.id]}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
