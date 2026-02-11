/**
 * Data access layer for mentor data
 * Now uses Go API backend with PostgreSQL instead of direct Airtable access
 */

import type {
  MentorBase,
  MentorWithSecureFields,
  MentorListItem,
  GetAllMentorsParams,
  GetOneMentorParams,
} from '@/types'
import { getGoApiClient } from '@/lib/go-api-client'

const client = getGoApiClient()

/**
 * Get all mentors from the Go API
 */
export async function getAllMentors(params: GetAllMentorsParams = {}): Promise<MentorListItem[]> {
  return client.getAllMentors(params)
}

/**
 * Get a single mentor by slug
 */
export async function getOneMentorBySlug(
  slug: string,
  params: GetOneMentorParams = {}
): Promise<MentorBase | MentorWithSecureFields | null> {
  const result = await client.getOneMentorBySlug(slug, params)
  // Go API returns single object, not array
  return result
}

/**
 * Get a single mentor by ID
 */
export async function getOneMentorById(
  id: number,
  params: GetOneMentorParams = {}
): Promise<MentorBase | MentorWithSecureFields | null> {
  const result = await client.getOneMentorById(id, params)
  // Go API returns single object, not array
  return result
}

/**
 * Get a single mentor by UUID
 */
export async function getOneMentorByUuid(
  uuid: string,
  params: GetOneMentorParams = {}
): Promise<MentorBase | MentorWithSecureFields> {
  const result = await client.getOneMentorByUuid(uuid, params)
  // Go API returns single object, not array
  return result
}

/**
 * Force refresh the cache in Go API
 * This triggers a cache reset on the Go API side
 */
export async function forceRefreshCache(): Promise<{ success: boolean; message: string }> {
  return client.forceRefreshCache()
}
