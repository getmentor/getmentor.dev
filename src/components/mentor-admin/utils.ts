/**
 * Utility functions for Mentor Admin
 */

/**
 * Format date in Russian locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format date with time in Russian locale
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format relative time (e.g., "2 дня назад")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      if (diffMinutes < 1) return 'только что'
      return `${diffMinutes} ${pluralizeMinutes(diffMinutes)} назад`
    }
    return `${diffHours} ${pluralizeHours(diffHours)} назад`
  }

  if (diffDays === 1) return 'вчера'
  if (diffDays < 7) return `${diffDays} ${pluralizeDays(diffDays)} назад`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${pluralizeWeeks(weeks)} назад`
  }

  return formatDate(dateString)
}

function pluralizeMinutes(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return 'минут'
  if (mod10 === 1) return 'минуту'
  if (mod10 >= 2 && mod10 <= 4) return 'минуты'
  return 'минут'
}

function pluralizeHours(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return 'часов'
  if (mod10 === 1) return 'час'
  if (mod10 >= 2 && mod10 <= 4) return 'часа'
  return 'часов'
}

function pluralizeDays(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return 'дней'
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дня'
  return 'дней'
}

function pluralizeWeeks(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return 'недель'
  if (mod10 === 1) return 'неделю'
  if (mod10 >= 2 && mod10 <= 4) return 'недели'
  return 'недель'
}
