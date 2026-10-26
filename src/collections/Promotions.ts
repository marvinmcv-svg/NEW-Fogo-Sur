import type { CollectionConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const weekdayOptions = [
  { label: 'Todos los días', value: 'daily' },
  { label: 'Lunes', value: 'mon' },
  { label: 'Martes', value: 'tue' },
  { label: 'Miércoles', value: 'wed' },
  { label: 'Jueves', value: 'thu' },
  { label: 'Viernes', value: 'fri' },
  { label: 'Sábado', value: 'sat' },
  { label: 'Domingo', value: 'sun' },
]

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  labels: { singular: 'Promoción', plural: 'Semana Fogo (promociones)' },
  admin: {
    useAsTitle: 'title',
    group: 'Carta',
    defaultColumns: ['title', 'days', 'highlight', 'active'],
    description: 'Aparecen en la sección Semana Fogo; la web resalta automáticamente las de hoy (hora de Bolivia).',
  },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', label: 'Título', required: true, localized: true },
    {
      name: 'highlight',
      type: 'text',
      label: 'Cifra destacada',
      localized: true,
      admin: { description: 'Lo que se ve en grande. Ej.: "−50%", "2×1", "2 × Bs 70".' },
    },
    {
      name: 'days',
      type: 'select',
      hasMany: true,
      label: 'Días',
      required: true,
      options: weekdayOptions,
    },
    {
      type: 'row',
      fields: [
        { name: 'startTime', type: 'text', label: 'Desde (HH:MM)', admin: { placeholder: '18:00' } },
        { name: 'endTime', type: 'text', label: 'Hasta (HH:MM)', admin: { placeholder: '00:00' } },
        {
          name: 'service',
          type: 'select',
          label: 'Servicio',
          options: [
            { label: 'Almuerzo', value: 'lunch' },
            { label: 'Cena', value: 'dinner' },
            { label: 'Almuerzo y cena', value: 'both' },
            { label: 'Bar', value: 'bar' },
          ],
        },
      ],
    },
    { name: 'description', type: 'textarea', label: 'Descripción', localized: true },
    { name: 'conditions', type: 'text', label: 'Condiciones (letra chica)', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Foto' },
        { name: 'video', type: 'upload', relationTo: 'media', label: 'Video (opcional)' },
      ],
    },
    { name: 'order', type: 'number', label: 'Orden', defaultValue: 10, admin: { position: 'sidebar' } },
    { name: 'active', type: 'checkbox', label: 'Activa', defaultValue: true, admin: { position: 'sidebar', components: { Cell: '/components/admin/cells/YesNoCell' } } },
  ],
}
