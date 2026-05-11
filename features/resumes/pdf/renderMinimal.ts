import type { ResumeData } from '../api/types'
import { getBaseHtmlStyle, escapeHtml } from './htmlStyles'

export function renderMinimalHtml(data: ResumeData): string {
  const { basics, work, education, skills, projects, volunteer, languages, certifications } = data
  const base = getBaseHtmlStyle(data.settings)
  const accent = data.settings.color || '#1e3a8a'

  const bullets = (text: string) =>
    text
      .split('\n')
      .filter(Boolean)
      .map((b) => `<div style="margin-bottom:1px">- ${escapeHtml(b)}</div>`)
      .join('')

  let body = ''

  const section = (title: string, content: string) => `
    <div style="margin-bottom:10px">
      <div style="font-weight:bold;margin-bottom:4px;color:${accent}">${title}</div>
      ${content}
    </div>
  `

  if (basics.summary) {
    body += `<div style="margin-bottom:10px;color:#444;font-size:10px">${escapeHtml(basics.summary)}</div>`
  }

  if (work.length > 0) {
    body += section('Experience', work.map((w) => `
      <div style="margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;font-weight:bold">${escapeHtml(w.position)}${w.company ? `, ${escapeHtml(w.company)}` : ''} <span style="font-weight:normal;color:#888;font-size:9px">${escapeHtml(w.startDate)}${w.endDate ? ` – ${escapeHtml(w.endDate)}` : ''}</span></div>
        ${w.highlights ? `<div style="margin-top:2px;font-size:10px">${bullets(w.highlights)}</div>` : ''}
      </div>
    `).join(''))
  }

  if (education.length > 0) {
    body += section('Education', education.map((e) => `
      <div style="margin-bottom:4px;font-size:10px">
        <strong>${escapeHtml(e.institution)}</strong>${e.area ? `, ${escapeHtml(e.area)}` : ''}${e.score ? ` — ${escapeHtml(e.score)}` : ''}
      </div>
    `).join(''))
  }

  if (skills.length > 0) {
    body += section('Skills', `<div style="font-size:10px">${skills.map((s) => escapeHtml(s.name)).join(', ')}</div>`)
  }

  if (projects.length > 0) {
    body += section('Projects', projects.map((p) => `
      <div style="margin-bottom:4px;font-size:10px">
        <strong>${escapeHtml(p.name)}</strong>${p.highlights ? ` — ${bullets(p.highlights)}` : ''}
      </div>
    `).join(''))
  }

  if (certifications.length > 0) {
    body += section('Certifications', certifications.map((c) => `
      <div style="margin-bottom:2px;font-size:10px">
        <strong>${escapeHtml(c.name)}</strong> — ${escapeHtml(c.issuer)}
      </div>
    `).join(''))
  }

  if (volunteer.length > 0) {
    body += section('Volunteer', volunteer.map((v) => `
      <div style="margin-bottom:4px;font-size:10px">
        <strong>${escapeHtml(v.position)}</strong>, ${escapeHtml(v.organization)} — ${escapeHtml(v.startDate)}${v.endDate ? ` – ${escapeHtml(v.endDate)}` : ''}
      </div>
    `).join(''))
  }

  if (languages.length > 0) {
    body += section('Languages', `<div style="font-size:10px">${languages.map((l) => `${escapeHtml(l.name)}${l.fluency ? ` (${escapeHtml(l.fluency)})` : ''}`).join(', ')}</div>`)
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${base}
</head>
<body>
  <div style="margin-bottom:12px;padding-bottom:4px;border-bottom:1px solid #ccc">
    <div style="font-size:18px;font-weight:bold;margin-bottom:2px;color:#000">${escapeHtml(basics.name)}</div>
    <div style="font-size:10px;color:#888">${[basics.email, basics.phone, basics.location, basics.url].filter(Boolean).join(' · ')}</div>
  </div>
  ${body}
</body>
</html>`
}
