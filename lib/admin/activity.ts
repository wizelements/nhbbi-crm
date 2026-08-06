import { db, activityLogs } from '@/lib/db'

export interface LogActivityInput {
  actorType: 'user' | 'ai_agent' | 'system'
  actorId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown>
}

export async function logActivity(input: LogActivityInput) {
  await db.insert(activityLogs).values({
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
  })
}
