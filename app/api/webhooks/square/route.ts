import { arePreviewSquareTransactionsDisabled } from '@/lib/square/preview-gate'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import {
  verifySquareWebhookSignature,
  getSquareWebhookSignatureHeader,
  isWebhookVerificationSkipped,
  parseSquareWebhookBody,
  mapSquarePaymentStatus,
  type SquareRawPayment,
  type SquareRawOrder,
} from '@/lib/square/webhooks'
import { db } from '@/lib/db'
import { orders, memberships, eventRegistrations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  if (arePreviewSquareTransactionsDisabled()) {
    return NextResponse.json({ error: 'Square webhooks are disabled in preview' }, { status: 503 })
  }
  const startTime = Date.now()
  let eventType = 'unknown'
  let eventId = 'unknown'

  try {
    const rawBody = await request.text()
    const requestUrl = request.url
    const signatureHeader = getSquareWebhookSignatureHeader(request.headers)

    const skipVerification = isWebhookVerificationSkipped()

    if (!skipVerification && !signatureHeader) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    if (!skipVerification && signatureHeader) {
      const isValid = verifySquareWebhookSignature(requestUrl, rawBody, signatureHeader)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    let event
    try {
      event = parseSquareWebhookBody(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    eventType = event.type
    eventId = event.eventId

    if (!event.data?.object) {
      return NextResponse.json({ error: 'Invalid event structure' }, { status: 400 })
    }

    const payment = event.data.object.payment || event.data.object
    const order = event.data.object.order || event.data.object

    switch (eventType) {
      case 'payment.created':
      case 'payment.updated':
      case 'payment.completed': {
        if (!payment?.id) break
        await handlePaymentWebhook(payment)
        break
      }
      case 'order.created':
      case 'order.updated': {
        if (!order?.id) break
        await handleOrderWebhook(order)
        break
      }
      default: {
        break
      }
    }

    return NextResponse.json({
      received: true,
      eventType,
      eventId,
      processedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    })
  } catch (error) {
    console.error('[SQUARE WEBHOOK]', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', eventType, eventId },
      { status: 500 }
    )
  }
}

export async function GET() {
  if (arePreviewSquareTransactionsDisabled()) {
    return NextResponse.json({ status: 'disabled', environment: 'preview', paymentProcessing: false }, { status: 503 })
  }
  return NextResponse.json({
    status: 'active',
    environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
    timestamp: new Date().toISOString(),
    webhookTypes: [
      'payment.created',
      'payment.updated',
      'payment.completed',
      'order.created',
      'order.updated',
    ],
  })
}

async function handlePaymentWebhook(payment: SquareRawPayment) {
  const referenceId = payment.reference_id
  const squareOrderId = payment.order_id
  const squarePaymentId = payment.id
  const status = mapSquarePaymentStatus(payment.status)
  const totalCents = payment.total_money?.amount ? Number(payment.total_money.amount) : 0

  if (!referenceId && !squareOrderId) {
    return
  }

  const existingOrder = referenceId
    ? await db.query.orders.findFirst({ where: eq(orders.id, referenceId) })
    : squareOrderId ? await db.query.orders.findFirst({ where: eq(orders.squareOrderId, squareOrderId) }) : null

  if (!existingOrder) {
    return
  }

  if (existingOrder.status === 'paid' && status !== 'refunded') {
    return
  }

  await db
    .update(orders)
    .set({
      status,
      squareOrderId: squareOrderId ?? existingOrder.squareOrderId,
      totalCents,
      metadata: JSON.stringify({
        ...(existingOrder.metadata ? JSON.parse(existingOrder.metadata) : {}),
        squarePaymentId,
        receiptUrl: payment.receipt_url,
        cardBrand: payment.card_details?.card?.card_brand,
        cardLast4: payment.card_details?.card?.last_4,
        paidAt: status === 'paid' ? new Date().toISOString() : undefined,
      }),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, existingOrder.id))

  if (existingOrder.type === 'membership' && status === 'paid') {
    await db
      .update(memberships)
      .set({
        status: 'active',
        squareOrderId: squareOrderId ?? existingOrder.squareOrderId,
        squareSubscriptionId: squarePaymentId,
        updatedAt: new Date(),
      })
      .where(eq(memberships.squareOrderId, existingOrder.squareOrderId))
  }

  if (existingOrder.type === 'event' && status === 'paid') {
    await db
      .update(eventRegistrations)
      .set({
        paymentStatus: 'paid',
        squareOrderId: squareOrderId ?? existingOrder.squareOrderId,
      })
      .where(eq(eventRegistrations.squareOrderId, existingOrder.squareOrderId))
  }
}

async function handleOrderWebhook(squareOrder: SquareRawOrder) {
  const squareOrderId = squareOrder.id
  if (!squareOrderId) return

  const existingOrder = await db.query.orders.findFirst({
    where: eq(orders.squareOrderId, squareOrderId),
  })

  if (!existingOrder) return

  const totalCents = squareOrder.total_money?.amount
    ? Number(squareOrder.total_money.amount)
    : existingOrder.totalCents

  await db
    .update(orders)
    .set({
      totalCents,
      metadata: JSON.stringify({
        ...(existingOrder.metadata ? JSON.parse(existingOrder.metadata) : {}),
        orderState: squareOrder.state,
        version: squareOrder.version,
      }),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, existingOrder.id))
}
