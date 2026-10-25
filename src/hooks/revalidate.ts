import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

// Every edit in the admin refreshes the whole public site. The site is small
// enough that a full-layout revalidation is cheap and avoids stale cross-links.
const revalidateSite = async () => {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // Outside a Next.js request (seed script, CLI) there is nothing to revalidate.
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}
