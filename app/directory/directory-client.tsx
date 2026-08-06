'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Globe, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type DirectoryListing } from '@/lib/public/data'

export function DirectoryClient({
  listings,
  categories,
}: {
  listings: DirectoryListing[]
  categories: string[]
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchesQuery =
        !query ||
        l.companyName.toLowerCase().includes(query.toLowerCase()) ||
        l.description.toLowerCase().includes(query.toLowerCase()) ||
        l.category.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'all' || l.category === category
      return matchesQuery && matchesCategory
    })
  }, [listings, query, category])

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground">No businesses match your search.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <Card key={listing.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{listing.companyName}</CardTitle>
                  {listing.featured && (
                    <Badge variant="gold" className="shrink-0">
                      <Star className="mr-1 h-3 w-3" /> Featured
                    </Badge>
                  )}
                </div>
                <Badge variant="outline">{listing.category}</Badge>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="mb-4 text-sm text-muted-foreground">{listing.description}</p>
                {listing.website && (
                  <Link
                    href={listing.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
                  >
                    <Globe className="h-4 w-4" /> Visit Website
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
