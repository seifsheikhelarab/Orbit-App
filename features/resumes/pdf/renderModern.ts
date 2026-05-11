import type { ResumeData } from '../api/types'
import { getBaseHtmlStyle, escapeHtml } from './htmlStyles'

export function renderModernHtml(data: ResumeData): string {
  const { basics, work, education, skills, projects, volunteer, languages, certifications } = data
  const base = getBaseHtmlStyle(data.settings)
  const accent = data.settings.color || '#1e3a8a'

  const bullets = (text: string) =>
    text
      .split('\n')
      .filter(Boolean)
      .map((b) => `<tr><td style="width:8px;color:${accent};padding-right:4px;vertical-align:top;font-size:${base.includes('font-size:9') ? 9 : base.includes('font-size:13') ? 13 : 11}px">•</td><td style="padding-bottom:2px">${escapeHtml(b)}</td></tr>`)
      .join('')

  const section = (title: string, content: string) => `
    <div style="margin-bottom:${base.includes('font-size:9') ? 13 : base.includes('font-size:13') ? 16 : 14}px">
      <div style="font-size:${base.includes('font-size:9') ? 11 : 14}px;font-weight:bold;text-transform:uppercase;margin-bottom:6px;color:${accent};border-bottom:1px solid #eee;padding-bottom:4px">${title}</div>
      ${content}
    </div>
  `

  let html = `
    <div style="margin-bottom:14px;border-bottom:2px solid ${accent};padding-bottom:8px">
      <div style="font-size:${base.includes('font-size:9') ? 24 : base.includes('font-size:13') ? 28 : 26}px;font-weight:bold;margin-bottom:15px;color:${accent}">${escapeHtml(basics.name)}</div>
      ${basics.label ? `<div style="font-size:${base.includes('font-size:9') ? 12 : 14}px;color:#666;margin-bottom:8px;font-weight:bold">${escapeHtml(basics.label)}</div>` : ''}
      <div style="font-size:${base.includes('font-size:9') ? 8 : base.includes('font-size:13') ? 12 : 10}px;color:#555;display:flex;flex-wrap:wrap;gap:10px">
        ${[basics.email, basics.phone, basics.location, basics.url].filter(Boolean).map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
      </div>
    </div>
  `

  if (basics.summary) {
    html += section('Summary', `<div style="line-height:${base.includes('line-height:1.1') ? 1.3 : base.includes('line-height:1.5') ? 1.6 : 1.4}">${escapeHtml(basics.summary)}</div>`)
  }

  if (work.length > 0) {
    html += section('Experience', work.map((w) => `
      <div style="margin-bottom:${base.includes('font-size:9') ? 10 : base.includes('font-size:13') ? 14 : 12}px">
        <div style="display:flex;justify-content:space-between;margin-bottom:2px">
          <div style="font-weight:bold;color:#000">${escapeHtml(w.position)}${w.company ? ` <span style="font-weight:normal;color:#666">at ${escapeHtml(w.company)}</span>` : ''}</div>
          <div style="color:${accent};font-size:${base.includes('font-size:9') ? 8 : base.includes('font-size:13') ? 12 : 10}px">${escapeHtml(w.startDate)}${w.endDate ? ` - ${escapeHtml(w.endDate)}` : ''}</div>
        </div>
        ${w.highlights ? `<table style="margin-top:4px">${bullets(w.highlights)}</table>` : ''}
      </div>
    `).join(''))
  }

  if (education.length > 0) {
    html += section('Education', education.map((e) => `
      <div style="margin-bottom:${base.includes('font-size:9') ? 8 : 12}px">
        <div style="display:flex;justify-content:space-between">
          <div style="font-weight:bold">${escapeHtml(e.institution)}</div>
          <div style="color:${accent};font-size:${base.includes('font-size:9') ? 8 : base.includes('font-size:13') ? 12 : 10}px">${escapeHtml(e.startDate)}${e.endDate ? ` - ${escapeHtml(e.endDate)}` : ''}</div>
        </div>
        <div style="font-style:italic;color:#666;font-size:${base.includes('font-size:9') ? 8 : base.includes('font-size:13') ? 12 : 10}px">${[e.studyType, e.area].filter(Boolean).join(' in ')}${e.score ? ` — ${escapeHtml(e.score)}` : ''}</div>
      </div>
    `).join(''))
  }

  if (skills.length > 0) {
    html += section('Skills', skills.map((s) => `
      <div style="margin-bottom:4px">
        <span style="font-weight:bold">${escapeHtml(s.name)}</span>
        ${s.keywords ? `<span style="color:#000;font-weight:normal;font-size:${base.includes('font-size:9') ? 8 : 9}px"> — ${escapeHtml(s.keywords)}</span>` : ''}
      </div>
    `).join(''))
  }

  if (projects.length > 0) {
    html += section('Projects', projects.map((p) => `
      <div style="margin-bottom:${base.includes('font-size:9') ? 8 : 12}px">
        <div style="display:flex;justify-content:space-between">
          <div style="font-weight:bold">${escapeHtml(p.name)}${p.url ? `<span style="font-weight:normal;font-size:${base.includes('font-size:9') ? 8 : 10}px;color:${accent};text-decoration:underline;margin-left:4px">${escapeHtml(p.url)}</span>` : ''}</div>
          <div style="color:${accent};font-size:${base.includes('font-size:9') ? 8 : base.includes('font-size:13') ? 12 : 10}px">${escapeHtml(p.startDate)}${p.endDate ? ` - ${escapeHtml(p.endDate)}` : ''}</div>
        </div>
        ${p.highlights ? `<table style="margin-top:4px">${bullets(p.highlights)}</table>` : ''}
      </div>
    `).join(''))
  }

  if (certifications.length > 0) {
    html += section('Certifications', certifications.map((c) => `
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between">
          <div style="font-weight:bold">${escapeHtml(c.name)}</div>
          <div style="color:${accent};font-size:${base.includes('font-size:9') ? 8 : base.includes('font-size:13') ? 12 : 10}px">${escapeHtml(c.startDate)}${c.endDate ? ` - ${escapeHtml(c.endDate)}` : ''}</div>
        </div>
        <div style="font-style:italic;color:#666;font-size:${base.includes('font-size:9') ? 8 : 10}px">${escapeHtml(c.issuer)}</div>
      </div>
    `).join(''))
  }

  if (volunteer.length > 0) {
    html += section('Volunteer', volunteer.map((v) => `
      <div style="margin-bottom:${base.includes('font-size:9') ? 8 : 12}px">
        <div style="display:flex;justify-content:space-between">
          <div style="font-weight:bold">${escapeHtml(v.position)}${v.organization ? ` <span style="font-weight:normal;color:#666">at ${escapeHtml(v.organization)}</span>` : ''}</div>
          <div style="color:${accent};font-size:${base.includes('font-size:9') ? 8 : base.includes('font-size:13') ? 12 : 10}px">${escapeHtml(v.startDate)}${v.endDate ? ` - ${escapeHtml(v.endDate)}` : ''}</div>
        </div>
        ${v.highlights ? `<table style="margin-top:4px">${bullets(v.highlights)}</table>` : ''}
      </div>
    `).join(''))
  }

  if (languages.length > 0) {
    html += section('Languages', languages.map((l) => `
      <div style="margin-bottom:4px">
        <span style="font-weight:bold">${escapeHtml(l.name)}</span>
        ${l.fluency ? `<span style="color:#888;font-size:${base.includes('font-size:9') ? 8 : 9}px"> — ${escapeHtml(l.fluency)}</span>` : ''}
      </div>
    `).join(''))
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${base}
</head>
<body>
  ${html}
</body>
</html>`
}
