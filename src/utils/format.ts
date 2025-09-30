/**
 * Formata um valor numérico como moeda brasileira
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

/**
 * Formata uma data ISO string para formato brasileiro
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(dateString))
}

/**
 * Gera um slug SEO-friendly a partir de um texto
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
    .trim()
}

/**
 * Trunca um texto para um número máximo de caracteres
 */
export function truncateText(
  text: string,
  maxLength: number = 100,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text

  // Special case: if maxLength is very small and we have suffix
  if (suffix !== '' && maxLength < suffix.length) {
    return text.slice(0, maxLength) + suffix
  }

  // If no suffix, just truncate
  if (suffix === '') {
    return text.slice(0, maxLength).trim()
  }

  // Calculate available space for text content
  const availableLength = maxLength - suffix.length
  let truncated = text.slice(0, availableLength)

  // Try to respect word boundaries when possible
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  if (lastSpaceIndex > 0 && availableLength > 10) {
    // Only break at word boundary if we're not losing too much text
    const lostChars = availableLength - lastSpaceIndex
    if (lostChars <= Math.max(3, availableLength * 0.3)) {
      truncated = truncated.slice(0, lastSpaceIndex)
    }
  }

  return truncated.trim() + suffix
}
