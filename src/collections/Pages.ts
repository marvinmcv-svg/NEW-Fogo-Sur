import type { CollectionConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '../access'
import { pageBlocks } from '../blocks'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { formatSlug } from '../hooks/slug'

const reservedSlugs = ['menu', 'cortes', 'semana-fogo', 'eventos', 'ubicacion', 'reservar', 'admin', 'api']

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Página', plural: 'Páginas adicionales' },
  admin: {
    useAsTitle: 'title',
    group: 'Contenido',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: 'Páginas nuevas armadas con bloques (ej.: Historia, Trabaja con nosotros). Se publican en /<idioma>/<slug>.',
    livePreview: {
      url: ({ data, locale }) => `/preview?path=${encodeURIComponent(`/${locale?.code ?? 'es'}/${data?.slug ?? ''}`)}`,
    },
  },
  versions: { drafts: true, maxPerDoc: 25 },
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', label: 'Título', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
      hooks: { beforeValidate: [formatSlug('title')] },
      validate: (value: string | null | undefined) =>
        value && reservedSlugs.includes(value) ? 'Esta dirección está reservada por la web.' : true,
    },
    {
      name: 'showInNav',
      type: 'checkbox',
      label: 'Mostrar en el menú',
      admin: { position: 'sidebar' },
    },
    { name: 'metaDescription', type: 'textarea', label: 'Descripción para Google', localized: true },
    { name: 'layout', type: 'blocks', label: 'Contenido', blocks: pageBlocks },
  ],
}
