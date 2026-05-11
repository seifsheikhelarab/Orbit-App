export const FONT_SIZE_MAP = { small: 9, medium: 11, large: 13 } as const
export const LINE_SPACING_MAP = { compact: 1.1, normal: 1.25, relaxed: 1.5 } as const
export const MARGIN_MAP = { narrow: 20, normal: 30, wide: 40 } as const

export function getBaseHtmlStyle(
  settings: { fontSize?: string; lineSpacing?: string; margin?: string; color?: string },
) {
  const color = settings.color || '#1e3a8a'
  const fontSize = FONT_SIZE_MAP[(settings.fontSize as keyof typeof FONT_SIZE_MAP) || 'medium']
  const lineSpacing = LINE_SPACING_MAP[(settings.lineSpacing as keyof typeof LINE_SPACING_MAP) || 'normal']
  const margin = MARGIN_MAP[(settings.margin as keyof typeof MARGIN_MAP) || 'normal']

  return `
    <style>
      @page { margin: ${margin}px; }
      body {
        font-family: Helvetica, Arial, sans-serif;
        font-size: ${fontSize}px;
        line-height: ${lineSpacing};
        color: #333;
      }
      .accent { color: ${color}; }
      .accent-bg { background-color: ${color}; }
      .accent-border { border-color: ${color}; }
    </style>
  `
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
