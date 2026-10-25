import type { CollectionConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { formatSlug } from '../hooks/slug'

export const Cuts: CollectionConfig = {
  slug: 'cuts',
  labels: { singular: 'Corte', plural: 'Cortes (rodízio)' },
  admin: {
    useAsTitle: 'name',
    group: 'Carta',
    defaultColumns: ['name', 'portugueseName', 'order', 'featured'],
    description: 'Cada corte tiene su propia página (/cortes/<slug>) y aparece en la cinta de cortes de la portada.',
  },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  defaultSort: 'order',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Nombre', required: true, localized: true },
        {
          name: 'portugueseName',
          type: 'text',
          label: 'Nombre gaúcho (portugués)',
          admin: { description: 'Ej.: Picanha, Fraldinha, Costela. No se traduce.' },
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Se genera solo a partir del nombre gaúcho.' },
      hooks: { beforeValidate: [formatSlug('portugueseName')] },
    },
    { name: 'order', type: 'number', label: 'Orden', defaultValue: 10, admin: { position: 'sidebar' } },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Mostrar en la portada',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    { name: 'tagline', type: 'text', label: 'Frase corta', localized: true },
    { name: 'description', type: 'textarea', label: 'Descripción', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'tastingNotes', type: 'text', label: 'Notas de sabor', localized: true },
        { name: 'doneness', type: 'text', label: 'Punto recomendado', localized: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'origin', type: 'text', label: 'Parte de la res / origen', localized: true },
        { name: 'pairing', type: 'text', label: 'Maridaje sugerido', localized: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Foto', required: true },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          label: 'Video corto (opcional)',
          admin: { description: 'Loop de 2–4 s, vertical, sin audio.' },
        },
      ],
    },
  ],
}
