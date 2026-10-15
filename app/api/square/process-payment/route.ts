import { arePreviewSquareTransactionsDisabled } from '@/lib/square/preview-gate'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { processSquarePayment, processPaymentInputSchema } from '@/lib/square/payments'
import { auth } from '@/lib/auth/index'

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
    const parsed = processPaymentInputSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const result = await processSquarePayment(parsed.data, session.user.id)

    return NextResponse.json({
      success: result.success,
      squarePaymentId: result.squarePaymentId,
      squareOrderId: result.squareOrderId,
      referenceId: result.referenceId,
      status: result.status,
      totalCents: result.totalCents,
      total: result.total,
      currency: result.currency,
      receiptUrl: result.receiptUrl,
      cardBrand: result.cardBrand,
      cardLast4: result.cardLast4,
    })
  } catch (error) {
    console.error('[SQUARE PROCESS PAYMENT]', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      },
      { status: 500 }
    )
  }
}
