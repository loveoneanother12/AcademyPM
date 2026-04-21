/**
 * 탭 1: 학생 관리
 */

import {
  getStudents,
  getClasses,
  insertRow,
  updateRow,
  deleteRow,
  getStudentAttendance,
  getStudentTestScores,
  getStudentMemos,
  upsertStudentToken,
} from '../api.js'
import QRCode from 'qrcode'
import { openModal, closeModal } from '../components/modal.js'
import { showToast } from '../components/toast.js'
import { isOnline } from '../lib/supabase.js'

let allStudents = []
let searchQuery = ''
let studentTab = 'all'
let filterGrade = ''
let filterSubjects = new Set()
let subjectAndMode = false
let _closeDropdowns = null

const SUBJECTS = ['수학', '영어', '국어', '과학']
const GRADES = ['중1', '중2', '중3', '고1', '고2', '고3']

function subjectBtnLabel() {
  if (filterSubjects.size === 0) return '과목'
  const arr = [...filterSubjects]
  return arr.length === 1 ? arr[0] : `${arr[0]} 외 ${arr.length - 1}`
}

export async function renderStudentsPage(container) {
  container.innerHTML = `
    <div class="sub-tab-bar">
      <button class="sub-tab-btn ${studentTab === 'all' ? 'active' : ''}" data-tab="all">전체</button>
      <button class="sub-tab-btn ${studentTab === 'high' ? 'active' : ''}" data-tab="high">고등</button>
      <button class="sub-tab-btn ${studentTab === 'middle' ? 'active' : ''}" data-tab="middle">중등</button>
    </div>
    <div class="search-wrap">
      <input class="search-input" id="student-search" type="text" placeholder="이름 또는 학교 검색..." value="${searchQuery}" />
      <div class="filter-row">
        <div class="filter-dropdown-wrap">
          <button class="filter-btn${filterGrade ? ' active' : ''}" id="grade-filter-btn">
            <span class="filter-label">${filterGrade || '학년'}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,3.5 5,6.5 8,3.5"/></svg>
          </button>
          <div class="filter-dropdown" id="grade-dropdown">
            <button class="filter-opt${!filterGrade ? ' selected' : ''}" data-value="">전체</button>
            ${GRADES.map(g => `<button class="filter-opt${filterGrade === g ? ' selected' : ''}" data-value="${g}">${g}</button>`).join('')}
          </div>
        </div>
        <div class="filter-dropdown-wrap">
          <button class="filter-btn${filterSubjects.size > 0 ? ' active' : ''}" id="subject-filter-btn">
            <span class="filter-label">${subjectBtnLabel()}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,3.5 5,6.5 8,3.5"/></svg>
          </button>
          <div class="filter-dropdown filter-dropdown--subject" id="subject-dropdown">
            <div class="subject-dd-left">
              <button class="filter-opt${filterSubjects.size === 0 ? ' selected' : ''}" data-value="">전체</button>
              ${SUBJECTS.map(s => `<button class="filter-opt${filterSubjects.has(s) ? ' selected' : ''}" data-value="${s}">${s}</button>`).join('')}
            </div>
            <div class="subject-dd-divider"></div>
            <div class="subject-dd-right">
              <div class="subject-dd-and-row">
                <span class="subject-dd-and-label">AND 조건 추가</span>
                <button class="toggle-btn${subjectAndMode ? ' active' : ''}" id="subject-and-toggle" data-active="${subjectAndMode}"><span class="toggle-knob"></span></button>
              </div>
              <div class="subject-dd-desc">AND 조건 추가 시 선택된 과목들을 동시에 수강하는 학생만 표시됩니다.</div>
              <button class="subject-dd-reset" id="subject-dd-reset-btn">초기화</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="students-list-wrap" class="page-wrap">
      <div class="loading-screen"><div class="loading-spinner"></div></div>
    </div>
    ${isOnline ? '' : '<div class="offline-banner">오프라인 모드 — 샘플 데이터</div>'}
  `

  // FAB 버튼
  document.getElementById('header-actions').innerHTML = ''
  let fab = document.querySelector('.fab')
  if (!fab) {
    fab = document.createElement('button')
    fab.className = 'fab'
    fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
    document.body.appendChild(fab)
  }
  fab.onclick = () => openAddStudentModal()

  // 서브 탭
  container.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      studentTab = btn.dataset.tab
      container.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === studentTab))
      refreshGradeDropdown()
      renderStudentList()
    })
  })

  // 검색
  container.querySelector('#student-search').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase()
    renderStudentList()
  })

  // 필터 드롭다운
  if (_closeDropdowns) document.removeEventListener('click', _closeDropdowns)
  _closeDropdowns = () => {
    document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('open'))
  }
  document.addEventListener('click', _closeDropdowns)

  function setupDropdownToggle(btnId, dropId) {
    const btn = container.querySelector(`#${btnId}`)
    const drop = container.querySelector(`#${dropId}`)
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = drop.classList.contains('open')
      document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('open'))
      if (!isOpen) drop.classList.add('open')
    })
  }

  function buildDropdownOptions(drop, btn, options, getCurrent, setCurrent, defaultLabel) {
    const current = getCurrent()
    drop.innerHTML = [
      `<button class="filter-opt${!current ? ' selected' : ''}" data-value="">전체</button>`,
      ...options.map(v => `<button class="filter-opt${current === v ? ' selected' : ''}" data-value="${v}">${v}</button>`)
    ].join('')
    drop.querySelectorAll('.filter-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation()
        setCurrent(opt.dataset.value)
        drop.classList.remove('open')
        btn.classList.toggle('active', !!opt.dataset.value)
        btn.querySelector('.filter-label').textContent = opt.dataset.value || defaultLabel
        drop.querySelectorAll('.filter-opt').forEach(o => o.classList.toggle('selected', o.dataset.value === opt.dataset.value))
        renderStudentList()
      })
    })
  }

  function refreshGradeDropdown() {
    const availableGrades = studentTab === 'high' ? ['고1', '고2', '고3']
      : studentTab === 'middle' ? ['중1', '중2', '중3']
      : GRADES
    if (filterGrade && !availableGrades.includes(filterGrade)) {
      filterGrade = ''
      const btn = container.querySelector('#grade-filter-btn')
      if (btn) {
        btn.classList.remove('active')
        btn.querySelector('.filter-label').textContent = '학년'
      }
    }
    const btn = container.querySelector('#grade-filter-btn')
    const drop = container.querySelector('#grade-dropdown')
    if (btn && drop) buildDropdownOptions(drop, btn, availableGrades, () => filterGrade, v => { filterGrade = v }, '학년')
  }

  setupDropdownToggle('grade-filter-btn', 'grade-dropdown')
  refreshGradeDropdown()
  setupSubjectDropdown()

  function setupSubjectDropdown() {
    const btn = container.querySelector('#subject-filter-btn')
    const drop = container.querySelector('#subject-dropdown')
    const andToggle = drop.querySelector('#subject-and-toggle')
    const resetBtn = drop.querySelector('#subject-dd-reset-btn')

    // 드롭다운 내부 클릭은 항상 버블링 차단 (외부 클릭으로만 닫힘)
    drop.addEventListener('click', e => e.stopPropagation())

    function updateBtn() {
      btn.classList.toggle('active', filterSubjects.size > 0)
      btn.querySelector('.filter-label').textContent = subjectBtnLabel()
    }

    function updateOpts() {
      drop.querySelectorAll('.filter-opt').forEach(opt => {
        if (opt.dataset.value === '') {
          opt.classList.toggle('selected', filterSubjects.size === 0)
        } else {
          opt.classList.toggle('selected', filterSubjects.has(opt.dataset.value))
        }
      })
    }

    // 버튼 클릭: 열기/닫기 토글
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = drop.classList.contains('open')
      document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('open'))
      if (!isOpen) drop.classList.add('open')
    })

    // 과목 옵션 클릭
    drop.querySelectorAll('.filter-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation()
        const val = opt.dataset.value
        if (!subjectAndMode) {
          filterSubjects.clear()
          if (val) filterSubjects.add(val)
          drop.classList.remove('open')
        } else {
          if (val === '') {
            filterSubjects.clear()
          } else {
            filterSubjects.has(val) ? filterSubjects.delete(val) : filterSubjects.add(val)
          }
        }
        updateBtn()
        updateOpts()
        renderStudentList()
      })
    })

    // AND 토글
    andToggle.addEventListener('click', (e) => {
      e.stopPropagation()
      subjectAndMode = !subjectAndMode
      andToggle.classList.toggle('active', subjectAndMode)
      andToggle.dataset.active = String(subjectAndMode)
      // AND OFF 전환 시 다중 선택 → 첫 번째만 유지
      if (!subjectAndMode && filterSubjects.size > 1) {
        const first = [...filterSubjects][0]
        filterSubjects.clear()
        filterSubjects.add(first)
        updateBtn()
        updateOpts()
        renderStudentList()
      }
    })

    // 초기화
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      filterSubjects.clear()
      subjectAndMode = false
      andToggle.classList.remove('active')
      andToggle.dataset.active = 'false'
      updateBtn()
      updateOpts()
      renderStudentList()
    })
  }

  await loadStudents()
}

async function loadStudents() {
  allStudents = await getStudents()
  renderStudentList()
}

function renderStudentList() {
  const wrap = document.getElementById('students-list-wrap')
  if (!wrap) return

  const HIGH_GRADES = ['고1', '고2', '고3']
  const MIDDLE_GRADES = ['중1', '중2', '중3']

  const filtered = allStudents.filter(s => {
    if (studentTab === 'high' && !HIGH_GRADES.includes(s.grade)) return false
    if (studentTab === 'middle' && !MIDDLE_GRADES.includes(s.grade)) return false
    if (filterGrade && s.grade !== filterGrade) return false
    if (filterSubjects.size > 0) {
      const subs = s.subjects || []
      if (subjectAndMode) {
        if (![...filterSubjects].every(sub => subs.includes(sub))) return false
      } else {
        if (![...filterSubjects].some(sub => subs.includes(sub))) return false
      }
    }
    return s.name.toLowerCase().includes(searchQuery) ||
      (s.school || '').toLowerCase().includes(searchQuery)
  })

  if (filtered.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👤</div>
        <div class="empty-state-text">${(searchQuery || filterGrade || filterSubjects.size > 0) ? '조건에 맞는 학생이 없습니다' : '등록된 학생이 없습니다'}</div>
        <div class="empty-state-sub">${(searchQuery || filterGrade || filterSubjects.size > 0) ? '검색어 또는 필터를 변경해 보세요' : '+ 버튼으로 학생을 추가하세요'}</div>
      </div>
    `
    return
  }

  wrap.innerHTML = `<div class="card-list">${filtered.map(s => studentCardHTML(s)).join('')}</div>`

  // 카드 클릭 이벤트
  wrap.querySelectorAll('.card[data-student-id]').forEach(card => {
    card.addEventListener('click', () => {
      const student = allStudents.find(s => s.id === card.dataset.studentId)
      if (student) openStudentDetailModal(student)
    })
  })
}

function studentCardHTML(s) {
  const avatarClass = s.status === 'inactive' ? 'inactive' : (s.gender === '남' ? 'male' : 'female')
  const initial = s.name.charAt(0)
  const subjects = s.subjects || []

  return `
    <div class="card student-card" data-student-id="${s.id}">
      <div class="student-avatar ${avatarClass}">${initial}</div>
      <div class="student-info">
        <div class="student-name-row">
          <span class="student-name">${s.name}</span>
          ${s.gender ? `<span class="badge ${s.gender === '남' ? 'badge-male' : 'badge-female'}">${s.gender}</span>` : ''}
          ${s.status === 'inactive' ? '<span class="badge badge-inactive">휴원</span>' : ''}
        </div>
        <div class="student-meta">${s.grade || ''} ${s.school ? '· ' + s.school : ''}</div>
        <div class="student-tags">
          ${subjects.map(sub => `<span class="subject-tag ${sub}">${sub}</span>`).join('')}
        </div>
      </div>
    </div>
  `
}

// ========================================
// 학생 상세 모달
// ========================================

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

async function openStudentDetailModal(student) {
  const today = new Date().toLocaleDateString('sv-KR')
  const fourWeeksAgo = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 28)
    return d.toLocaleDateString('sv-KR')
  })()

  const [classes, attendanceData, testScoreData, studentMemoData] = await Promise.all([
    getClasses(),
    getStudentAttendance(student.id),
    getStudentTestScores(student.id),
    getStudentMemos(null, null, student.id),
  ])

  // 이 학생이 수강 중인 수업 (활성 / 완강 분리)
  const myClasses = classes.filter(cls =>
    (cls.students || []).some(s => (typeof s === 'object' ? s.id : s) === student.id)
  )
  const activeClasses = myClasses.filter(cls => cls.is_completed !== true)
  const completedClasses = myClasses.filter(cls => cls.is_completed === true)

  // 수업별 데이터 계산 헬퍼
  function calcClassData(cls, idx) {
    const clsAtt = attendanceData.filter(r => r.class_id === cls.id && r.date >= fourWeeksAgo && r.date <= today && !r.is_na)
    const presentCount = clsAtt.filter(r => r.status === 'present').length
    const lateCount = clsAtt.filter(r => r.status === 'late').length
    const absentCount = clsAtt.filter(r => r.status === 'absent').length
    const totalCount = presentCount + lateCount + absentCount

    const hwRows = clsAtt.filter(r => r.status === 'present' || r.status === 'late')
    const hwAvg = hwRows.length > 0
      ? Math.round(hwRows.reduce((sum, r) => sum + (r.homework_pct || 0), 0) / hwRows.length)
      : null

    const clsScores = testScoreData
      .filter(r => r.class_id === cls.id && r.score !== null && r.score !== undefined)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-5)

    const clsMemos = studentMemoData
      .filter(r => r.class_id === cls.id && r.date >= fourWeeksAgo && r.date <= today && r.memo)
      .sort((a, b) => b.date.localeCompare(a.date))

    return { cls, idx, presentCount, lateCount, absentCount, totalCount, hwAvg, clsScores, clsMemos }
  }

  const classDataList = activeClasses.map((cls, i) => calcClassData(cls, i))
  const completedDataList = completedClasses.map((cls, i) => calcClassData(cls, activeClasses.length + i))

  const subjects = student.subjects || []
  const avatarClass = student.status === 'inactive' ? 'inactive' : (student.gender === '남' ? 'male' : 'female')

  const infoCard = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:16px;display:flex;align-items:center;gap:14px">
      <div class="student-avatar ${avatarClass}" style="width:52px;height:52px;border-radius:16px;font-size:20px;flex-shrink:0">${student.name.charAt(0)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:2px">${student.name}</div>
        <div style="font-size:13px;color:var(--text2)">${[student.grade, student.school].filter(Boolean).join(' · ')}</div>
        ${subjects.length > 0 ? `<div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">${subjects.map(sub => `<span class="subject-tag ${sub}">${sub}</span>`).join('')}</div>` : ''}
        ${student.student_phone ? `<div style="font-size:12px;color:var(--text3);font-family:'DM Mono',monospace;margin-top:4px">${student.student_phone}</div>` : ''}
      </div>
    </div>
  `

  const sectionHeader = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:14px;font-weight:700;color:var(--text)">수업별 현황</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:11px;color:var(--text3)">지각 반영</span>
        <button class="toggle-btn" id="late-toggle" data-active="false"><span class="toggle-knob"></span></button>
      </div>
    </div>
    <div id="late-note" style="display:none;font-size:11px;color:var(--text3);text-align:right;margin-top:-8px;margin-bottom:10px">지각 1회가 출석 0.5회로 계산됩니다</div>
  `

  function renderClassBox({ cls, idx, presentCount, lateCount, absentCount, totalCount, hwAvg, clsScores, clsMemos }) {
    const days = (cls.days || []).join(', ')
    const meta = [days, cls.time].filter(Boolean).join(' · ')
    const hwColor = hwAvg === null ? 'var(--text3)' : hwAvg >= 80 ? 'var(--green)' : hwAvg >= 50 ? 'var(--yellow)' : 'var(--red)'
    const initRate = totalCount > 0 ? Math.round((presentCount + lateCount) / totalCount * 100) : null
    const rateColor = initRate === null ? 'var(--text3)' : initRate >= 80 ? 'var(--green)' : initRate >= 50 ? 'var(--yellow)' : 'var(--red)'

    return `
      <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:${meta ? '6px' : '10px'}">
          <span style="font-size:14px;font-weight:700;color:var(--text)">${cls.name}</span>
          ${cls.subject ? `<span class="subject-tag ${cls.subject}" style="font-size:10px">${cls.subject}</span>` : ''}
        </div>
        ${meta ? `<div style="font-size:12px;color:var(--text3);margin-bottom:10px">${meta}</div>` : ''}
        <div class="detail-stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:10px">
          <div class="detail-stat-box">
            <div class="detail-stat-value" style="color:var(--green)">${presentCount}</div>
            <div class="detail-stat-label">출석</div>
          </div>
          <div class="detail-stat-box">
            <div class="detail-stat-value" style="color:var(--yellow)">${lateCount}</div>
            <div class="detail-stat-label">지각</div>
          </div>
          <div class="detail-stat-box">
            <div class="detail-stat-value" style="color:var(--red)">${absentCount}</div>
            <div class="detail-stat-label">결석</div>
          </div>
          <div class="detail-stat-box">
            <div class="detail-stat-value" style="color:var(--text)">${totalCount}</div>
            <div class="detail-stat-label">총수업</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;${clsScores.length > 0 ? 'margin-bottom:10px' : ''}">
          <div class="report-rate-box">
            <div id="att-rate-${idx}" class="report-rate-val" style="color:${rateColor}">${initRate !== null ? initRate + '%' : '--'}</div>
            <div class="report-stat-label">4주 출석률</div>
          </div>
          <div class="report-rate-box">
            <div class="report-rate-val" style="color:${hwColor}">${hwAvg !== null ? hwAvg + '%' : '--'}</div>
            <div class="report-stat-label">4주 과제 평균</div>
          </div>
        </div>
        ${clsScores.length > 0 ? `
          <div style="font-size:11px;color:var(--text3);margin-bottom:6px">최근 ${clsScores.length}회 테스트</div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 10px 4px;margin-bottom:8px">
            ${scoreChartSVG(clsScores)}
          </div>
          <div class="report-score-list">
            ${clsScores.map(s => `
              <div class="report-score-row">
                <div style="display:flex;flex-direction:column;gap:1px">
                  ${s.test_name ? `<span style="font-size:12px;color:var(--text)">${s.test_name}</span>` : ''}
                  <span class="report-score-date">${s.date}</span>
                </div>
                <span class="report-score-val">${s.score}점</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${clsMemos.length > 0 ? `
          <div style="font-size:11px;color:var(--text3);margin-top:10px;margin-bottom:6px">4주 개인 메모</div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px">
            ${clsMemos.map(m => {
              const hasContent = m.memo && m.memo.trim()
              return `
              <div style="display:flex;flex-direction:column;gap:2px">
                <span style="font-size:10px;color:var(--text3);font-family:'DM Mono',monospace">${m.date}</span>
                <span style="font-size:13px;color:${hasContent ? 'var(--text)' : 'var(--text3)'};line-height:1.5;white-space:pre-wrap">${hasContent ? m.memo : '(작성내용 없음)'}</span>
              </div>`
            }).join('<div style="height:1px;background:var(--border)"></div>')}
          </div>
        ` : ''}
      </div>
    `
  }

  const classBoxes = classDataList.length > 0
    ? classDataList.map(item => renderClassBox(item)).join('')
    : `<div style="font-size:13px;color:var(--text3);text-align:center;padding:16px 0">수강 중인 수업이 없습니다</div>`

  const completedBoxes = completedDataList.length > 0
    ? `
      <div style="height:2px;background:var(--border);margin:20px 0 16px;border-radius:1px"></div>
      <div style="font-size:14px;font-weight:700;color:var(--text3);margin-bottom:12px">종료된 수업</div>
      ${completedDataList.map(item => renderClassBox(item)).join('')}
    `
    : ''

  openModal(`
    <h2 class="modal-title">학생 상세</h2>
    ${infoCard}
    ${sectionHeader}
    ${classBoxes}
    ${completedBoxes}
    <button class="btn btn-primary" id="detail-edit-btn" style="width:100%;margin-top:8px">수정하기</button>
    <button class="btn btn-secondary" id="detail-link-btn" style="width:100%;margin-top:8px">링크 / QR 생성</button>
    <div id="detail-link-panel" style="display:none;margin-top:12px"></div>
  `)

  // 지각 반영 토글
  let lateReflected = false
  const lateToggle = document.getElementById('late-toggle')
  const lateNote = document.getElementById('late-note')

  function updateAttRates() {
    ;[...classDataList, ...completedDataList].forEach(({ presentCount, lateCount, totalCount, idx }) => {
      const el = document.getElementById('att-rate-' + idx)
      if (!el) return
      if (totalCount === 0) {
        el.textContent = '--'
        el.style.color = 'var(--text3)'
      } else {
        const rate = lateReflected
          ? Math.round((presentCount + lateCount * 0.5) / totalCount * 100)
          : Math.round((presentCount + lateCount) / totalCount * 100)
        el.textContent = rate + '%'
        el.style.color = rate >= 80 ? 'var(--green)' : rate >= 50 ? 'var(--yellow)' : 'var(--red)'
      }
    })
    lateNote.style.display = lateReflected ? '' : 'none'
  }

  lateToggle.onclick = () => {
    lateReflected = !lateReflected
    lateToggle.dataset.active = String(lateReflected)
    lateToggle.classList.toggle('active', lateReflected)
    updateAttRates()
  }

  document.getElementById('detail-edit-btn').onclick = () => openEditStudentModal(student)

  document.getElementById('detail-link-btn').onclick = () => {
    const panel = document.getElementById('detail-link-panel')
    if (panel.style.display !== 'none') { panel.style.display = 'none'; return }

    const today = new Date().toISOString().slice(0, 10)
    const oneMonthAgo = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)

    panel.style.display = 'block'
    panel.innerHTML = `
      <div class="link-gen-panel">
        <div class="form-label" style="margin-bottom:8px">데이터 기간</div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
          <input type="date" class="form-input" id="lp-from" value="${oneMonthAgo}" style="flex:1" />
          <span style="color:var(--text3);font-size:13px">~</span>
          <input type="date" class="form-input" id="lp-to" value="${today}" style="flex:1" />
        </div>
        <div class="form-label" style="margin-bottom:8px">링크 유효기간</div>
        <div class="link-expiry-options" id="lp-expiry">
          <button class="expiry-opt selected" data-days="7">1주일</button>
          <button class="expiry-opt" data-days="30">1개월</button>
          <button class="expiry-opt" data-days="90">3개월</button>
          <button class="expiry-opt" data-days="0">무기한</button>
        </div>
        <button class="btn btn-primary" id="lp-generate" style="width:100%;margin-top:12px">링크 생성</button>
        <div id="lp-result" style="display:none;margin-top:12px"></div>
      </div>
    `

    panel.querySelectorAll('.expiry-opt').forEach(btn => {
      btn.onclick = () => {
        panel.querySelectorAll('.expiry-opt').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
      }
    })

    panel.querySelector('#lp-generate').onclick = async () => {
      const from = document.getElementById('lp-from').value
      const to = document.getElementById('lp-to').value
      if (!from || !to || from > to) {
        showToast('기간을 올바르게 설정하세요', 'error')
        return
      }
      const days = parseInt(panel.querySelector('.expiry-opt.selected')?.dataset.days || '30')
      const expiresAt = days === 0
        ? new Date('2099-12-31').toISOString()
        : new Date(Date.now() + days * 864e5).toISOString()

      const token = crypto.randomUUID()
      const generateBtn = panel.querySelector('#lp-generate')
      generateBtn.disabled = true
      generateBtn.textContent = '생성 중...'

      try {
        await upsertStudentToken(student.id, token, expiresAt, from, to)
        const url = `${location.origin}${location.pathname}?name=${encodeURIComponent(student.name)}&report=${token}`
        const qrDataUrl = await QRCode.toDataURL(url, { width: 180, margin: 1, color: { dark: '#ffffff', light: '#1c1c1f' } })

        const resultEl = panel.querySelector('#lp-result')
        resultEl.style.display = 'block'
        resultEl.innerHTML = `
          <div class="link-result-box">
            <img src="${qrDataUrl}" alt="QR Code" style="width:150px;height:150px;border-radius:10px;display:block;margin:0 auto 12px" />
            <div class="link-url-wrap">
              <div class="link-url-text" id="lp-url">${url}</div>
              <button class="btn btn-secondary" id="lp-copy" style="font-size:12px;padding:6px 12px;flex-shrink:0">복사</button>
            </div>
            <a id="lp-qr-download" href="${qrDataUrl}" download="${student.name}_QR.png" class="btn btn-secondary" style="display:block;width:100%;text-align:center;margin-top:8px;font-size:12px;box-sizing:border-box">QR코드 이미지 저장</a>
            <div style="font-size:11px;color:var(--text3);text-align:center;margin-top:6px">
              ${days === 0 ? '무기한' : `${days}일 후`} 만료 · ${from} ~ ${to}
            </div>
          </div>
        `
        resultEl.querySelector('#lp-copy').onclick = () => {
          navigator.clipboard.writeText(url).then(() => showToast('링크 복사됨', 'success'))
        }
      } catch (e) {
        showToast('생성 실패: ' + e.message, 'error')
      } finally {
        generateBtn.disabled = false
        generateBtn.textContent = '링크 생성'
      }
    }
  }
}

// ========================================
// 학생 추가 모달
// ========================================

function openAddStudentModal() {
  openModal(buildStudentFormHTML('add'), null)
  setupStudentForm('add', null)
}

function openEditStudentModal(student) {
  openModal(buildStudentFormHTML('edit', student), null)
  setupStudentForm('edit', student)
}

function buildStudentFormHTML(mode, student = null) {
  const s = student || {}
  const selectedSubjects = s.subjects || []

  return `
    <h2 class="modal-title">${mode === 'add' ? '학생 추가' : '학생 수정'}</h2>
    <div class="form-group">
      <label class="form-label">이름 *</label>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="form-input" id="sf-name" type="text" placeholder="이름" value="${s.name || ''}" style="flex:0 0 70%" />
        <button class="gender-btn ${s.gender === '남' ? 'selected' : ''}" data-gender="남" style="flex:1;padding:0;height:42px">남</button>
        <button class="gender-btn ${s.gender === '여' ? 'selected' : ''}" data-gender="여" style="flex:1;padding:0;height:42px">여</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">학년</label>
        <select class="form-select" id="sf-grade">
          <option value="">선택</option>
          ${GRADES.map(g => `<option value="${g}" ${s.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">학교</label>
        <input class="form-input" id="sf-school" type="text" placeholder="학교명" value="${s.school || ''}" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">수강 과목</label>
      <div class="subject-selector" id="sf-subjects">
        ${SUBJECTS.map(sub => `
          <button class="subject-toggle ${selectedSubjects.includes(sub) ? 'selected' : ''}" data-subject="${sub}">${sub}</button>
        `).join('')}
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">학부모 연락처</label>
        <input class="form-input" id="sf-parent-phone" type="tel" placeholder="010-0000-0000" value="${s.parent_phone || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">학생 연락처</label>
        <input class="form-input" id="sf-student-phone" type="tel" placeholder="010-0000-0000" value="${s.student_phone || ''}" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">비고</label>
      <textarea class="form-textarea" id="sf-notes" placeholder="메모...">${s.notes || ''}</textarea>
    </div>
    <input type="hidden" id="sf-teacher" value="${s.teacher || ''}" />
    <input type="hidden" id="sf-status" value="${s.status || 'active'}" />
    <div class="form-actions">
      <button class="btn btn-secondary" id="sf-cancel">취소</button>
      <button class="btn btn-primary" id="sf-submit">${mode === 'add' ? '추가' : '저장'}</button>
    </div>
  `
}

function setupStudentForm(mode, student) {
  let selectedGender = student?.gender || ''

  // 성별 버튼
  document.querySelectorAll('.gender-btn').forEach(btn => {
    btn.onclick = () => {
      selectedGender = btn.dataset.gender
      document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
    }
  })

  // 과목 토글
  document.querySelectorAll('.subject-toggle').forEach(btn => {
    btn.onclick = () => btn.classList.toggle('selected')
  })

  document.getElementById('sf-cancel').onclick = closeModal

  document.getElementById('sf-submit').onclick = async () => {
    const name = document.getElementById('sf-name').value.trim()
    if (!name) { showToast('이름을 입력하세요', 'error'); return }

    const selectedSubjects = [...document.querySelectorAll('.subject-toggle.selected')]
      .map(b => b.dataset.subject)

    const data = {
      name,
      gender: selectedGender,
      grade: document.getElementById('sf-grade').value,
      school: document.getElementById('sf-school').value.trim(),
      subjects: selectedSubjects,
      teacher: document.getElementById('sf-teacher').value.trim(),
      parent_phone: document.getElementById('sf-parent-phone').value.trim(),
      student_phone: document.getElementById('sf-student-phone').value.trim(),
      status: document.getElementById('sf-status').value,
      notes: document.getElementById('sf-notes').value.trim(),
    }

    const btn = document.getElementById('sf-submit')
    btn.disabled = true
    btn.textContent = '저장 중...'

    try {
      if (mode === 'add') {
        await insertRow('students', data)
        showToast('학생이 추가되었습니다', 'success')
      } else {
        await updateRow('students', student.id, data)
        showToast('저장되었습니다', 'success')
      }
      closeModal()
      await loadStudents()
    } catch (e) {
      showToast('저장 실패: ' + e.message, 'error')
      btn.disabled = false
      btn.textContent = mode === 'add' ? '추가' : '저장'
    }
  }
}

async function confirmDeleteStudent(student) {
  openModal(`
    <h2 class="modal-title">학생 삭제</h2>
    <p style="font-size:14px;color:var(--text2);margin-bottom:20px;line-height:1.6">
      <strong style="color:var(--text)">${student.name}</strong> 학생을 삭제하시겠습니까?<br>
      관련 출결 기록도 모두 삭제됩니다.
    </p>
    <div class="form-actions">
      <button class="btn btn-secondary" id="del-cancel">취소</button>
      <button class="btn btn-danger" id="del-confirm">삭제</button>
    </div>
  `)

  document.getElementById('del-cancel').onclick = closeModal
  document.getElementById('del-confirm').onclick = async () => {
    try {
      await deleteRow('students', student.id)
      showToast('삭제되었습니다', 'success')
      closeModal()
      await loadStudents()
    } catch (e) {
      showToast('삭제 실패: ' + e.message, 'error')
    }
  }
}
