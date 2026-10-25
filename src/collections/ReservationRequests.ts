import type { CollectionConfig } from 'payload'

import { isLoggedIn } from '../access'

// A log of the WhatsApp reservations started from /reservar. The booking
// itself is confirmed in WhatsApp; this only keeps the anonymous shape of the
// request (date, time, party size, occasion, language) so the dashboard can
// show covers, peak times and trends. No name or notes are stored.
export const ReservationRequests: CollectionConfig = {
  slug: 'reservation-requests',
  labels: { singular: 'Reserva por WhatsApp', plural: 'Reservas por WhatsApp' },
  admin: {
    group: 'Administración',
    defaultColumns: ['date', 'time', 'guests', 'occasion', 'locale', 'createdAt'],
    description: 'Cada vez que un cliente envía el formulario de reserva a WhatsApp se registra aquí (sin datos personales).',
  },
  access: {
    create: () => true,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'text', label: 'Fecha (AAAA-MM-DD)', required: true, maxLength: 10, validate: (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) || 'Formato AAAA-MM-DD' },
        { name: 'time', type: 'text', label: 'Hora', maxLength: 20 },
        { name: 'guests', type: 'number', label: 'Personas', required: true, min: 1, max: 60 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'occasion', type: 'text', label: 'Ocasión', maxLength: 80 },
        { name: 'locale', type: 'text', label: 'Idioma', maxLength: 5 },
      ],
    },
  ],
}
