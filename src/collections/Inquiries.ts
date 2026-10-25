import type { CollectionConfig } from 'payload'

import { isLoggedIn } from '../access'

// Event / group inquiries submitted from the public site. Anyone can create
// one; only staff can read them.
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Solicitud', plural: 'Solicitudes de eventos' },
  admin: {
    useAsTitle: 'name',
    group: 'Administración',
    defaultColumns: ['name', 'phone', 'date', 'guests', 'status', 'createdAt'],
  },
  access: {
    create: () => true,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Nombre', required: true, maxLength: 120 },
        { name: 'phone', type: 'text', label: 'Teléfono / WhatsApp', required: true, maxLength: 40 },
        { name: 'email', type: 'email', label: 'Email' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'date', label: 'Fecha deseada' },
        { name: 'guests', type: 'number', label: 'Personas', min: 1, max: 500 },
        { name: 'eventType', type: 'text', label: 'Tipo de evento', maxLength: 120 },
      ],
    },
    { name: 'message', type: 'textarea', label: 'Mensaje', maxLength: 2000 },
    { name: 'locale', type: 'text', label: 'Idioma', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      label: 'Estado',
      defaultValue: 'new',
      access: { create: () => false },
      options: [
        { label: 'Nueva', value: 'new' },
        { label: 'Contactada', value: 'contacted' },
        { label: 'Confirmada', value: 'confirmed' },
        { label: 'Descartada', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
