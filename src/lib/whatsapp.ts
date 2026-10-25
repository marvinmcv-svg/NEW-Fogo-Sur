export const whatsappLink = (number: string | null | undefined, message?: string | null) => {
  const digits = (number || '').replace(/[^0-9]/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${text}`
}

export const fillTemplate = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')
