import { deriveSquareIdempotencyKey } from './idempotency'
import { getSquareClient, getSquareLocationId, squareMoney, fromSquareMoney } from './client'
import { z } from 'zod'

export const orderLineItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1).default('1'),
  catalogObjectId: z.string().optional(),
  variationId: z.string().optional(),
  basePriceCents: z.number().int().nonnegative(),
  note: z.string().optional(),
})

export const createOrderInputSchema = z.object({
  referenceId: z.string().trim().min(1).max(128),
  lineItems: z.array(orderLineItemSchema).min(1),
  buyerEmail: z.string().email().optional(),
  buyerPhone: z.string().optional(),
  buyerGivenName: z.string().optional(),
  buyerFamilyName: z.string().optional(),
  note: z.string().optional(),
  metadata: z.record(z.string()).optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>

export async function createSquareOrder(input: CreateOrderInput, actorId: string) {
  const parsed = createOrderInputSchema.parse(input)
  const square = getSquareClient()
  const locationId = getSquareLocationId()

  const lineItems = parsed.lineItems.map((item) => {
    const line: Record<string, unknown> = {
      name: item.name,
      quantity: item.quantity,
      basePriceMoney: squareMoney(item.basePriceCents),
      note: item.note,
    }

    if (item.catalogObjectId) {
      line.catalogObjectId = item.catalogObjectId
    }
    if (item.variationId) {
      line.variationId = item.variationId
    }

    return line
  })

  const orderRequest: Record<string, unknown> = {
    locationId,
    referenceId: parsed.referenceId,
    lineItems,
    metadata: parsed.metadata,
  }

  if (parsed.buyerEmail || parsed.buyerPhone || parsed.buyerGivenName || parsed.buyerFamilyName) {
    orderRequest.fulfillments = [
      {
        type: 'DIGITAL',
        state: 'PROPOSED',
      },
    ]
  }

  const response = await square.ordersApi.createOrder({
    idempotencyKey: deriveSquareIdempotencyKey('order', actorId, parsed.referenceId),
    order: orderRequest as unknown as NonNullable<Parameters<typeof square.ordersApi.createOrder>[0]['order']>,
  })

  const order = response.result.order
  if (!order?.id) {
    throw new Error('Square did not return an order ID')
  }

  const totalCents = order.totalMoney?.amount ? Number(order.totalMoney.amount) : 0

  return {
    squareOrderId: order.id,
    referenceId: parsed.referenceId,
    totalCents,
    total: totalCents / 100,
    currency: order.totalMoney?.currency ?? 'USD',
    state: order.state,
    lineItems: order.lineItems?.map((line) => ({
      uid: line.uid,
      name: line.name,
      quantity: line.quantity,
      basePriceCents: line.basePriceMoney?.amount ? Number(line.basePriceMoney.amount) : 0,
      totalCents: line.totalMoney?.amount ? Number(line.totalMoney.amount) : 0,
      catalogObjectId: line.catalogObjectId,
      variationId: 'variationId' in line && typeof line.variationId === 'string' ? line.variationId : undefined,
    })) ?? [],
    raw: order,
  }
}

export async function getSquareOrder(squareOrderId: string) {
  const square = getSquareClient()
  const response = await square.ordersApi.retrieveOrder(squareOrderId)
  return response.result.order
}

export async function calculateOrderTotal(lineItems: CreateOrderInput['lineItems']) {
  const totalCents = lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 1
    return sum + Math.round(item.basePriceCents * qty)
  }, 0)

  return {
    totalCents,
    total: totalCents / 100,
    currency: 'USD',
  }
}
