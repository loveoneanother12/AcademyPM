/**
 * 탭 4: 결과
 * 날짜별 수업별 요약 조회
 */

import {
  getClasses,
  getAttendance,
  getClassMemo,
  getTestScores,
  getStudentMemos,
  getStudents,
} from '../api.js'
import { isOnline } from '../lib/supabase.js'

let currentDate = new Date().toLocaleDateString('sv-KR')
let calendarVisible = false
let resSearchQuery = ''
let cachedClassDataList = []

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export async function renderResultsPage(container) {
  container.innerHTML = `
    <div class="attendance-header">
      <div class="date-nav">
        <button class="date-nav-btn" id="res-prev-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="date-display" id="res-date-display">
          <div style="display:flex;align-items:center;justify-content:center;gap:6px">
            <span class="date-display-main" id="res-date-main"></span>
            <button class="date-cal-btn" id="res-cal-btn" title="캘린더">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
          </div>
          <span class="date-display-sub" id="res-date-sub"></span>
        </div>
        <button class="date-nav-btn" id="res-next-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="week-strip" id="res-week-strip"></div>
    </div>
    <div class="search-wrap">
      <input class="search-input" id="res-search" type="text" placeholder="수업명, 강사, 과목, 학생 검색..." />
    </div>
    <div id="results-content" style="padding:12px 16px">
      <div class="loading-screen"><div class="loading-spinner"></div></div>
    </div>
    ${isOnline ? '' : '<div class="offline-banner" style="margin:0 16px 8px">오프라인 모드 — 샘플 데이터</div>'}
  `

  // FAB 제거
  const fab = document.querySelector('.fab')
  if (fab) fab.remove()

  resSearchQuery = ''

  document.getElementById('res-prev-btn').onclick = () => changeDate(-7)
  document.getElementById('res-next-btn').onclick = () => changeDate(7)
  document.getElementById('res-cal-btn').onclick = () => toggleCalendar()
  document.getElementById('res-search').addEventListener('input', e => {
    resSearchQuery = e.target.value.toLowerCase()
    renderResultsContent()
  })

  updateDateDisplay()
  renderWeekStrip()
  await loadResults()
}

function updateDateDisplay() {
  const d = new Date(currentDate + 'T00:00:00')
  const mainEl = document.getElementById('res-date-main')
  const subEl = document.getElementById('res-date-sub')
  if (!mainEl) return

  const month = d.getMonth() + 1
  const day = d.getDate()
  const dow = DAY_LABELS[d.getDay()]
  const today = new Date().toLocaleDateString('sv-KR')

  mainEl.textContent = `${currentDate.slice(0, 4)}. ${String(month).padStart(2, '0')}. ${String(day).padStart(2, '0')}`
  subEl.textContent = `${dow}요일${currentDate === today ? ' · 오늘' : ''}`
}

function changeDate(delta) {
  const d = new Date(currentDate + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  currentDate = d.toLocaleDateString('sv-KR')
  updateDateDisplay()
  renderWeekStrip()
  loadResults()
}

function renderWeekStrip() {
  const strip = document.getElementById('res-week-strip')
  if (!strip) return

  const today = new Date().toLocaleDateString('sv-KR')
  const cur = new Date(currentDate + 'T00:00:00')
  const dayOfWeek = cur.getDay()
  const monday = new Date(cur)
  monday.setDate(cur.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(d)
  }

  strip.innerHTML = days.map(d => {
    const dateStr = d.toLocaleDateString('sv-KR')
    const isActive = dateStr === currentDate
    const isToday = dateStr === today
    const dow = DAY_LABELS[d.getDay()]
    const dayNum = d.getDate()
    return `
      <div class="week-day ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}" data-date="${dateStr}">
        <span class="week-day-label">${dow}</span>
        <span class="week-day-num">${dayNum}</span>
        <span class="week-day-dot" id="res-dot-${dateStr}"></span>
      </div>
    `
  }).join('')

  strip.querySelectorAll('.week-day').forEach(el => {
    el.onclick = () => {
      currentDate = el.dataset.date
      updateDateDisplay()
      renderWeekStrip()
      loadResults()
    }
  })

  checkWeekDots(days.map(d => d.toLocaleDateString('sv-KR')))
}

async function checkWeekDots(dates) {
  for (const date of dates) {
    const att = await getAttendance(date)
    const dot = document.getElementById('res-dot-' + date)
    if (dot && att && att.length > 0) {
      dot.classList.add('has-data')
    }
  }
}

async function loadResults() {
  const content = document.getElementById('results-content')
  if (!content) return

  content.innerHTML = '<div class="loading-screen"><div class="loading-spinner"></div></div>'

  const [classes, students, attRows] = await Promise.all([
    getClasses(),
    getStudents(),
    getAttendance(currentDate),
  ])

  // 선택된 요일의 수업만 필터 (기간 제한도 적용)
  const dow = DAY_LABELS[new Date(currentDate + 'T00:00:00').getDay()]
  const dayClasses = classes.filter(cls => {
    if (cls.is_oneday) return cls.start_date === currentDate
    if (!(cls.days || []).includes(dow)) return false
    if (cls.start_date && currentDate < cls.start_date) return false
    if (cls.end_date && currentDate > cls.end_date) return false
    return true
  })

  // 출석 데이터 있는 수업만 표시 (없으면 해당 요일 전체)
  const attClassIds = new Set(attRows.map(r => r.class_id))
  const displayClasses = attClassIds.size > 0
    ? dayClasses.filter(c => attClassIds.has(c.id))
    : dayClasses

  if (displayClasses.length === 0) {
    cachedClassDataList = []
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-text">이 날의 기록이 없습니다</div>
        <div class="empty-state-sub">출석 탭에서 기록을 입력하세요</div>
      </div>
    `
    return
  }

  cachedClassDataList = await Promise.all(
    displayClasses.map(async cls => {
      const [memo, scores, studentMemos] = await Promise.all([
        getClassMemo(currentDate, cls.id),
        getTestScores(currentDate, cls.id),
        getStudentMemos(currentDate, cls.id),
      ])
      const clsAtt = attRows.filter(r => r.class_id === cls.id)
      return { cls, memo, scores, att: clsAtt, students, studentMemos }
    })
  )

  renderResultsContent()
}

function renderResultsContent() {
  const content = document.getElementById('results-content')
  if (!content) return

  if (cachedClassDataList.length === 0) return

  const filtered = resSearchQuery
    ? cachedClassDataList.filter(({ cls }) =>
        cls.name.toLowerCase().includes(resSearchQuery) ||
        (cls.teacher || '').toLowerCase().includes(resSearchQuery) ||
        (cls.subject || '').toLowerCase().includes(resSearchQuery) ||
        (cls.students || []).some(s => (typeof s === 'object' ? s.name : '').toLowerCase().includes(resSearchQuery))
      )
    : cachedClassDataList

  if (filtered.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">검색 결과가 없습니다</div>
      </div>
    `
    return
  }

  content.innerHTML = filtered.map(({ cls, memo, scores, att, students, studentMemos }) => {
    const clsStudents = cls.students || []

    const attMap = {}
    att.forEach(r => { attMap[r.student_id] = r })

    const studentMemoMap = {}
    ;(studentMemos || []).forEach(r => { if (r.memo) studentMemoMap[r.student_id] = r.memo })

    const statusLabel = { present: '출석', late: '지각', absent: '결석' }
    const statusColor = { present: 'var(--green)', late: 'var(--yellow)', absent: 'var(--red)' }

    const presentCount = att.filter(r => r.status === 'present').length
    const lateCount = att.filter(r => r.status === 'late').length
    const absentCount = att.filter(r => r.status === 'absent').length

    return `
      <div class="results-summary-card">
        <div class="results-class-header">
          <div class="results-class-name">${cls.name}</div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
            <span class="subject-tag ${cls.subject || ''}" style="font-size:10px">${cls.subject || ''}</span>
            <div class="attendance-summary-pill">
              <span class="att-present">${presentCount}출</span>
              <span style="color:var(--border)">|</span>
              <span class="att-late">${lateCount}지</span>
              <span style="color:var(--border)">|</span>
              <span class="att-absent">${absentCount}결</span>
            </div>
          </div>
        </div>

        ${clsStudents.length > 0 ? `
          <div class="results-section-label">출결 현황</div>
          ${clsStudents.map(s => {
            const sid = typeof s === 'object' ? s.id : s
            const student = typeof s === 'object' ? s : students.find(st => st.id === sid)
            if (!student) return ''
            const r = attMap[sid]
            const status = r?.status || ''
            const hw = r?.homework_pct ?? '-'
            const studentMemo = studentMemoMap[sid] || ''
            return `
              <div class="results-att-row">
                <span class="results-att-name">${student.name}</span>
                <span class="results-att-status" style="color:${statusColor[status] || 'var(--text3)'}">
                  ${statusLabel[status] || '-'}
                </span>
                <span class="results-att-hw">과제 ${hw !== '-' ? hw + '%' : '-'}</span>
              </div>
              ${studentMemo ? `<div class="results-student-memo">${studentMemo}</div>` : ''}
            `
          }).join('')}
        ` : ''}

        ${memo?.memo ? `
          <div class="results-section-label">수업 메모</div>
          <div class="results-memo-box">${memo.memo}</div>
        ` : ''}

        ${scores.length > 0 ? (() => {
          // test_slot 기준으로 그룹핑 (슬롯별 별도 박스)
          const groups = []
          const seen = new Map()
          scores.forEach(r => {
            const key = r.test_slot ?? 0
            if (!seen.has(key)) { seen.set(key, []); groups.push({ slot: key, name: r.test_name || '', rows: seen.get(key) }) }
            seen.get(key).push(r)
          })
          groups.sort((a, b) => a.slot - b.slot)
          return `
            <div class="results-section-label">테스트 점수</div>
            ${groups.map(g => `
              <div class="results-test-box">
                ${g.name ? `<div class="results-test-name">${g.name}</div>` : ''}
                ${g.rows.filter(r => r.score !== null && r.score !== undefined).map(r => {
                  const student = students.find(s => s.id === r.student_id)
                  const grade = scoreToGrade(r.score)
                  return `
                    <div class="results-score-row">
                      <span class="results-score-name">${student?.name || '?'}</span>
                      <span class="results-score-val">${r.score}점</span>
                      <span class="score-grade ${grade}">${grade}</span>
                    </div>
                  `
                }).join('')}
              </div>
            `).join('')}
          `
        })() : ''}
      </div>
    `
  }).join('')
}

function scoreToGrade(score) {
  if (score === null || score === undefined || score === '') return 'none'
  const n = Number(score)
  if (n >= 90) return 'A'
  if (n >= 75) return 'B'
  if (n >= 60) return 'C'
  return 'D'
}

// ========================================
// 캘린더 팝업
// ========================================

function toggleCalendar() {
  const popup = document.getElementById('calendar-popup')
  if (!popup) return
  if (!calendarVisible) {
    calendarVisible = true
    renderCalendar(popup)
    popup.classList.remove('hidden')
    setTimeout(() => {
      document.addEventListener('click', closeCalendarOnOutside, { once: true })
    }, 50)
  } else {
    closeCalendar()
  }
}

function closeCalendarOnOutside(e) {
  const popup = document.getElementById('calendar-popup')
  if (popup && !popup.contains(e.target)) {
    closeCalendar()
  } else if (calendarVisible) {
    document.addEventListener('click', closeCalendarOnOutside, { once: true })
  }
}

function closeCalendar() {
  const popup = document.getElementById('calendar-popup')
  if (popup) popup.classList.add('hidden')
  calendarVisible = false
}

function renderCalendar(popup) {
  const selDate = new Date(currentDate + 'T00:00:00')
  let viewYear = selDate.getFullYear()
  let viewMonth = selDate.getMonth()

  function render() {
    const today = new Date().toLocaleDateString('sv-KR')
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push('<div class="cal-day"></div>')
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isSelected = dateStr === currentDate
      const isToday = dateStr === today
      cells.push(`
        <div class="cal-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}"
          data-date="${dateStr}">${d}</div>
      `)
    }

    popup.innerHTML = `
      <div class="cal-header">
        <button class="cal-nav-btn" id="cal-prev">◀</button>
        <span class="cal-month-label">${viewYear}년 ${viewMonth + 1}월</span>
        <button class="cal-nav-btn" id="cal-next">▶</button>
      </div>
      <div class="cal-week-labels">
        ${['일','월','화','수','목','금','토'].map(d => `<div class="cal-week-label">${d}</div>`).join('')}
      </div>
      <div class="cal-grid">${cells.join('')}</div>
      <button class="cal-close-btn" id="cal-close">닫기</button>
    `

    popup.querySelector('#cal-prev').onclick = (e) => {
      e.stopPropagation()
      viewMonth--
      if (viewMonth < 0) { viewMonth = 11; viewYear-- }
      render()
    }
    popup.querySelector('#cal-next').onclick = (e) => {
      e.stopPropagation()
      viewMonth++
      if (viewMonth > 11) { viewMonth = 0; viewYear++ }
      render()
    }
    popup.querySelector('#cal-close').onclick = (e) => {
      e.stopPropagation()
      closeCalendar()
    }
    popup.querySelectorAll('.cal-day[data-date]').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation()
        currentDate = el.dataset.date
        updateDateDisplay()
        loadResults()
        closeCalendar()
      }
    })
  }

  render()
}
