const OPACITY_MAP: Record<string, string> = {
  '15': '27',
  '1A': '0D1A',
  '20': '33',
  '30': '4D',
  '40': '66',
  '4D': '7A',
  '50': '80',
  '66': 'A8',
  '80': 'CC',
  '99': 'FC',
  'B3': 'B3',
  'cc': 'CC',
}

export function hexa(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
  return `${hex}${alpha}`
}
