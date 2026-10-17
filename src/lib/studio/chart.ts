export function formatYAxis(value: number): string {
  if (value === 0) return '$ 0'
  if (value >= 1000) return `$ ${Number((value / 1000).toFixed(1))}k`
  return `$ ${Number(value.toFixed(2))}`
}
