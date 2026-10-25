import type { GlobalConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

const t = (name: string, label: string, defaultValue?: string) => ({
  name,
  label,
  type: 'text' as const,
  localized: true,
  defaultValue,
})

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Menú y textos de interfaz',
  admin: { group: 'Configuración' },
  access: { read: anyone, update: isLoggedIn },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'links',
      type: 'array',
      label: 'Enlaces del menú',
      fields: [
        { name: 'label', type: 'text', localized: true, required: true },
        {
          name: 'href',
          type: 'text',
          required: true,
          admin: { description: 'Ruta sin idioma, ej.: /menu, /cortes, /eventos' },
        },
      ],
    },
    {
      name: 'ui',
      type: 'group',
      label: 'Textos de interfaz',
      fields: [
        t('reserve', 'Botón reservar'),
        t('reserveWhatsapp', 'Reservar por WhatsApp'),
        t('menu', 'Abrir menú'),
        t('close', 'Cerrar'),
        t('language', 'Idioma'),
        t('scroll', 'Indicador de scroll'),
        t('consult', 'Precio a consultar'),
        t('perPerson', 'Por persona'),
        t('today', 'Hoy'),
        t('directions', 'Cómo llegar'),
        t('hoursTbd', 'Horarios por confirmar'),
        t('openingIn', 'Abrimos en'),
        t('days', 'Días'),
        t('hours', 'Horas'),
        t('minutes', 'Minutos'),
        t('seconds', 'Segundos'),
        t('nowOpen', 'Ya abierto'),
        t('seeAll', 'Ver todo'),
        t('back', 'Volver'),
        t('flip', 'Girar tarjeta'),
        t('tastingNotes', 'Notas de sabor'),
        t('doneness', 'Punto recomendado'),
        t('origin', 'Origen'),
        t('pairing', 'Maridaje'),
        t('soundOff', 'Video sin sonido'),
        t('skip', 'Saltar al contenido'),
        t('allRights', 'Derechos reservados'),
      ],
    },
    {
      name: 'footer',
      type: 'group',
      label: 'Pie de página',
      fields: [
        t('tagline', 'Frase'),
        { name: 'legal', type: 'textarea', label: 'Texto legal', localized: true },
      ],
    },
  ],
}
