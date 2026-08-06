'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { directoryListings } from '@/lib/db'

type Listing = typeof directoryListings.$inferSelect & { ownerEmail: string | null }

export function DirectoryTable({ listings }: { listings: Listing[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  async function updateListing(listingId: string, payload: Record<string, unknown>) {
    setLoading((prev) => ({ ...prev, [listingId]: true }))
    try {
      const res = await fetch('/api/admin/directory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, ...payload }),
      })
      if (!res.ok) throw new Error('Update failed')
      router.refresh()
    } finally {
      setLoading((prev) => ({ ...prev, [listingId]: false }))
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-left text-muted-foreground">
            <th className="pb-3 font-medium">Company</th>
            <th className="pb-3 font-medium">Category</th>
            <th className="pb-3 font-medium">Owner</th>
            <th className="pb-3 font-medium">Approved</th>
            <th className="pb-3 font-medium">Featured</th>
            <th className="pb-3 font-medium">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {listings.map((listing) => (
            <tr key={listing.id} className="group">
              <td className="py-3">
                <div className="font-medium">{listing.companyName}</div>
                <div className="text-xs text-muted-foreground">{listing.slug}</div>
              </td>
              <td className="py-3">
                <Badge variant="outline">{listing.category}</Badge>
              </td>
              <td className="py-3 text-muted-foreground">{listing.ownerEmail ?? '—'}</td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={listing.approved ?? false}
                    onCheckedChange={(approved) => updateListing(listing.id, { approved })}
                    disabled={loading[listing.id]}
                  />
                  {!listing.approved && (
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={() => updateListing(listing.id, { approved: true })}
                      disabled={loading[listing.id]}
                    >
                      Approve
                    </Button>
                  )}
                </div>
              </td>
              <td className="py-3">
                <Switch
                  checked={listing.featured ?? false}
                  onCheckedChange={(featured) => updateListing(listing.id, { featured })}
                  disabled={loading[listing.id]}
                />
              </td>
              <td className="py-3">{listing.createdAt ? formatDate(listing.createdAt) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
