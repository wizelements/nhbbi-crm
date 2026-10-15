import { arePreviewSquareTransactionsDisabled } from '@/lib/square/preview-gate'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import {
  syncMembershipTier,
  syncEventCatalogItem,
  listCatalogItems,
  membershipCatalogInputSchema,
  eventCatalogInputSchema,
} from '@/lib/square/catalog'
import { auth } from '@/lib/auth/index'

export async function GET(request: NextRequest) {
  if (arePreviewSquareTransactionsDisabled()) {
    return NextResponse.json({ success: false, error: 'Square payment services are disabled in preview' }, { status: 503 })
  }
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const types = searchParams.get('types')?.split(',').filter(Boolean) ?? ['ITEM', 'CATEGORY']

    const items = await listCatalogItems(types)

    return NextResponse.json({
      success: true,
      count: items.length,
      items,
    })
  } catch (error) {
    console.error('[SQUARE CATALOG GET]', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list Square catalog',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (arePreviewSquareTransactionsDisabled()) {
    return NextResponse.json({ success: false, error: 'Square payment services are disabled in preview' }, { status: 503 })
  }
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    if (body.type === 'membership') {
      const parsed = membershipCatalogInputSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid membership input', issues: parsed.error.issues },
          { status: 400 }
        )
      }
      const result = await syncMembershipTier(parsed.data)
      return NextResponse.json({ success: true, type: 'membership', result })
    }

    if (body.type === 'event') {
      const parsed = eventCatalogInputSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid event input', issues: parsed.error.issues },
          { status: 400 }
        )
      }
      const result = await syncEventCatalogItem(parsed.data)
      return NextResponse.json({ success: true, type: 'event', result })
    }

    return NextResponse.json(
      { error: 'Invalid type. Expected "membership" or "event".' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[SQUARE CATALOG POST]', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync Square catalog item',
      },
      { status: 500 }
    )
  }
}
