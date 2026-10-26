import type { CollectionConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const EventPackages: CollectionConfig = {
  slug: 'event-packages',
  labels: { singular: 'Formato de evento', plural: 'Eventos privados' },
  admin: { useAsTitle: 'title', group: 'Carta', defaultColumns: ['title', 'capacity', 'priceFrom'] },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', label: 'Título', required: true, localized: true },
    { name: 'description', type: 'textarea', label: 'Descripción', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'capacity', type: 'text', label: 'Capacidad', localized: true, admin: { placeholder: '10–40 personas' } },
        { name: 'priceFrom', type: 'number', label: 'Desde (Bs por persona)', min: 0, admin: { components: { Cell: '/components/admin/cells/PriceCell' } } },
      ],
    },
    {
      name: 'features',
      type: 'array',
      label: 'Incluye',
      fields: [{ name: 'text', type: 'text', localized: true, required: true }],
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Foto' },
    { name: 'order', type: 'number', label: 'Orden', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
