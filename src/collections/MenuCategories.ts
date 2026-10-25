import type { CollectionConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { formatSlug } from '../hooks/slug'

export const MenuCategories: CollectionConfig = {
  slug: 'menu-categories',
  labels: { singular: 'Sección de la carta', plural: 'Secciones de la carta' },
  admin: { useAsTitle: 'title', group: 'Carta', defaultColumns: ['title', 'order'] },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', label: 'Título', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar' },
      hooks: { beforeValidate: [formatSlug('key')] },
    },
    {
      name: 'key',
      type: 'text',
      label: 'Clave interna',
      required: true,
      admin: { position: 'sidebar', description: 'Ej.: rodizio, mercado, bar. Sin espacios.' },
    },
    { name: 'order', type: 'number', label: 'Orden', defaultValue: 10, admin: { position: 'sidebar' } },
    { name: 'intro', type: 'textarea', label: 'Introducción', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen de cabecera' },
  ],
}
