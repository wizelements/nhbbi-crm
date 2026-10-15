import { arePreviewSquareTransactionsDisabled } from '@/lib/square/preview-gate'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSquareOrder, createOrderInputSchema } from '@/lib/square/orders'
import { auth } from '@/lib/auth/index'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  if (arePreviewSquareTransactionsDisabled()) {
    return NextResponse.json({ success: false, error: 'Square payment services are disabled in preview' }, { status: 503 })
  }
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createOrderInputSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const order = await createSquareOrder(parsed.data, session.user.id)

    return NextResponse.json({
      success: true,
      squareOrderId: order.squareOrderId,
      referenceId: order.referenceId,
      totalCents: order.totalCents,
      total: order.total,
      currency: order.currency,
      state: order.state,
      lineItems: order.lineItems,
    })
  } catch (error) {
    console.error('[SQUARE CREATE ORDER]', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Square order',
      },
      { status: 500 }
    )
  }
}
