import type { CollectionConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  labels: { singular: 'Plato / bebida', plural: 'Platos y bebidas' },
  admin: {
    useAsTitle: 'name',
    group: 'Carta',
    defaultColumns: ['name', 'category', 'price', 'available', 'order'],
    description: 'Los precios se muestran en bolivianos (Bs). Si dejas el precio vacío, la web muestra "Consultar".',
  },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', label: 'Nombre', required: true, localized: true },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'menu-categories',
      label: 'Sección',
      required: true,
    },
    { name: 'description', type: 'textarea', label: 'Descripción', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'price', type: 'number', label: 'Precio (Bs)', min: 0 },
        {
          name: 'priceNote',
          type: 'text',
          label: 'Nota de precio',
          localized: true,
          admin: { description: 'Ej.: "por persona", "2 × Bs 70", "copa".' },
        },
      ],
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      label: 'Etiquetas',
      options: [
        { label: 'Firma de la casa', value: 'signature' },
        { label: 'Vegetariano', value: 'vegetarian' },
        { label: 'Sin gluten', value: 'gluten-free' },
        { label: 'Nuevo', value: 'new' },
        { label: 'Para compartir', value: 'sharing' },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Foto (opcional)' },
    { name: 'order', type: 'number', label: 'Orden', defaultValue: 10, admin: { position: 'sidebar' } },
    {
      name: 'available',
      type: 'checkbox',
      label: 'Disponible',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
