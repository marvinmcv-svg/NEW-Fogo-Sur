import type { Access, FieldAccess } from 'payload'

type UserLike = { role?: string | null } | null | undefined

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)
export const isAdmin: Access = ({ req }) => (req.user as UserLike)?.role === 'admin'
export const isAdminField: FieldAccess = ({ req }) => (req.user as UserLike)?.role === 'admin'
export const anyone: Access = () => true

// Public visitors only see published (non-draft) documents.
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
