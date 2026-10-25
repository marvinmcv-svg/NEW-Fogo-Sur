import type { Field, GlobalConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

// Every inner page shares the same header pattern plus a few page-specific
// fields, all editable and translatable from the admin.
const baseFields: Field[] = [
  { name: 'eyebrow', type: 'text', label: 'Antetítulo', localized: true },
  { name: 'title', type: 'text', label: 'Título', localized: true, required: true },
  { name: 'intro', type: 'textarea', label: 'Introducción', localized: true },
  { name: 'media', type: 'upload', relationTo: 'media', label: 'Foto o video de cabecera' },
  { name: 'metaDescription', type: 'textarea', label: 'Descripción para Google', localized: true },
]

const pageGlobal = (slug: string, label: string, path: string, extra: Field[] = []): GlobalConfig => ({
  slug,
  label,
  admin: {
    group: 'Páginas',
    livePreview: { url: ({ locale }) => `/${locale?.code ?? 'es'}${path}` },
  },
  access: { read: anyone, update: isLoggedIn },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [...baseFields, ...extra],
})

const t = (name: string, label: string, textarea = false): Field =>
  textarea ? { name, label, type: 'textarea', localized: true } : { name, label, type: 'text', localized: true }

export const MenuPage = pageGlobal('menu-page', 'Carta', '/menu', [t('pricesNote', 'Nota sobre precios', true)])
export const CutsPage = pageGlobal('cuts-page', 'Cortes', '/cortes')
export const WeekPage = pageGlobal('week-page', 'Semana Fogo', '/semana-fogo')
export const EventsPage = pageGlobal('events-page', 'Eventos', '/eventos', [
  t('formTitle', 'Título del formulario'),
  t('formIntro', 'Texto del formulario', true),
  t('formSuccess', 'Mensaje de éxito', true),
  {
    name: 'formLabels',
    type: 'group',
    label: 'Etiquetas del formulario',
    fields: [
      t('name', 'Nombre'),
      t('phone', 'Teléfono'),
      t('email', 'Email'),
      t('date', 'Fecha'),
      t('guests', 'Personas'),
      t('eventType', 'Tipo de evento'),
      t('message', 'Mensaje'),
      t('submit', 'Enviar'),
      t('error', 'Error'),
    ],
  },
])
export const VisitPage = pageGlobal('visit-page', 'Ubicación', '/ubicacion')
export const ReservePage = pageGlobal('reserve-page', 'Reservar', '/reservar', [
  {
    name: 'labels',
    type: 'group',
    label: 'Etiquetas del formulario',
    fields: [
      t('name', 'Nombre'),
      t('date', 'Fecha'),
      t('time', 'Hora'),
      t('guests', 'Personas'),
      t('occasion', 'Ocasión'),
      t('notes', 'Comentarios'),
      t('submit', 'Botón enviar'),
      t('note', 'Nota bajo el botón', true),
    ],
  },
  {
    name: 'occasions',
    type: 'array',
    label: 'Ocasiones',
    fields: [{ name: 'label', type: 'text', localized: true, required: true }],
  },
  {
    name: 'times',
    type: 'text',
    label: 'Horarios disponibles',
    defaultValue: '12:00,12:30,13:00,13:30,14:00,19:00,19:30,20:00,20:30,21:00,21:30,22:00',
    admin: { description: 'Separados por comas.' },
  },
  {
    name: 'messageTemplate',
    type: 'textarea',
    label: 'Plantilla del mensaje de WhatsApp',
    localized: true,
    admin: {
      description: 'Variables: {name} {date} {time} {guests} {occasion} {notes}',
    },
  },
])
