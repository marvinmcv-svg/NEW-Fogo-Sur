import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

// Admin "Live preview" / "Preview" lands here: only logged-in editors get
// draft mode, then we bounce to the page itself.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Bad path', { status: 400 })

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Unauthorized', { status: 401 })

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
