import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Portada', plural: 'Portadas' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Antetítulo', localized: true },
    { name: 'title', type: 'text', label: 'Título', localized: true, required: true },
    { name: 'subtitle', type: 'textarea', label: 'Subtítulo', localized: true },
    { name: 'media', type: 'upload', relationTo: 'media', label: 'Foto o video de fondo' },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Texto', plural: 'Textos' },
  fields: [{ name: 'content', type: 'richText', label: 'Contenido', localized: true }],
}

export const ImageTextBlock: Block = {
  slug: 'imageText',
  labels: { singular: 'Imagen + texto', plural: 'Imagen + texto' },
  fields: [
    { name: 'title', type: 'text', label: 'Título', localized: true },
    { name: 'text', type: 'textarea', label: 'Texto', localized: true },
    { name: 'media', type: 'upload', relationTo: 'media', label: 'Foto o video', required: true },
    { name: 'reverse', type: 'checkbox', label: 'Imagen a la derecha' },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Galería', plural: 'Galerías' },
  fields: [
    { name: 'title', type: 'text', label: 'Título', localized: true },
    {
      name: 'items',
      type: 'array',
      label: 'Imágenes',
      minRows: 1,
      fields: [
        { name: 'media', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', localized: true },
      ],
    },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'Llamado a la acción', plural: 'Llamados a la acción' },
  fields: [
    { name: 'title', type: 'text', label: 'Título', localized: true, required: true },
    { name: 'text', type: 'textarea', label: 'Texto', localized: true },
    { name: 'buttonLabel', type: 'text', label: 'Texto del botón', localized: true },
    {
      name: 'action',
      type: 'select',
      label: 'Acción',
      defaultValue: 'whatsapp',
      options: [
        { label: 'Reservar por WhatsApp', value: 'whatsapp' },
        { label: 'Enlace', value: 'link' },
      ],
    },
    {
      name: 'href',
      type: 'text',
      label: 'Enlace',
      admin: { condition: (_, sibling) => sibling?.action === 'link' },
    },
  ],
}

export const QuoteBlock: Block = {
  slug: 'quote',
  labels: { singular: 'Cita', plural: 'Citas' },
  fields: [
    { name: 'quote', type: 'textarea', label: 'Cita', localized: true, required: true },
    { name: 'author', type: 'text', label: 'Autor', localized: true },
  ],
}

export const pageBlocks = [HeroBlock, RichTextBlock, ImageTextBlock, GalleryBlock, CtaBlock, QuoteBlock]
