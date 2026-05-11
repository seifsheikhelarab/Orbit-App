import type { ResumeData } from '../api/types'
import { getBaseHtmlStyle, escapeHtml } from './htmlStyles'

export function renderProfessionalHtml(data: ResumeData): string {
  const { basics, work, education, skills, projects, volunteer, languages, certifications } = data
  const base = getBaseHtmlStyle(data.settings)
  const accent = data.settings.color || '#1e3a8a'

  const bullets = (text: string) =>
    text
      .split('\n')
      .filter(Boolean)
      .map((b) => `<div style="padding-left:16px;margin-bottom:2px">• ${escapeHtml(b)}</div>`)
      .join('')

  let body = ''

  if (basics.summary) {
    body += `<div style="margin-bottom:16px;font-style:italic;line-height:1.5;text-align:center;color:#555">${escapeHtml(basics.summary)}</div>`
  }

  const section = (title: string, content: string) => `
    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;color:#333;border-bottom:1px solid #ccc;padding-bottom:4px">${title}</div>
      ${content}
    </div>
  `

  if (work.length > 0) {
    body += section('Professional Experience', work.map((w) => `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:2px">
          <div style="font-weight:bold">${escapeHtml(w.position)}</div>
          <div style="color:#666;font-size:10px;font-style:italic">${escapeHtml(w.startDate)}${w.endDate ? ` – ${escapeHtml(w.endDate)}` : ''}</div>
        </div>
        <div style="color:#444;font-size:10px;margin-bottom:4px">${escapeHtml(w.company)}</div>
        ${w.highlights ? bullets(w.highlights) : ''}
      </div>
    `).join(''))
  }

  if (education.length > 0) {
    body += section('Education', education.map((e) => `
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between">
          <div style="font-weight:bold">${escapeHtml(e.institution)}</div>
          <div style="color:#666;font-size:10px;font-style:italic">${escapeHtml(e.startDate)}${e.endDate ? ` – ${escapeHtml(e.endDate)}` : ''}</div>
        </div>
        <div style="color:#444;font-size:10px">${[e.studyType, e.area].filter(Boolean).join(' in ')}${e.score ? ` — ${escapeHtml(e.score)}` : ''}</div>
      </div>
    `).join(''))
  }

  if (skills.length > 0) {
    body += section('Skills', `<div style="display:flex;flex-wrap:wrap;gap:4px">${skills.map((s) => `<span style="display:inline-block;padding:2px 8px;background:#f0f0f0;border-radius:3px;font-size:10px;color:#333">${escapeHtml(s.name)}${s.keywords ? `: ${escapeHtml(s.keywords)}` : ''}</span>`).join('')}</div>`)
  }

  if (projects.length > 0) {
    body += section('Projects', projects.map((p) => `
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between">
          <div style="font-weight:bold">${escapeHtml(p.name)}</div>
          <div style="color:${accent};font-size:10px">${escapeHtml(p.startDate)}${p.endDate ? ` – ${escapeHtml(p.endDate)}` : ''}</div>
        </div>
        ${p.highlights ? bullets(p.highlights) : ''}
      </div>
    `).join(''))
  }

  if (certifications.length > 0) {
    body += section('Certifications', certifications.map((c) => `
      <div style="margin-bottom:6px">
        <div style="font-weight:bold">${escapeHtml(c.name)}</div>
        <div style="color:#444;font-size:10px">${escapeHtml(c.issuer)}${c.startDate ? ` – ${escapeHtml(c.startDate)}` : ''}</div>
      </div>
    `).join(''))
  }

  if (volunteer.length > 0) {
    body += section('Volunteer', volunteer.map((v) => `
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between">
          <div style="font-weight:bold">${escapeHtml(v.position)}</div>
          <div style="color:#666;font-size:10px;font-style:italic">${escapeHtml(v.startDate)}${v.endDate ? ` – ${escapeHtml(v.endDate)}` : ''}</div>
        </div>
        <div style="color:#444;font-size:10px;margin-bottom:4px">${escapeHtml(v.organization)}</div>
        ${v.highlights ? bullets(v.highlights) : ''}
      </div>
    `).join(''))
  }

  if (languages.length > 0) {
    body += section('Languages', languages.map((l) => `
      <div style="margin-bottom:4px">
        <span style="font-weight:bold">${escapeHtml(l.name)}</span>${l.fluency ? ` – ${escapeHtml(l.fluency)}` : ''}
      </div>
    `).join(''))
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${base}
  <style>
    body { font-family: 'Times New Roman', Times, serif; color: #333; }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #333;padding-bottom:12px">
    <div style="font-size:22px;font-weight:bold;margin-bottom:4px;color:#000">${escapeHtml(basics.name)}</div>
    <div style="font-size:12px;color:#666;margin-bottom:6px">${escapeHtml(basics.label)}</div>
    <div style="font-size:10px;color:#444">${[basics.email, basics.phone, basics.location, basics.url].filter(Boolean).join(' | ')}</div>
  </div>
  ${body}
</body>
</html>`
}
