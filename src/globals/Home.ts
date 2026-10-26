import type { Field, GlobalConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

const text = (name: string, label: string, opts: Partial<{ textarea: boolean; required: boolean; description: string }> = {}): Field => {
  const base = {
    name,
    label,
    localized: true,
    required: opts.required,
    admin: opts.description ? { description: opts.description } : undefined,
  }
  return opts.textarea ? { ...base, type: 'textarea' } : { ...base, type: 'text' }
}

const upload = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  admin: description ? { description } : undefined,
})

const visible: Field = {
  name: 'enabled',
  type: 'checkbox',
  label: 'Mostrar este capítulo',
  defaultValue: true,
}

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Portada (experiencia)',
  admin: {
    group: 'Contenido',
    description: 'La portada es un recorrido en capítulos: del fuego a tu mesa. Cada pestaña es un capítulo.',
    livePreview: { url: ({ locale }) => `/${locale?.code ?? 'es'}` },
  },
  access: { read: anyone, update: isLoggedIn },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'hero',
          label: '1 · El Fuego',
          fields: [
            text('eyebrow', 'Antetítulo', { description: 'Corto: una línea pequeña sobre el título (ej.: "Ventura Sur · Santa Cruz").' }),
            text('title', 'Título', { required: true, description: 'Usa "/" para forzar un salto de línea.' }),
            {
              name: 'reels',
              label: 'Videos (tríptico)',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              minRows: 1,
              maxRows: 3,
              admin: {
                description:
                  'Hasta 3 videos verticales, en orden: fuego → espeto → mesa. En escritorio se ven lado a lado; en el móvil, uno tras otro.',
              },
            },
            text('ctaLabel', 'Texto del botón'),
          ],
        },
        {
          name: 'ritual',
          label: '2 · El Ritual',
          fields: [
            visible,
            text('heading', 'Título'),
            {
              name: 'beats',
              type: 'array',
              label: 'Momentos',
              minRows: 1,
              maxRows: 5,
              fields: [
                text('kicker', 'Número / antetítulo'),
                text('title', 'Título', { required: true }),
                text('text', 'Texto', { textarea: true }),
                upload('video', 'Video'),
              ],
            },
          ],
        },
        {
          name: 'cuts',
          label: '3 · Los Cortes',
          fields: [
            visible,
            text('eyebrow', 'Antetítulo'),
            text('heading', 'Título'),
            text('intro', 'Introducción', { textarea: true }),
            text('hint', 'Indicación', { description: 'Ej.: "Arrastra para recibir el siguiente corte"' }),
            {
              name: 'cuts',
              type: 'relationship',
              relationTo: 'cuts',
              hasMany: true,
              label: 'Cortes a mostrar',
              admin: { description: 'Vacío = todos los cortes marcados como "Mostrar en la portada".' },
            },
            text('linkLabel', 'Texto del enlace a todos los cortes'),
          ],
        },
        {
          name: 'market',
          label: '4 · Mesa del Mercado',
          fields: [
            visible,
            text('eyebrow', 'Antetítulo'),
            text('heading', 'Título'),
            text('text', 'Texto', { textarea: true }),
            upload('heroImage', 'Imagen principal (cenital)'),
            upload('video', 'Video'),
            {
              name: 'gallery',
              type: 'array',
              label: 'Detalles',
              fields: [upload('image', 'Imagen'), text('caption', 'Leyenda')],
            },
            text('linkLabel', 'Texto del enlace a la carta'),
          ],
        },
        {
          name: 'card',
          label: '5 · Sí, por favor',
          fields: [
            visible,
            text('eyebrow', 'Antetítulo'),
            text('heading', 'Título'),
            text('text', 'Texto', { textarea: true }),
            {
              type: 'row',
              fields: [text('yesLabel', 'Tarjeta verde'), text('yesSub', 'Verde · subtítulo')],
            },
            text('yesText', 'Qué significa el verde', { textarea: true }),
            {
              type: 'row',
              fields: [text('noLabel', 'Tarjeta roja'), text('noSub', 'Roja · subtítulo')],
            },
            text('noText', 'Qué significa el rojo', { textarea: true }),
            upload('video', 'Video de fondo'),
          ],
        },
        {
          name: 'bar',
          label: '6 · El Bar',
          fields: [
            visible,
            text('eyebrow', 'Antetítulo'),
            text('heading', 'Título'),
            text('text', 'Texto', { textarea: true }),
            {
              name: 'clips',
              type: 'array',
              label: 'Videos / fotos',
              maxRows: 6,
              fields: [upload('media', 'Archivo'), text('caption', 'Leyenda')],
            },
            {
              name: 'highlights',
              type: 'relationship',
              relationTo: 'menu-items',
              hasMany: true,
              label: 'Bebidas destacadas',
            },
          ],
        },
        {
          name: 'week',
          label: '7 · Semana Fogo',
          fields: [visible, text('eyebrow', 'Antetítulo'), text('heading', 'Título'), text('intro', 'Introducción', { textarea: true })],
        },
        {
          name: 'visit',
          label: '8 · Tu mesa',
          fields: [
            visible,
            text('eyebrow', 'Antetítulo'),
            text('heading', 'Título'),
            text('text', 'Texto', { textarea: true }),
            upload('media', 'Foto o video'),
            text('ctaLabel', 'Texto del botón'),
          ],
        },
      ],
    },
  ],
}
