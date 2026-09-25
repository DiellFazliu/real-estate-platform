import type { Session } from 'next-auth'

export const REVIEW_PERMISSION = 'properties:review'
export const ASSIGN_PERMISSION = 'properties:assign'

export type ReviewContext = 'owner' | 'admin'

/**
 * Normalizon `context` query param në një vlerë të njohur.
 * Mungesa → 'owner'. Çdo vlerë e panjohur → 'owner'.
 */
export function normalizeReviewContext(
  context?: string | null,
): ReviewContext {
  return context === 'admin' ? 'admin' : 'owner'
}

/**
 * Rruga e radhës së review sipas kontekstit.
 * Përdoret për links "back", redirect, dhe form actions.
 */
export function getReviewBasePath(context: ReviewContext): string {
  return context === 'admin' ? '/admin/reviews' : '/owner/properties/pending'
}

/**
 * A mundet sesioni të menaxhojë reviews (aprovojë / refuzojë)?
 *
 *  - ADMIN gjithmonë mundet
 *  - OWNER vetëm me permission `properties:review`
 *  - Të tjerët asnjëherë
 */
export function canReviewProperties(
  session: { user?: { role?: string; permissions?: string[] } } | null,
): boolean {
  if (!session?.user) return false

  const role = session.user.role
  if (role === 'ADMIN') return true

  return (
    role === 'OWNER' &&
    (session.user.permissions?.includes(REVIEW_PERMISSION) ?? false)
  )
}

/**
 * A mundet sesioni të caktojë agjentë?
 */
export function canAssignAgents(
  session: { user?: { role?: string; permissions?: string[] } } | null,
): boolean {
  if (!session?.user) return false

  const role = session.user.role
  if (role === 'ADMIN') return true

  return (
    role === 'OWNER' &&
    (session.user.permissions?.includes(ASSIGN_PERMISSION) ?? false)
  )
}