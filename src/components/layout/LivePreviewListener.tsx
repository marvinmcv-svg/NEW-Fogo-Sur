'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

// When the page is open inside the admin's live preview, re-render it each
// time the editor saves.
export function LivePreviewListener() {
  const router = useRouter()
  const serverURL = typeof window !== 'undefined' ? window.location.origin : ''
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />
}
