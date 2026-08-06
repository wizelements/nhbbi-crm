import { z } from 'zod'

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(50).optional().or(z.literal('')),
  companyName: z.string().max(200).optional().or(z.literal('')),
  website: z.string().url().max(500).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
  category: z.string().max(100).optional().or(z.literal('')),
})

export const directoryListingSchema = z.object({
  companyName: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, {
    message: 'Slug must be URL-safe (letters, numbers, hyphens).',
  }),
  description: z.string().max(2000).optional().or(z.literal('')),
  category: z.string().min(1).max(100),
  contactEmail: z.string().email().max(255).optional().or(z.literal('')),
  contactPhone: z.string().max(50).optional().or(z.literal('')),
  website: z.string().url().max(500).optional().or(z.literal('')),
  logoUrl: z.string().url().max(1000).optional().or(z.literal('')),
})

export const jobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  location: z.string().max(200).optional().or(z.literal('')),
  contactEmail: z.string().email().max(255),
  companyId: z.string().uuid().optional().or(z.literal('')),
  published: z.boolean().default(false),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type DirectoryListingInput = z.infer<typeof directoryListingSchema>
export type JobInput = z.infer<typeof jobSchema>
