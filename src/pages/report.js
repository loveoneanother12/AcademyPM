/**
 * 학생 리포트 페이지 (공유 링크용)
 * ?report=TOKEN 으로 접근
 */

import { getStudentToken, getStudentReportData } from '../api.js'

export async function renderReportPage(container, token) {
  container.innerHTML = `<div class="loading-screen"><div class="loading-spinner"></div></div>`

  let tokenRecord
  try {
    tokenRecord = await getStudentToken(token)
  } catch (e) {
    renderError(container, '데이터를 불러오는 중 오류가 발생했습니다.')
    return
  }

  if (!tokenRecord) {
    renderError(container, '유효하지 않은 링크입니다.')
    return
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    renderError(container, '링크가 만료되었습니다.\n담당 강사에게 새 링크를 요청하세요.')
    return
  }

  const student = tokenRecord.students
  const { data_from, data_to } = tokenRecord

  let reportData
  try {
    reportData = await getStudentReportData(student.id, data_from, data_to)
  } catch (e) {
    renderError(container, '데이터를 불러오는 중 오류가 발생했습니다.')
    return
  }

  const { attendance, testScores, memos, classes } = reportData

  // 수업별로 데이터 집계
  const classStats = classes.map(cls => {
    const attRows = attendance.filter(r => r.class_id === cls.id && !r.is_na)
    const total = attRows.length
    const present = attRows.filter(r => r.status === 'present').length
    const late = attRows.filter(r => r.status === 'late').length
    const absent = attRows.filter(r => r.status === 'absent').length
    const attRate = total > 0 ? Math.round((present + late) / total * 100) : null
    const hwRows = attRows.filter(r => r.homework_pct != null)
    const hwAvg = hwRows.length > 0 ? Math.round(hwRows.reduce((s, r) => s + r.homework_pct, 0) / hwRows.length) : null
    const clsScores = testScores.filter(r => r.class_id === cls.id)
    const clsMemoMap = Object.fromEntries(
      memos.filter(r => r.class_id === cls.id).map(m => [m.date, m.memo])
    )
    // 출결 날짜 기준으로 메모 목록 구성 (날짜 내림차순)
    const clsMemoRows = [...attRows]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(r => ({
        date: r.date,
        memo: clsMemoMap[r.date] ?? null,
        status: r.status,
      }))
    return { cls, total, present, late, absent, attRate, hwAvg, clsScores, clsMemoRows }
  }).filter(s => s.total > 0 || s.clsScores.length > 0 || s.clsMemoRows.length > 0)

  const avatarClass = student.gender === '남' ? 'male' : 'female'
  const fmtDate = d => d ? d.replace(/-/g, '.') : ''

  container.innerHTML = `
    <div class="report-page">
      <div class="report-header">
        <div class="report-logo">AcademyPM</div>
        <div class="report-period">${fmtDate(data_from)} ~ ${fmtDate(data_to)}</div>
      </div>

      <div class="report-student-card">
        <div class="student-avatar ${avatarClass}" style="width:52px;height:52px;border-radius:16px;font-size:20px;flex-shrink:0">
          ${student.name.charAt(0)}
        </div>
        <div>
          <div class="report-student-name">${student.name}</div>
          <div class="report-student-meta">${student.grade || ''}${student.school ? ' · ' + student.school : ''}</div>
        </div>
      </div>

      ${classStats.length === 0 ? `
        <div class="report-empty">해당 기간에 기록된 데이터가 없습니다.</div>
      ` : classStats.map(({ cls, total, present, late, absent, attRate, hwAvg, clsScores, clsMemoRows }) => `
        <div class="report-class-block">
          <div class="report-class-header">
            <span class="report-class-name">${cls.name}</span>
            <span class="subject-tag ${cls.subject || ''}" style="font-size:11px;padding:2px 8px">${cls.subject || ''}</span>
          </div>
          <div class="report-class-teacher">
            ${cls.teacher || ''}
            ${cls.sub_teacher ? `<span style="font-size:11px;color:var(--text3)"> (보조강사: ${cls.sub_teacher})</span>` : ''}
          </div>

          ${total > 0 ? `
            <div class="report-stat-grid">
              <div class="report-stat-box">
                <div class="report-stat-val green">${present}</div>
                <div class="report-stat-label">출석</div>
              </div>
              <div class="report-stat-box">
                <div class="report-stat-val yellow">${late}</div>
                <div class="report-stat-label">지각</div>
              </div>
              <div class="report-stat-box">
                <div class="report-stat-val red">${absent}</div>
                <div class="report-stat-label">결석</div>
              </div>
              <div class="report-stat-box">
                <div class="report-stat-val">${total}</div>
                <div class="report-stat-label">총수업</div>
              </div>
            </div>
            <div class="report-rate-grid">
              <div class="report-rate-box">
                <div class="report-rate-val">${attRate != null ? attRate + '%' : '--'}</div>
                <div class="report-stat-label">출석률</div>
              </div>
              <div class="report-rate-box">
                <div class="report-rate-val">${hwAvg != null ? hwAvg + '%' : '--'}</div>
                <div class="report-stat-label">과제 평균</div>
              </div>
            </div>
          ` : ''}

          ${clsScores.length > 0 ? `
            <div class="report-section-title">테스트 결과</div>
            ${clsScores.length >= 2 ? `
              <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 10px 4px;margin-bottom:8px">
                ${scoreChartSVG([...clsScores].reverse())}
              </div>
            ` : ''}
            <div class="report-score-list">
              ${clsScores.map(s => `
                <div class="report-score-row">
                  <div style="display:flex;flex-direction:column;gap:1px">
                    ${s.test_name ? `<span style="font-size:12px;color:var(--text)">${s.test_name}</span>` : ''}
                    <span class="report-score-date">${fmtDate(s.date)}</span>
                  </div>
                  <span class="report-score-val">${s.score}점</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${clsMemoRows.length > 0 ? `
            <div class="report-section-title">강사 메모</div>
            <div class="report-memo-list">
              ${clsMemoRows.map(r => {
                const hasContent = r.memo && r.memo.trim()
                const placeholder = r.status === 'absent' ? '(결석)' : '(특이사항 없음)'
                return `
                <div class="report-memo-row">
                  <div class="report-score-date">${fmtDate(r.date)}</div>
                  <div class="report-memo-text" style="color:${hasContent ? 'var(--text)' : 'var(--text3)'}">
                    ${hasContent ? escapeHtml(r.memo) : placeholder}
                  </div>
                </div>`
              }).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}

      <div class="report-footer">
        이 페이지는 ${fmtDate(tokenRecord.expires_at?.slice(0, 10))}까지 유효합니다
      </div>
    </div>
  `
}

function renderError(container, msg) {
  container.innerHTML = `
    <div class="report-page">
      <div class="report-header">
        <div class="report-logo">AcademyPM</div>
      </div>
      <div class="report-error-card">
        <div class="report-error-icon">🔒</div>
        <div class="report-error-msg">${msg.replace(/\n/g, '<br>')}</div>
      </div>
    </div>
  `
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function scoreChartSVG(scores) {
  const W = 260, H = 90
  const pad = { top: 18, right: 10, bottom: 20, left: 28 }
  const cW = W - pad.left - pad.right
  const cH = H - pad.top - pad.bottom
  const n = scores.length
  if (n === 0) return ''

  const pts = scores.map((r, i) => ({
    x: pad.left + (n > 1 ? (i / (n - 1)) * cW : cW / 2),
    y: pad.top + cH - (r.score / 100) * cH,
    score: r.score,
    date: r.date,
  }))

  const grids = [0, 50, 100].map(v => {
    const y = (pad.top + cH - (v / 100) * cH).toFixed(1)
    return `<line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,3"/>
      <text x="${pad.left - 4}" y="${(+y + 4).toFixed(1)}" text-anchor="end" fill="var(--text3)" font-size="8">${v}</text>`
  }).join('')

  const areaPoints = n > 1
    ? `${pts[0].x.toFixed(1)},${(pad.top + cH).toFixed(1)} ${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} ${pts[n - 1].x.toFixed(1)},${(pad.top + cH).toFixed(1)}`
    : ''

  const area = n > 1 ? `<polygon points="${areaPoints}" fill="var(--accent)" opacity="0.12"/>` : ''

  const polyline = n > 1
    ? `<polyline points="${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`
    : ''

  const dots = pts.map(p =>
    `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="var(--accent)" stroke="var(--bg3)" stroke-width="1.5"/>`
  ).join('')

  const valLabels = pts.map(p =>
    `<text x="${p.x.toFixed(1)}" y="${(p.y - 7).toFixed(1)}" text-anchor="middle" fill="var(--text)" font-size="9" font-weight="600">${p.score}</text>`
  ).join('')

  const dateLabels = pts.map(p => {
    const day = parseInt(p.date.slice(-2), 10)
    return `<text x="${p.x.toFixed(1)}" y="${(pad.top + cH + 14).toFixed(1)}" text-anchor="middle" fill="var(--text3)" font-size="8">${day}일</text>`
  }).join('')

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block;overflow:visible">${grids}${area}${polyline}${dots}${valLabels}${dateLabels}</svg>`
}
