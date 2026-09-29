// lib/reviews/context.ts — shared helpers for the review workflow.
//
// Two contexts exist:
//   • owner — the owner portal at /owner/properties/pending
//   • admin — the admin portal at /admin/reviews
//
// Both portals share the same page component; `context` tells it where
// to send "back" links, where to redirect after actions, and which
// permissions to check.
//
// Permissions:
//   • properties:review — approve / reject listings
//   • properties:assign — assign an agent to a property
//
// ADMIN bypasses every check.

export const REVIEW_PERMISSION = 'properties:review'
export const ASSIGN_PERMISSION = 'properties:assign'

export type ReviewContext = 'owner' | 'admin'

// Normalizes the `context` query param. Missing or unknown values
// default to 'owner'.
export function normalizeReviewContext(
  context?: string | null,
): ReviewContext {
  return context === 'admin' ? 'admin' : 'owner'
}

// The review queue's base URL for a given context. Used for "back"
// links, redirects, and form action targets.
export function getReviewBasePath(context: ReviewContext): string {
  return context === 'admin' ? '/admin/reviews' : '/owner/properties/pending'
}

// Can this session manage reviews (approve / reject)?
//   • ADMIN always
//   • OWNER only with the properties:review permission
//   • Everyone else never
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

// Can this session assign agents to properties?
// Same rules as canReviewProperties, different permission.
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