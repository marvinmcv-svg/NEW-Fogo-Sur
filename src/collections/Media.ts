import type { CollectionConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Archivo', plural: 'Medios (fotos y videos)' },
  admin: {
    group: 'Contenido',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize'],
    description:
      'Fotos (JPG/PNG/WebP/AVIF) y videos (MP4 H.264, vertical 9:16 recomendado, sin audio, idealmente < 3 MB).',
  },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    focalPoint: true,
    crop: true,
    imageSizes: [
      { name: 'thumb', width: 480 },
      { name: 'card', width: 900 },
      { name: 'full', width: 1600 },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      localized: true,
      required: true,
      admin: { description: 'Describe la imagen para personas con lector de pantalla y para Google.' },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de portada (solo videos)',
      admin: {
        description: 'Se muestra mientras el video carga y cuando el visitante prefiere menos movimiento.',
        condition: (data) => typeof data?.mimeType === 'string' && data.mimeType.startsWith('video/'),
      },
    },
  ],
}
