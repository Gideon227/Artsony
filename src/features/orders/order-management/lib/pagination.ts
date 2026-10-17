export type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

export function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis-end', total]
  if (current >= total - 3) return [1, 'ellipsis-start', total - 4, total - 3, total - 2, total - 1, total]
  return [1, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total]
}
