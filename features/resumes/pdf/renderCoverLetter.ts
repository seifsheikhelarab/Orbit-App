import type { CoverLetterContent } from '../api/types'
import { escapeHtml } from './htmlStyles'

export function renderCoverLetterHtml(content: CoverLetterContent): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { margin: 48px; }
    body {
      font-family: Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #1a1a2e;
    }
    .date { margin-bottom: 24px; color: #6b7280; font-size: 10px; }
    .recipient { margin-bottom: 24px; }
    .body-text { margin-bottom: 24px; }
    .paragraph { margin-bottom: 12px; }
    .closing { margin-top: 24px; }
    .signature { margin-top: 12px; }
  </style>
</head>
<body>
  <div class="date">${today}</div>

  <div class="recipient">
    ${content.recipientName ? `<div><strong>${escapeHtml(content.recipientName)}</strong></div>` : ''}
    ${content.recipientTitle ? `<div>${escapeHtml(content.recipientTitle)}</div>` : ''}
    ${content.company ? `<div>${escapeHtml(content.company)}</div>` : ''}
    ${content.address ? `<div style="font-size:10px;color:#6b7280">${escapeHtml(content.address)}</div>` : ''}
  </div>

  <div class="body-text">
    ${content.opening ? `<div class="paragraph">${escapeHtml(content.opening)}</div>` : ''}
    ${content.body ? `<div class="paragraph">${escapeHtml(content.body).split('\n').filter(Boolean).join('</div><div class="paragraph">')}</div>` : ''}
    ${content.closing ? `<div class="paragraph">${escapeHtml(content.closing)}</div>` : ''}
  </div>

  <div class="closing">
    <div>${escapeHtml(content.signature || 'Best regards,')}</div>
    <div class="signature"><strong>${escapeHtml(content.senderName)}</strong></div>
  </div>
</body>
</html>`
}
