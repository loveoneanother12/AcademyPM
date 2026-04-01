/**
 * 탭 3: 출석 (메인 기능)
 */

import {
  getClasses,
  getAttendance,
  getClassMemo,
  getTestScores,
  getStudentMemos,
  upsertAttendance,
  upsertClassMemo,
  upsertTestScore,
  upsertStudentMemo,
} from '../api.js'
import { showToast } from '../components/toast.js'
import { isOnline } from '../lib/supabase.js'

let currentDate = new Date().toLocaleDateString('sv-KR')
let allClasses = []
let attendanceCache = {}   // classId → { studentId → {status, homework_pct} }
let memoCache = {}         // classId → memo string
let testScoreCache = {}    // classId → { studentId → score }
let studentMemoCache = {}  // classId → { studentId → memo string }
let calendarVisible = false
let attSearchQuery = ''

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export async function renderAttendancePage(container) {
  container.innerHTML = `
    <div class="attendance-header">
      <div class="date-nav">
        <button class="date-nav-btn" id="att-prev-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="date-display" id="att-date-display">
          <div style="display:flex;align-items:center;justify-content:center;gap:6px">
            <span class="date-display-main" id="att-date-main"></span>
            <button class="date-cal-btn" id="att-cal-btn" title="캘린더">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
          </div>
          <span class="date-display-sub" id="att-date-sub"></span>
        </div>
        <button class="date-nav-btn" id="att-next-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="week-strip" id="att-week-strip"></div>
    </div>
    <div class="search-wrap">
      <input class="search-input" id="att-search" type="text" placeholder="수업명, 강사, 과목, 학생 검색..." />
    </div>
    <div id="att-accordion-list" class="accordion-list">
      <div class="loading-screen"><div class="loading-spinner"></div></div>
    </div>
    ${isOnline ? '' : '<div class="offline-banner" style="margin:0 16px 8px">오프라인 모드 — 샘플 데이터</div>'}
  `

  // FAB 제거
  const fab = document.querySelector('.fab')
  if (fab) fab.remove()

  attSearchQuery = ''

  document.getElementById('att-prev-btn').onclick = () => changeDate(-7)
  document.getElementById('att-next-btn').onclick = () => changeDate(7)
  document.getElementById('att-cal-btn').onclick = () => toggleCalendar()
  document.getElementById('att-search').addEventListener('input', e => {
    attSearchQuery = e.target.value.toLowerCase()
    renderAccordionList()
  })

  updateDateDisplay()
  renderWeekStrip()
  await loadAttendanceData()
}

function updateDateDisplay() {
  const d = new Date(currentDate + 'T00:00:00')
  const mainEl = document.getElementById('att-date-main')
  const subEl = document.getElementById('att-date-sub')
  if (!mainEl) return

  const month = d.getMonth() + 1
  const day = d.getDate()
  const dow = DAY_LABELS[d.getDay()]
  const today = new Date().toLocaleDateString('sv-KR')

  mainEl.textContent = `${currentDate.slice(0, 4)}. ${String(month).padStart(2, '0')}. ${String(day).padStart(2, '0')}`
  subEl.textContent = `${dow}요일${currentDate === today ? ' · 오늘' : ''}`
}

function renderWeekStrip() {
  const strip = document.getElementById('att-week-strip')
  if (!strip) return

  const today = new Date().toLocaleDateString('sv-KR')
  const cur = new Date(currentDate + 'T00:00:00')
  // 이번 주 월요일 기준
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
        <span class="week-day-dot" id="dot-${dateStr}"></span>
      </div>
    `
  }).join('')

  strip.querySelectorAll('.week-day').forEach(el => {
    el.onclick = () => {
      currentDate = el.dataset.date
      updateDateDisplay()
      renderWeekStrip()
      loadAttendanceData()
    }
  })

  // 데이터가 있는 날 점 표시 (비동기)
  checkWeekDots(days.map(d => d.toLocaleDateString('sv-KR')))
}

async function checkWeekDots(dates) {
  for (const date of dates) {
    const att = await getAttendance(date)
    const dot = document.getElementById('dot-' + date)
    if (dot && att && att.length > 0) {
      dot.classList.add('has-data')
    }
  }
}

function changeDate(delta) {
  const d = new Date(currentDate + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  currentDate = d.toLocaleDateString('sv-KR')
  updateDateDisplay()
  renderWeekStrip()
  loadAttendanceData()
}

async function loadAttendanceData() {
  attendanceCache = {}
  memoCache = {}
  testScoreCache = {}
  studentMemoCache = {}

  allClasses = await getClasses()

  // 현재 날짜의 출석 데이터 전체 로드
  const attRows = await getAttendance(currentDate)
  attRows.forEach(r => {
    if (!attendanceCache[r.class_id]) attendanceCache[r.class_id] = {}
    attendanceCache[r.class_id][r.student_id] = {
      status: r.status,
      homework_pct: r.homework_pct || 0,
    }
  })

  renderAccordionList()
}

function renderAccordionList() {
  const list = document.getElementById('att-accordion-list')
  if (!list) return

  if (allClasses.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">등록된 수업이 없습니다</div>
        <div class="empty-state-sub">수업 탭에서 수업을 추가하세요</div>
      </div>
    `
    return
  }

  const dow = DAY_LABELS[new Date(currentDate + 'T00:00:00').getDay()]
  const todayClasses = allClasses.filter(cls => (cls.days || []).includes(dow))

  if (todayClasses.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">오늘은 수업이 없습니다</div>
      </div>
    `
    return
  }

  const visibleClasses = attSearchQuery
    ? todayClasses.filter(cls =>
        cls.name.toLowerCase().includes(attSearchQuery) ||
        (cls.teacher || '').toLowerCase().includes(attSearchQuery) ||
        (cls.subject || '').toLowerCase().includes(attSearchQuery) ||
        (cls.students || []).some(s => (typeof s === 'object' ? s.name : '').toLowerCase().includes(attSearchQuery))
      )
    : todayClasses

  if (visibleClasses.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">검색 결과가 없습니다</div>
      </div>
    `
    return
  }

  list.innerHTML = visibleClasses.map(cls => accordionHTML(cls)).join('')

  // 이벤트 바인딩
  list.querySelectorAll('.accordion-header').forEach(header => {
    header.onclick = () => toggleAccordion(header.closest('.accordion-item'))
  })

  visibleClasses.forEach(cls => {
    bindClassAccordion(cls)
  })
}

function getSummary(classId, students) {
  const cache = attendanceCache[classId] || {}
  let present = 0, late = 0, absent = 0
  students.forEach(s => {
    const sid = typeof s === 'object' ? s.id : s
    const status = cache[sid]?.status
    if (status === 'present') present++
    else if (status === 'late') late++
    else if (status === 'absent') absent++
  })
  return { present, late, absent }
}

function accordionHTML(cls) {
  const students = cls.students || []
  const { present, late, absent } = getSummary(cls.id, students)
  const hasMemo = !!memoCache[cls.id]

  return `
    <div class="accordion-item" data-class-id="${cls.id}">
      <div class="accordion-header">
        <div class="accordion-title-group">
          <div class="accordion-class-name">${cls.name}</div>
          <div class="accordion-class-meta">${cls.teacher || ''} ${cls.time ? '· ' + cls.time : ''}</div>
        </div>
        <div class="accordion-right">
          <span class="subject-tag ${cls.subject || ''}" style="font-size:10px">${cls.subject || ''}</span>
          <div class="attendance-summary-pill">
            <span class="att-present">${present}출</span>
            <span style="color:var(--border)">|</span>
            <span class="att-late">${late}지</span>
            <span style="color:var(--border)">|</span>
            <span class="att-absent">${absent}결</span>
          </div>
          <div class="accordion-chevron">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>
      <div class="accordion-body">
        <div class="accordion-inner">
          <!-- 패널 탭 버튼 -->
          <div class="panel-tabs">
            <button class="panel-tab-btn" data-panel="memo">
              📝 수업 메모
              <span class="memo-saved-indicator" id="memo-ind-${cls.id}" style="${hasMemo ? '' : 'display:none'}">✦</span>
            </button>
            <button class="panel-tab-btn" data-panel="test">📊 테스트 결과</button>
          </div>

          <!-- 수업 메모 패널 -->
          <div class="panel" id="panel-memo-${cls.id}">
            <div class="memo-preview" id="memo-preview-${cls.id}" style="${memoCache[cls.id] ? '' : 'display:none'}">${memoCache[cls.id] ? escapeHtml(memoCache[cls.id]) : ''}</div>
            <textarea class="panel-textarea" id="memo-ta-${cls.id}" placeholder="오늘 수업 메모를 입력하세요...">${memoCache[cls.id] || ''}</textarea>
          </div>
          <div class="memo-save-bar" id="memo-save-bar-${cls.id}">
            <button class="btn btn-primary btn-sm" id="memo-save-${cls.id}">저장</button>
          </div>

          <!-- 테스트 결과 패널 -->
          <div class="panel" id="panel-test-${cls.id}">
            <div class="test-no-exam-row">
              <span>테스트 미실시</span>
              <button class="toggle-btn" id="no-exam-toggle-${cls.id}" data-active="false">
                <span class="toggle-knob"></span>
              </button>
            </div>
            <div id="test-inputs-${cls.id}">
              ${students.length === 0 ? '<div style="font-size:13px;color:var(--text3);padding:4px 0">수강생이 없습니다</div>' :
                students.map(s => {
                  const sid = typeof s === 'object' ? s.id : s
                  const student = typeof s === 'object' ? s : { id: sid, name: '?' }
                  const score = testScoreCache[cls.id]?.[sid] ?? ''
                  const grade = scoreToGrade(score)
                  return `
                    <div class="test-student-row">
                      <div class="test-student-name">${student.name}</div>
                      <input class="test-score-input" type="text" inputmode="numeric"
                        placeholder="점수" value="${score !== '' ? score : ''}"
                        id="score-${cls.id}-${sid}" data-class-id="${cls.id}" data-student-id="${sid}" />
                      <div class="score-grade ${grade}" id="grade-${cls.id}-${sid}">${grade}</div>
                    </div>
                  `
                }).join('')
              }
            </div>
          </div>
          <div class="test-save-bar" id="test-save-bar-${cls.id}">
            <button class="btn btn-primary btn-sm" id="test-save-${cls.id}">저장</button>
          </div>

          <!-- 학생 출결 행 -->
          <div id="student-rows-${cls.id}">
            ${renderStudentRows(cls)}
          </div>

          <!-- 출결 저장 버튼 -->
          <div class="att-save-bar" id="att-save-bar-${cls.id}">
            <button class="btn btn-primary btn-sm" id="att-save-${cls.id}">저장</button>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderStudentRows(cls) {
  const students = cls.students || []
  if (students.length === 0) {
    return '<div style="font-size:13px;color:var(--text3);padding:8px 0">수강생이 없습니다</div>'
  }
  return students.map(s => {
    const sid = typeof s === 'object' ? s.id : s
    const student = typeof s === 'object' ? s : { id: sid, name: '?', gender: '', school: '' }
    const cache = attendanceCache[cls.id]?.[sid] || {}
    const status = cache.status || ''
    const hw = cache.homework_pct ?? 0
    const avatarClass = student.gender === '남' ? 'male' : 'female'
    const hwColor = hw >= 80 ? 'var(--green)' : hw >= 50 ? 'var(--yellow)' : hw > 0 ? 'var(--red)' : 'var(--border)'

    const memoVal = studentMemoCache[cls.id]?.[sid] || ''
    return `
      <div class="att-student-row" data-student-id="${sid}" data-class-id="${cls.id}">
        <div class="att-avatar ${avatarClass}">${student.name.charAt(0)}</div>
        <div class="att-student-info">
          <div class="att-student-name">${student.name}</div>
          <div class="att-student-school">${student.school || ''}</div>
        </div>
        <div class="att-buttons">
          <button class="att-btn present ${status === 'present' ? 'active' : ''}" data-status="present">출석</button>
          <button class="att-btn late ${status === 'late' ? 'active' : ''}" data-status="late">지각</button>
          <button class="att-btn absent ${status === 'absent' ? 'active' : ''}" data-status="absent">결석</button>
        </div>
        <div class="homework-slider-wrap">
          <div class="homework-slider-label">
            <span class="homework-label-text">과제</span>
            <span class="homework-pct-value" id="hw-val-${cls.id}-${sid}">${hw}%</span>
          </div>
          <input class="homework-slider" type="range" min="0" max="100" step="10"
            value="${hw}"
            style="background: linear-gradient(to right, ${hwColor} ${hw}%, var(--border) ${hw}%)"
            id="hw-slider-${cls.id}-${sid}"
            data-class-id="${cls.id}"
            data-student-id="${sid}" />
        </div>
        <div class="student-memo-wrap">
          <input class="student-memo-input" type="text"
            id="smemo-${cls.id}-${sid}"
            placeholder="개인 메모..."
            value="${escapeHtml(memoVal)}"
            data-class-id="${cls.id}"
            data-student-id="${sid}" />
        </div>
      </div>
    `
  }).join('')
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function scoreToGrade(score) {
  if (score === '' || score === null || score === undefined) return 'none'
  const n = Number(score)
  if (n >= 90) return 'A'
  if (n >= 75) return 'B'
  if (n >= 60) return 'C'
  return 'D'
}

function toggleAccordion(item) {
  const isOpen = item.classList.contains('open')
  // 모두 닫기
  document.querySelectorAll('.accordion-item.open').forEach(el => el.classList.remove('open'))
  if (!isOpen) {
    item.classList.add('open')
    // 메모/점수 로드
    const classId = item.dataset.classId
    loadPanelData(classId)
  }
}

async function loadPanelData(classId) {
  // 메모 로드
  const memo = await getClassMemo(currentDate, classId)
  if (memo) {
    memoCache[classId] = memo.memo
    const ta = document.getElementById('memo-ta-' + classId)
    if (ta) ta.value = memo.memo || ''
    const ind = document.getElementById('memo-ind-' + classId)
    if (ind) ind.style.display = memo.memo ? '' : 'none'
    const preview = document.getElementById('memo-preview-' + classId)
    if (preview) {
      preview.innerHTML = memo.memo ? escapeHtml(memo.memo) : ''
      preview.style.display = memo.memo ? '' : 'none'
    }
  }

  // 테스트 점수 로드
  const scores = await getTestScores(currentDate, classId)
  if (!testScoreCache[classId]) testScoreCache[classId] = {}
  scores.forEach(r => {
    testScoreCache[classId][r.student_id] = r.score
    const input = document.getElementById(`score-${classId}-${r.student_id}`)
    if (input) input.value = r.score
    const gradeEl = document.getElementById(`grade-${classId}-${r.student_id}`)
    if (gradeEl) {
      const g = scoreToGrade(r.score)
      gradeEl.textContent = g
      gradeEl.className = `score-grade ${g}`
    }
  })

  // 학생 메모 로드
  const studentMemos = await getStudentMemos(currentDate, classId)
  if (!studentMemoCache[classId]) studentMemoCache[classId] = {}
  studentMemos.forEach(r => {
    studentMemoCache[classId][r.student_id] = r.memo || ''
    const ta = document.getElementById(`smemo-${classId}-${r.student_id}`)
    if (ta) ta.value = r.memo || ''
  })
}

function bindClassAccordion(cls) {
  const classId = cls.id
  const item = document.querySelector(`.accordion-item[data-class-id="${classId}"]`)
  if (!item) return

  // 패널 탭 버튼
  item.querySelectorAll('.panel-tab-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation()
      const panel = btn.dataset.panel
      // 같은 패널 클릭 시 토글
      const targetPanel = document.getElementById(`panel-${panel}-${classId}`)
      const isVisible = targetPanel?.classList.contains('visible')

      // 모든 패널 닫기
      item.querySelectorAll('.panel').forEach(p => p.classList.remove('visible'))
      item.querySelectorAll('.panel-tab-btn').forEach(b => b.classList.remove('active'))
      const memoBar = document.getElementById(`memo-save-bar-${classId}`)
      const testBar = document.getElementById(`test-save-bar-${classId}`)
      if (memoBar) memoBar.classList.remove('visible')
      if (testBar) testBar.classList.remove('visible')

      if (!isVisible) {
        targetPanel?.classList.add('visible')
        btn.classList.add('active')
        if (panel === 'memo' && memoBar) memoBar.classList.add('visible')
        if (panel === 'test' && testBar) testBar.classList.add('visible')
      }
    }
  })

  // 메모 저장
  const memoSaveBtn = document.getElementById(`memo-save-${classId}`)
  if (memoSaveBtn) {
    memoSaveBtn.onclick = async (e) => {
      e.stopPropagation()
      const ta = document.getElementById(`memo-ta-${classId}`)
      const memo = ta?.value.trim() || ''
      try {
        await upsertClassMemo(currentDate, classId, memo)
        memoCache[classId] = memo
        const ind = document.getElementById(`memo-ind-${classId}`)
        if (ind) ind.style.display = memo ? '' : 'none'
        const preview = document.getElementById(`memo-preview-${classId}`)
        if (preview) {
          preview.innerHTML = memo ? escapeHtml(memo) : ''
          preview.style.display = memo ? '' : 'none'
        }
        showToast('메모 저장 완료 ✦', 'success')
      } catch (e) {
        showToast('저장 실패', 'error')
      }
    }
  }

  // 테스트 점수 입력 (grade 실시간 표시)
  item.querySelectorAll('.test-score-input').forEach(input => {
    input.addEventListener('input', (e) => {
      e.stopPropagation()
      let val = parseInt(input.value)
      if (isNaN(val)) val = ''
      else val = Math.max(0, Math.min(100, val))
      if (val !== '') input.value = val
      const g = scoreToGrade(val)
      const gradeEl = document.getElementById(`grade-${input.dataset.classId}-${input.dataset.studentId}`)
      if (gradeEl) {
        gradeEl.textContent = g === 'none' ? '-' : g
        gradeEl.className = `score-grade ${g}`
      }
    })
    input.addEventListener('click', (e) => e.stopPropagation())
  })

  // 테스트 미실시 토글
  const noExamToggle = document.getElementById(`no-exam-toggle-${classId}`)
  if (noExamToggle) {
    noExamToggle.onclick = (e) => {
      e.stopPropagation()
      const nowActive = noExamToggle.dataset.active === 'true'
      const next = !nowActive
      noExamToggle.dataset.active = String(next)
      noExamToggle.classList.toggle('active', next)
      const inputsWrap = document.getElementById(`test-inputs-${classId}`)
      if (inputsWrap) {
        inputsWrap.querySelectorAll('.test-score-input').forEach(inp => { inp.disabled = next })
      }
      const testSaveBtn = document.getElementById(`test-save-${classId}`)
      if (testSaveBtn) testSaveBtn.disabled = next
    }
  }

  // 테스트 결과 저장 버튼
  const testSaveBtn = document.getElementById(`test-save-${classId}`)
  if (testSaveBtn) {
    testSaveBtn.onclick = async (e) => {
      e.stopPropagation()
      testSaveBtn.disabled = true
      testSaveBtn.textContent = '저장 중...'
      try {
        const students = cls.students || []
        for (const s of students) {
          const sid = typeof s === 'object' ? s.id : s
          const input = document.getElementById(`score-${classId}-${sid}`)
          if (!input) continue
          const val = input.value === '' ? null : parseInt(input.value)
          if (val !== null && (val < 0 || val > 100)) continue
          await upsertTestScore(currentDate, classId, sid, val)
          if (!testScoreCache[classId]) testScoreCache[classId] = {}
          testScoreCache[classId][sid] = val
        }
        showToast('테스트 결과 저장 완료', 'success')
      } catch (err) {
        showToast('저장 실패', 'error')
      } finally {
        testSaveBtn.disabled = false
        testSaveBtn.textContent = '저장'
      }
    }
  }

  // 출결 버튼 — 로컬 상태만 업데이트 (저장 버튼으로 저장)
  item.querySelectorAll('.att-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation()
      const row = btn.closest('.att-student-row')
      const sid = row.dataset.studentId
      const cid = row.dataset.classId
      const status = btn.dataset.status

      const currentStatus = attendanceCache[cid]?.[sid]?.status
      const newStatus = currentStatus === status ? '' : status

      row.querySelectorAll('.att-btn').forEach(b => b.classList.remove('active'))
      if (newStatus) btn.classList.add('active')

      if (!attendanceCache[cid]) attendanceCache[cid] = {}
      attendanceCache[cid][sid] = { ...attendanceCache[cid][sid], status: newStatus }

      updateSummaryPill(cid)
    }
  })

  // 과제 슬라이더 — 로컬 상태만 업데이트 (저장 버튼으로 저장)
  item.querySelectorAll('.homework-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
      e.stopPropagation()
      const cid = slider.dataset.classId
      const sid = slider.dataset.studentId
      const val = parseInt(slider.value)
      const valEl = document.getElementById(`hw-val-${cid}-${sid}`)
      if (valEl) valEl.textContent = val + '%'
      const color = val >= 80 ? 'var(--green)' : val >= 50 ? 'var(--yellow)' : val > 0 ? 'var(--red)' : 'var(--border)'
      slider.style.background = `linear-gradient(to right, ${color} ${val}%, var(--border) ${val}%)`
      if (!attendanceCache[cid]) attendanceCache[cid] = {}
      attendanceCache[cid][sid] = { ...attendanceCache[cid][sid], homework_pct: val }
    })

    slider.addEventListener('click', (e) => e.stopPropagation())
  })

  // 학생 개인 메모 — 클릭 버블링 방지 (저장 버튼으로 저장)
  item.querySelectorAll('.student-memo-input').forEach(input => {
    input.addEventListener('click', (e) => e.stopPropagation())
  })

  // 출결 저장 버튼
  const attSaveBtn = document.getElementById(`att-save-${classId}`)
  if (attSaveBtn) {
    attSaveBtn.onclick = async (e) => {
      e.stopPropagation()
      attSaveBtn.disabled = true
      attSaveBtn.textContent = '저장 중...'
      try {
        const students = cls.students || []
        for (const s of students) {
          const sid = typeof s === 'object' ? s.id : s
          const cached = attendanceCache[classId]?.[sid] || {}
          await upsertAttendance(currentDate, classId, sid, {
            status: cached.status || '',
            homework_pct: cached.homework_pct ?? 0,
          })
          const memoInput = document.getElementById(`smemo-${classId}-${sid}`)
          if (memoInput) {
            await upsertStudentMemo(currentDate, classId, sid, memoInput.value.trim())
          }
        }
        showToast('출결이 저장되었습니다', 'success')
      } catch (err) {
        showToast('저장 실패', 'error')
      } finally {
        attSaveBtn.disabled = false
        attSaveBtn.textContent = '저장'
      }
    }
  }
}

function updateSummaryPill(classId) {
  const cls = allClasses.find(c => c.id === classId)
  if (!cls) return
  const students = cls.students || []
  const { present, late, absent } = getSummary(classId, students)

  const item = document.querySelector(`.accordion-item[data-class-id="${classId}"]`)
  if (!item) return
  const pill = item.querySelector('.attendance-summary-pill')
  if (!pill) return

  pill.innerHTML = `
    <span class="att-present">${present}출</span>
    <span style="color:var(--border)">|</span>
    <span class="att-late">${late}지</span>
    <span style="color:var(--border)">|</span>
    <span class="att-absent">${absent}결</span>
  `
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
    // 외부 클릭 닫기
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
        renderWeekStrip()
        loadAttendanceData()
        closeCalendar()
      }
    })
  }

  render()
}
