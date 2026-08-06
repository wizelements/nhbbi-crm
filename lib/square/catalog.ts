import { eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events, memberships } from '@/lib/db/schema'
import { getSquareClient, getSquareLocationId, squareMoney } from './client'
import { z } from 'zod'

export const membershipTierSchema = z.enum(['bronze', 'silver', 'gold'])

export const membershipCatalogInputSchema = z.object({
  tier: membershipTierSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  durationMonths: z.number().int().min(1).default(12),
})

export const eventCatalogInputSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
})

export type MembershipCatalogInput = z.infer<typeof membershipCatalogInputSchema>
export type EventCatalogInput = z.infer<typeof eventCatalogInputSchema>

const MEMBERSHIP_CATEGORY_NAME = 'NHBBJ Memberships'
const EVENTS_CATEGORY_NAME = 'NHBBJ Events'

async function ensureCategory(name: string) {
  const square = getSquareClient()
  const locationId = getSquareLocationId()

  const list = await square.catalogApi.searchCatalogObjects({
    objectTypes: ['CATEGORY'],
    query: { textQuery: { keywords: [name] } },
  })

  const objects = list.result.objects ?? []

  const existing = objects.find(
    (obj: any) => obj.categoryData?.name?.toLowerCase() === name.toLowerCase()
  )

  if (existing?.id) {
    return existing.id
  }

  const response = await square.catalogApi.upsertCatalogObject({
    idempotencyKey: crypto.randomUUID(),
    object: {
      type: 'CATEGORY',
      id: '#category',
      categoryData: { name },
    },
  })

  const categoryId = response.result.catalogObject?.id
  if (!categoryId) {
    throw new Error(`Failed to create Square category: ${name}`)
  }

  return categoryId
}

export async function syncMembershipTier(input: MembershipCatalogInput) {
  const parsed = membershipCatalogInputSchema.parse(input)
  const square = getSquareClient()
  const locationId = getSquareLocationId()
  const categoryId = await ensureCategory(MEMBERSHIP_CATEGORY_NAME)

  const itemIdempotencyKey = `membership-tier-${parsed.tier}-${new Date().toISOString().slice(0, 10)}`

  const response = await square.catalogApi.upsertCatalogObject({
    idempotencyKey: itemIdempotencyKey,
    object: {
      type: 'ITEM',
      id: `#membership-${parsed.tier}`,
      itemData: {
        name: parsed.name,
        description: parsed.description,
        categoryId,
        variations: [
          {
            type: 'ITEM_VARIATION',
            id: `#membership-${parsed.tier}-variation`,
            itemVariationData: {
              name: `${parsed.durationMonths}-month`,
              pricingType: 'FIXED_PRICING',
              priceMoney: squareMoney(parsed.priceCents),
              trackInventory: false,
            },
          },
        ],
      },
    },
  })

  const item = response.result.catalogObject
  if (!item?.id) {
    throw new Error('Square did not return a catalog item ID for membership tier')
  }

  const variation = item.itemData?.variations?.[0]
  const variationId = variation?.id

  return {
    squareItemId: item.id,
    squareVariationId: variationId,
    name: parsed.name,
    tier: parsed.tier,
    priceCents: parsed.priceCents,
  }
}

export async function syncEventCatalogItem(input: EventCatalogInput) {
  const parsed = eventCatalogInputSchema.parse(input)
  const square = getSquareClient()
  const locationId = getSquareLocationId()
  const categoryId = await ensureCategory(EVENTS_CATEGORY_NAME)

  const idempotencyKey = `event-${parsed.eventId}-${new Date().toISOString().slice(0, 10)}`

  const response = await square.catalogApi.upsertCatalogObject({
    idempotencyKey,
    object: {
      type: 'ITEM',
      id: `#event-${parsed.eventId}`,
      itemData: {
        name: parsed.title,
        description: parsed.description,
        categoryId,
        variations: [
          {
            type: 'ITEM_VARIATION',
            id: `#event-${parsed.eventId}-variation`,
            itemVariationData: {
              name: 'General Admission',
              pricingType: 'FIXED_PRICING',
              priceMoney: squareMoney(parsed.priceCents),
              trackInventory: false,
            },
          },
        ],
      },
    },
  })

  const item = response.result.catalogObject
  if (!item?.id) {
    throw new Error('Square did not return a catalog item ID for event')
  }

  const variation = item.itemData?.variations?.[0]
  const variationId = variation?.id

  await db
    .update(events)
    .set({ squareItemId: item.id, updatedAt: new Date() })
    .where(eq(events.id, parsed.eventId))

  return {
    eventId: parsed.eventId,
    squareItemId: item.id,
    squareVariationId: variationId,
    title: parsed.title,
    priceCents: parsed.priceCents,
  }
}

export async function listCatalogItems(types: string[] = ['ITEM', 'CATEGORY']) {
  const square = getSquareClient()
  const results = []
  let cursor: string | undefined

  do {
    const response: any = await square.catalogApi.listCatalog(
      undefined,
      types.join(','),
      cursor ? BigInt(cursor) : undefined,
    )

    if (response.result.objects) {
      results.push(...response.result.objects)
    }
    cursor = response.result.cursor
  } while (cursor)

  return results
}

export async function getCatalogItem(squareItemId: string) {
  const square = getSquareClient()
  const response = await square.catalogApi.retrieveCatalogObject(squareItemId)
  return response.result.object
}

export function membershipTierFromSquareItem(item: any): MembershipCatalogInput | null {
  const data = item?.itemData
  if (!data) return null

  const tier = data.variations?.[0]?.itemVariationData?.itemOptionValues?.[0]?.itemOptionId
  if (!tier || !['bronze', 'silver', 'gold'].includes(tier)) return null

  const priceMoney = data.variations?.[0]?.itemVariationData?.priceMoney
  const priceCents = priceMoney?.amount ? Number(priceMoney.amount) : 0

  return {
    tier,
    name: data.name,
    description: data.description,
    priceCents,
    durationMonths: 12,
  }
}
