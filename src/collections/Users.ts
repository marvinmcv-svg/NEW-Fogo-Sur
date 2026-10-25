import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isLoggedIn } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    useAsTitle: 'email',
    group: 'Administración',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: { tokenExpiration: 60 * 60 * 12 },
  access: {
    read: isLoggedIn,
    create: isAdmin,
    update: ({ req, id }) => (req.user as { role?: string } | null)?.role === 'admin' || req.user?.id === id,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nombre' },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      access: { update: isAdminField },
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor de contenido', value: 'editor' },
      ],
      admin: {
        description: 'Los editores pueden cambiar todo el contenido; solo los administradores gestionan usuarios.',
      },
    },
  ],
}
