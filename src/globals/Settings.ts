import type { GlobalConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { brandSocial } from '../lib/social'

const hex = (value: string | null | undefined) =>
  !value || /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? true : 'Usa un color hexadecimal, ej.: #C9A24A'

const color = (name: string, label: string, defaultValue: string, description?: string) => ({
  name,
  label,
  type: 'text' as const,
  defaultValue,
  validate: hex,
  admin: { description },
})

export const displayFonts = ['Cormorant Garamond', 'Playfair Display', 'Bodoni Moda', 'DM Serif Display', 'Fraunces', 'Libre Caslon Display']
export const bodyFonts = ['Inter', 'Manrope', 'DM Sans', 'Figtree', 'Work Sans', 'Montserrat']

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Ajustes generales',
  admin: { group: 'Configuración' },
  access: { read: anyone, update: isLoggedIn },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Restaurante',
          fields: [
            { name: 'restaurantName', type: 'text', label: 'Nombre', defaultValue: 'Fogo de Chão' },
            {
              name: 'branchName',
              type: 'text',
              label: 'Sucursal',
              localized: true,
              defaultValue: 'Ventura Sur · Santa Cruz',
            },
            {
              name: 'status',
              type: 'select',
              label: 'Estado de la sucursal',
              defaultValue: 'coming-soon',
              options: [
                { label: 'Próxima apertura (muestra cuenta regresiva)', value: 'coming-soon' },
                { label: 'Abierto', value: 'open' },
              ],
            },
            {
              name: 'openingDate',
              type: 'date',
              label: 'Fecha y hora de apertura',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                description: 'Hora de Bolivia. Alimenta la cuenta regresiva mientras el estado sea "Próxima apertura".',
              },
            },
            {
              name: 'address',
              type: 'textarea',
              label: 'Dirección',
              localized: true,
              defaultValue: 'Mall Ventura Sur · 5to anillo, Doble Vía a La Guardia\nSanta Cruz de la Sierra, Bolivia',
            },
            {
              name: 'mapQuery',
              type: 'text',
              label: 'Búsqueda en Google Maps',
              defaultValue: 'Mall Ventura Sur, Doble Vía a La Guardia, Santa Cruz de la Sierra, Bolivia',
              admin: { description: 'Texto o coordenadas ("-17.83,-63.21") para el mapa y el botón "Cómo llegar".' },
            },
            {
              name: 'hours',
              type: 'array',
              label: 'Horarios',
              admin: { description: 'Si está vacío, la web muestra "Horarios por confirmar".' },
              fields: [
                { name: 'days', type: 'text', label: 'Días', localized: true, required: true },
                { name: 'time', type: 'text', label: 'Horario', required: true, admin: { placeholder: '12:00–15:30 · 19:00–00:00' } },
              ],
            },
            { name: 'parkingNote', type: 'text', label: 'Estacionamiento', localized: true },
          ],
        },
        {
          label: 'Contacto y reservas',
          fields: [
            {
              name: 'whatsapp',
              type: 'text',
              label: 'WhatsApp para reservas',
              required: true,
              defaultValue: '+59177165787',
              admin: { description: 'Con código de país, ej.: +59177165787' },
            },
            {
              name: 'whatsappGreeting',
              type: 'textarea',
              label: 'Mensaje inicial de WhatsApp',
              localized: true,
              defaultValue: 'Hola Fogo de Chão Ventura Sur, quisiera hacer una reserva.',
            },
            { name: 'phone', type: 'text', label: 'Teléfono' },
            { name: 'email', type: 'email', label: 'Email' },
            {
              name: 'social',
              type: 'group',
              label: 'Redes sociales',
              admin: {
                description:
                  'Las mismas cuentas para las dos sucursales. Pega el enlace del perfil o solo el usuario (ej.: @fogodechao.bo). Vacío = no se muestra.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'instagram', type: 'text', label: 'Instagram', defaultValue: brandSocial.instagram },
                    { name: 'facebook', type: 'text', label: 'Facebook', defaultValue: brandSocial.facebook },
                    { name: 'tiktok', type: 'text', label: 'TikTok', defaultValue: brandSocial.tiktok },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Marca',
          description:
            'Colores, tipografías y logos de la marca. Cámbialos aquí con los valores oficiales de Fogo de Chão y toda la web se actualiza.',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo (versión clara, para fondo oscuro)',
              admin: { description: 'SVG o PNG transparente. Si está vacío se usa el logotipo tipográfico.' },
            },
            { name: 'favicon', type: 'upload', relationTo: 'media', label: 'Favicon (PNG cuadrado)' },
            {
              name: 'colors',
              type: 'group',
              label: 'Colores',
              fields: [
                {
                  type: 'row',
                  fields: [
                    color('charcoal', 'Fondo (carvão)', '#0E0B09'),
                    color('ember', 'Acento (brasa)', '#E2571E'),
                    color('gold', 'Dorado', '#C9A24A'),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    color('bone', 'Texto sobre oscuro', '#EFE6D8'),
                    color('paper', 'Fondo claro', '#F4EDE2'),
                    color('ink', 'Texto sobre claro', '#1B1512'),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    color('cardYes', 'Tarjeta verde (sí)', '#3E9B57'),
                    color('cardNo', 'Tarjeta roja (no)', '#C8433B'),
                  ],
                },
              ],
            },
            {
              name: 'fonts',
              type: 'group',
              label: 'Tipografías',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'display',
                      type: 'select',
                      label: 'Títulos',
                      defaultValue: 'Cormorant Garamond',
                      options: displayFonts,
                    },
                    {
                      name: 'body',
                      type: 'select',
                      label: 'Texto',
                      defaultValue: 'Manrope',
                      options: bodyFonts,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', type: 'text', label: 'Título por defecto', localized: true },
            { name: 'seoDescription', type: 'textarea', label: 'Descripción por defecto', localized: true },
            { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Imagen para compartir (1200×630)' },
          ],
        },
      ],
    },
  ],
}
