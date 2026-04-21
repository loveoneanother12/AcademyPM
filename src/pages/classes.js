/**
 * 탭 2: 수업 관리
 */

import {
  getClasses,
  getStudents,
  insertRow,
  updateRow,
  deleteRow,
  syncClassStudents,
  getAllClassMemos,
} from '../api.js'
import { openModal, closeModal } from '../components/modal.js'
import { openOnedayClassModal, renderOnedayCalendar } from './attendance.js'
import { showToast } from '../components/toast.js'
import { isOnline } from '../lib/supabase.js'

let allClasses = []
let allStudents = []
let searchQuery = ''
let classTab = 'regular'
let onedayPreset = null   // null | '1w' | '1m' | '2m' | '3m' | 'custom'
let onedayFrom = ''
let onedayTo = ''
let filterGrade = ''
let filterSubjects = new Set()
let subjectAndMode = false
let filterDays = new Set()
let dayAndMode = false
let showCompleted = false
let _closeDropdowns = null

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const SUBJECTS = ['수학', '영어', '국어', '과학']
const GRADES = ['중1', '중2', '중3', '고1', '고2', '고3']
const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function subjectBtnLabel() {
  if (filterSubjects.size === 0) return '과목'
  const arr = [...filterSubjects]
  return arr.length === 1 ? arr[0] : `${arr[0]} 외 ${arr.length - 1}`
}

function dayBtnLabel() {
  if (filterDays.size === 0) return '요일'
  const arr = [...filterDays]
  return arr.length === 1 ? arr[0] : `${arr[0]} 외 ${arr.length - 1}`
}

const PRESET_LABELS = { '1w': '1주일', '1m': '1개월', '2m': '2개월', '3m': '3개월' }

function periodBtnLabel() {
  if (!onedayPreset) return '기간'
  if (onedayPreset === 'custom') {
    if (onedayFrom && onedayTo) return `${onedayFrom.slice(5)} ~ ${onedayTo.slice(5)}`
    return '직접 설정'
  }
  return PRESET_LABELS[onedayPreset]
}

function computeFrom(preset) {
  const d = new Date()
  if (preset === '1w') d.setDate(d.getDate() - 7)
  else if (preset === '1m') d.setMonth(d.getMonth() - 1)
  else if (preset === '2m') d.setMonth(d.getMonth() - 2)
  else if (preset === '3m') d.setMonth(d.getMonth() - 3)
  return d.toLocaleDateString('sv-KR')
}

export async function renderClassesPage(container) {
  container.innerHTML = `
    <div class="sub-tab-bar">
      <button class="sub-tab-btn ${classTab === 'regular' ? 'active' : ''}" data-tab="regular">정규수업</button>
      <button class="sub-tab-btn ${classTab === 'oneday' ? 'active' : ''}" data-tab="oneday">단회성 / 보강</button>
    </div>
    <div class="search-wrap">
      <input class="search-input" id="class-search" type="text" placeholder="수업명 또는 선생님 검색..." value="${searchQuery}" />
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
          <button class="filter-btn${filterSubjects.size > 0 ? ' active' : ''}" id="cls-subject-filter-btn">
            <span class="filter-label">${subjectBtnLabel()}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,3.5 5,6.5 8,3.5"/></svg>
          </button>
          <div class="filter-dropdown filter-dropdown--subject" id="cls-subject-dropdown">
            <div class="subject-dd-left">
              <button class="filter-opt${filterSubjects.size === 0 ? ' selected' : ''}" data-value="">전체</button>
              ${SUBJECTS.map(s => `<button class="filter-opt${filterSubjects.has(s) ? ' selected' : ''}" data-value="${s}">${s}</button>`).join('')}
            </div>
            <div class="subject-dd-divider"></div>
            <div class="subject-dd-right">
              <div class="subject-dd-and-row">
                <span class="subject-dd-and-label">AND 조건 추가</span>
                <button class="toggle-btn${subjectAndMode ? ' active' : ''}" id="cls-subject-and-toggle" data-active="${subjectAndMode}"><span class="toggle-knob"></span></button>
              </div>
              <div class="subject-dd-desc">AND 조건 추가 시 선택된 과목들을 동시에 수강하는 학생만 표시됩니다.</div>
              <button class="subject-dd-reset" id="cls-subject-dd-reset-btn">초기화</button>
            </div>
          </div>
        </div>
        <div class="filter-dropdown-wrap">
          <button class="filter-btn${filterDays.size > 0 ? ' active' : ''}" id="day-filter-btn">
            <span class="filter-label">${dayBtnLabel()}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,3.5 5,6.5 8,3.5"/></svg>
          </button>
          <div class="filter-dropdown filter-dropdown--subject" id="day-dropdown">
            <div class="subject-dd-left">
              <button class="filter-opt${filterDays.size === 0 ? ' selected' : ''}" data-value="">전체</button>
              ${DAYS.map(d => `<button class="filter-opt${filterDays.has(d) ? ' selected' : ''}" data-value="${d}">${d}요일</button>`).join('')}
            </div>
            <div class="subject-dd-divider"></div>
            <div class="subject-dd-right">
              <div class="subject-dd-and-row">
                <span class="subject-dd-and-label">AND 조건 추가</span>
                <button class="toggle-btn${dayAndMode ? ' active' : ''}" id="day-and-toggle" data-active="${dayAndMode}"><span class="toggle-knob"></span></button>
              </div>
              <div class="subject-dd-desc">AND 조건 추가 시 선택된 요일이 모두 포함된 수업만 표시됩니다.</div>
              <button class="subject-dd-reset" id="day-dd-reset-btn">초기화</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="classes-list-wrap" class="page-wrap">
      <div class="loading-screen"><div class="loading-spinner"></div></div>
    </div>
    ${isOnline ? '' : '<div class="offline-banner">오프라인 모드 — 샘플 데이터</div>'}
  `

  // FAB
  let fab = document.querySelector('.fab')
  if (!fab) {
    fab = document.createElement('button')
    fab.className = 'fab'
    fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
    document.body.appendChild(fab)
  }
  function openClassTypeModal() {
    openModal(`
      <h2 class="modal-title">수업 추가</h2>
      <div style="display:flex;gap:12px;padding:8px 0 4px">
        <button class="btn btn-primary" id="type-regular" style="flex:1;padding:16px;font-size:15px">정규수업 추가</button>
        <button class="btn" id="type-oneday" style="flex:1;padding:16px;font-size:15px;background:#5c1e32;border:1px solid #7a2840;color:#e8c0cc">단회성 / 보강 추가</button>
      </div>
    `, null)
    document.getElementById('type-regular').onclick = () => {
      closeModal()
      openAddClassModal()
    }
    document.getElementById('type-oneday').onclick = () => {
      closeModal()
      openOnedayClassModal(null, {
        students: allStudents,
        onSuccess: loadClasses,
      })
    }
  }

  fab.onclick = () => openClassTypeModal()

  function updateTabClass() {
    container.classList.toggle('oneday-mode', classTab === 'oneday')
    const filterRow = container.querySelector('.filter-row')
    if (!filterRow) return
    const existing = filterRow.querySelector('#period-filter-wrap')
    if (classTab === 'oneday') {
      if (!existing) {
        const wrap = document.createElement('div')
        wrap.className = 'filter-dropdown-wrap period-filter-wrap-right'
        wrap.id = 'period-filter-wrap'
        wrap.innerHTML = `
          <button class="filter-btn${onedayPreset ? ' active' : ''}" id="period-filter-btn">
            <span class="filter-label">${periodBtnLabel()}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,3.5 5,6.5 8,3.5"/></svg>
          </button>
          <div class="filter-dropdown filter-dropdown--period" id="period-dropdown">
            <button class="filter-opt${!onedayPreset ? ' selected' : ''}" data-preset="">전체</button>
            ${Object.entries(PRESET_LABELS).map(([p, label]) =>
              `<button class="filter-opt${onedayPreset === p ? ' selected' : ''}" data-preset="${p}">${label}</button>`
            ).join('')}
            <button class="filter-opt${onedayPreset === 'custom' ? ' selected' : ''}" data-preset="custom">직접 설정</button>
          </div>
        `
        filterRow.appendChild(wrap)
        bindPeriodDropdown(wrap)
      }
    } else {
      if (existing) existing.remove()
      onedayPreset = null; onedayFrom = ''; onedayTo = ''
    }
  }
  updateTabClass()

  container.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      classTab = btn.dataset.tab
      container.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === classTab))
      updateTabClass()
      renderClassList()
    })
  })

  container.querySelector('#class-search').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase()
    renderClassList()
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
      ...options.map(([val, label]) => `<button class="filter-opt${current === val ? ' selected' : ''}" data-value="${val}">${label}</button>`)
    ].join('')
    drop.querySelectorAll('.filter-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation()
        setCurrent(opt.dataset.value)
        drop.classList.remove('open')
        btn.classList.toggle('active', !!opt.dataset.value)
        btn.querySelector('.filter-label').textContent = opt.dataset.value ? opt.textContent : defaultLabel
        drop.querySelectorAll('.filter-opt').forEach(o => o.classList.toggle('selected', o.dataset.value === opt.dataset.value))
        renderClassList()
      })
    })
  }

  setupDropdownToggle('grade-filter-btn', 'grade-dropdown')
  buildDropdownOptions(
    container.querySelector('#grade-dropdown'),
    container.querySelector('#grade-filter-btn'),
    GRADES.map(g => [g, g]),
    () => filterGrade, v => { filterGrade = v }, '학년'
  )

  // 요일 드롭다운 (AND 다중선택)
  const dayBtn = container.querySelector('#day-filter-btn')
  const dayDrop = container.querySelector('#day-dropdown')
  const dayAndToggle = dayDrop.querySelector('#day-and-toggle')
  const dayResetBtn = dayDrop.querySelector('#day-dd-reset-btn')

  dayDrop.addEventListener('click', e => e.stopPropagation())

  function updateDayBtn() {
    dayBtn.classList.toggle('active', filterDays.size > 0)
    dayBtn.querySelector('.filter-label').textContent = dayBtnLabel()
  }
  function updateDayOpts() {
    dayDrop.querySelectorAll('.filter-opt').forEach(opt => {
      if (opt.dataset.value === '') {
        opt.classList.toggle('selected', filterDays.size === 0)
      } else {
        opt.classList.toggle('selected', filterDays.has(opt.dataset.value))
      }
    })
  }

  dayBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    const isOpen = dayDrop.classList.contains('open')
    document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('open'))
    if (!isOpen) dayDrop.classList.add('open')
  })

  dayDrop.querySelectorAll('.filter-opt').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation()
      const val = opt.dataset.value
      if (!dayAndMode) {
        filterDays.clear()
        if (val) filterDays.add(val)
        dayDrop.classList.remove('open')
      } else {
        if (val === '') {
          filterDays.clear()
        } else {
          filterDays.has(val) ? filterDays.delete(val) : filterDays.add(val)
        }
      }
      updateDayBtn()
      updateDayOpts()
      renderClassList()
    })
  })

  dayAndToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    dayAndMode = !dayAndMode
    dayAndToggle.classList.toggle('active', dayAndMode)
    dayAndToggle.dataset.active = String(dayAndMode)
    if (!dayAndMode && filterDays.size > 1) {
      const first = [...filterDays][0]
      filterDays.clear()
      filterDays.add(first)
      updateDayBtn()
      updateDayOpts()
      renderClassList()
    }
  })

  dayResetBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    filterDays.clear()
    dayAndMode = false
    dayAndToggle.classList.remove('active')
    dayAndToggle.dataset.active = 'false'
    updateDayBtn()
    updateDayOpts()
    renderClassList()
  })

  // 과목 드롭다운 (AND 다중선택)
  const subjBtn = container.querySelector('#cls-subject-filter-btn')
  const subjDrop = container.querySelector('#cls-subject-dropdown')
  const subjAndToggle = subjDrop.querySelector('#cls-subject-and-toggle')
  const subjResetBtn = subjDrop.querySelector('#cls-subject-dd-reset-btn')

  subjDrop.addEventListener('click', e => e.stopPropagation())

  function updateSubjBtn() {
    subjBtn.classList.toggle('active', filterSubjects.size > 0)
    subjBtn.querySelector('.filter-label').textContent = subjectBtnLabel()
  }
  function updateSubjOpts() {
    subjDrop.querySelectorAll('.filter-opt').forEach(opt => {
      if (opt.dataset.value === '') {
        opt.classList.toggle('selected', filterSubjects.size === 0)
      } else {
        opt.classList.toggle('selected', filterSubjects.has(opt.dataset.value))
      }
    })
  }

  subjBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    const isOpen = subjDrop.classList.contains('open')
    document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('open'))
    if (!isOpen) subjDrop.classList.add('open')
  })

  subjDrop.querySelectorAll('.filter-opt').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation()
      const val = opt.dataset.value
      if (!subjectAndMode) {
        filterSubjects.clear()
        if (val) filterSubjects.add(val)
        subjDrop.classList.remove('open')
      } else {
        if (val === '') {
          filterSubjects.clear()
        } else {
          filterSubjects.has(val) ? filterSubjects.delete(val) : filterSubjects.add(val)
        }
      }
      updateSubjBtn()
      updateSubjOpts()
      renderClassList()
    })
  })

  subjAndToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    subjectAndMode = !subjectAndMode
    subjAndToggle.classList.toggle('active', subjectAndMode)
    subjAndToggle.dataset.active = String(subjectAndMode)
    if (!subjectAndMode && filterSubjects.size > 1) {
      const first = [...filterSubjects][0]
      filterSubjects.clear()
      filterSubjects.add(first)
      updateSubjBtn()
      updateSubjOpts()
      renderClassList()
    }
  })

  subjResetBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    filterSubjects.clear()
    subjectAndMode = false
    subjAndToggle.classList.remove('active')
    subjAndToggle.dataset.active = 'false'
    updateSubjBtn()
    updateSubjOpts()
    renderClassList()
  })

  await loadClasses()
}

function bindPeriodDropdown(wrap) {
  const btn = wrap.querySelector('#period-filter-btn')
  const drop = wrap.querySelector('#period-dropdown')

  drop.addEventListener('click', e => e.stopPropagation())

  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const isOpen = drop.classList.contains('open')
    document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('open'))
    if (!isOpen) drop.classList.add('open')
  })

  function updatePeriodBtn() {
    btn.classList.toggle('active', !!onedayPreset)
    btn.querySelector('.filter-label').textContent = periodBtnLabel()
  }

  function updatePeriodOpts() {
    drop.querySelectorAll('.filter-opt').forEach(opt => {
      opt.classList.toggle('selected', (opt.dataset.preset || '') === (onedayPreset || ''))
    })
  }

  drop.querySelectorAll('.filter-opt').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation()
      const p = opt.dataset.preset
      if (p === 'custom') {
        onedayPreset = 'custom'
        drop.classList.remove('open')
        updatePeriodBtn()
        updatePeriodOpts()
        openPeriodCustomPicker()
        return
      }
      onedayPreset = p || null
      onedayFrom = ''; onedayTo = ''
      drop.classList.remove('open')
      updatePeriodBtn()
      updatePeriodOpts()
      renderClassList()
    })
  })
}

function openPeriodCustomPicker() {
  const today = new Date().toLocaleDateString('sv-KR')
  const calId = 'period-custom-cal'
  let existing = document.getElementById(calId)
  if (!existing) {
    existing = document.createElement('div')
    existing.id = calId
    existing.className = 'od-calendar-popup'
    document.body.appendChild(existing)
  }

  const btn = document.getElementById('period-filter-btn')
  const rect = btn ? btn.getBoundingClientRect() : { bottom: 100, left: 16 }
  existing.style.cssText = `position:fixed;top:${rect.bottom + 6}px;left:${rect.left}px;z-index:200`
  existing.classList.remove('hidden')

  let calTarget = 'from'

  function renderCustomUI() {
    existing.innerHTML = `
      <div class="od-custom-header">
        <button class="od-filter-date-btn${onedayFrom ? ' has-value' : ''}" id="pc-from-btn">${onedayFrom || '시작일'}</button>
        <span class="od-filter-sep">~</span>
        <button class="od-filter-date-btn${onedayTo ? ' has-value' : ''}" id="pc-to-btn">${onedayTo || '종료일'}</button>
      </div>
      <div id="pc-cal-inner"></div>
    `
    existing.querySelector('#pc-from-btn').addEventListener('click', (e) => { e.stopPropagation(); calTarget = 'from'; renderCal() })
    existing.querySelector('#pc-to-btn').addEventListener('click', (e) => { e.stopPropagation(); calTarget = 'to'; renderCal() })
    renderCal()
  }

  function renderCal() {
    const initDate = calTarget === 'from' ? (onedayFrom || today) : (onedayTo || today)
    const opts = calTarget === 'from' ? (onedayTo ? { maxDate: onedayTo } : {}) : (onedayFrom ? { minDate: onedayFrom } : {})
    renderOnedayCalendar('pc-cal-inner', initDate, (d) => {
      if (calTarget === 'from') { onedayFrom = d; calTarget = 'to' }
      else { onedayTo = d }
      renderCustomUI()
      if (onedayFrom && onedayTo) {
        existing.classList.add('hidden')
        document.getElementById('period-filter-btn')?.querySelector('.filter-label') &&
          (document.getElementById('period-filter-btn').querySelector('.filter-label').textContent = periodBtnLabel())
        document.getElementById('period-filter-btn')?.classList.add('active')
        renderClassList()
      }
    }, opts)
  }

  renderCustomUI()
  setTimeout(() => {
    document.addEventListener('click', function closeCal(e) {
      if (!existing.contains(e.target) && e.target.id !== 'period-filter-btn') {
        existing.classList.add('hidden')
        document.removeEventListener('click', closeCal)
      }
    })
  }, 50)
}

async function autoCompleteExpiredClasses(classes) {
  const today = new Date().toLocaleDateString('sv-KR')
  const toComplete = classes.filter(cls =>
    !cls.is_oneday && cls.end_date && today > cls.end_date && cls.is_completed !== true
  )
  if (toComplete.length === 0) return classes
  await Promise.all(toComplete.map(cls => updateRow('classes', cls.id, { is_completed: true })))
  return classes.map(cls =>
    toComplete.some(c => c.id === cls.id) ? { ...cls, is_completed: true } : cls
  )
}

async function loadClasses() {
  let [classes, students] = await Promise.all([getClasses(), getStudents()])
  allClasses = await autoCompleteExpiredClasses(classes)
  allStudents = students
  renderClassList()
}

function renderClassList() {
  const wrap = document.getElementById('classes-list-wrap')
  if (!wrap) return

  if (allClasses.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-text">등록된 수업이 없습니다</div>
        <div class="empty-state-sub">+ 버튼으로 수업을 추가하세요</div>
      </div>
    `
    return
  }

  const isOneday = classTab === 'oneday'
  const filtered = allClasses.filter(cls =>
    (isOneday ? cls.is_oneday : !cls.is_oneday) &&
    (!filterGrade || cls.grade === filterGrade) &&
    (filterSubjects.size === 0 || (subjectAndMode
      ? [...filterSubjects].every(sub => cls.subject === sub)
      : [...filterSubjects].some(sub => cls.subject === sub))) &&
    (filterDays.size === 0 || (dayAndMode
      ? [...filterDays].every(d => (cls.days || []).includes(d))
      : [...filterDays].some(d => (cls.days || []).includes(d)))) &&
    (
      cls.name.toLowerCase().includes(searchQuery) ||
      (cls.teacher || '').toLowerCase().includes(searchQuery) ||
      (cls.subject || '').toLowerCase().includes(searchQuery)
    )
  )

  if (filtered.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-text">${(searchQuery || filterGrade || filterSubjects.size > 0 || filterDays.size > 0) ? '조건에 맞는 수업이 없습니다' : (isOneday ? '등록된 보강 수업이 없습니다' : '등록된 수업이 없습니다')}</div>
      </div>
    `
    return
  }

  if (isOneday) {
    const today = new Date().toLocaleDateString('sv-KR')
    const sorted = [...filtered].sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''))

    let dateFiltered = sorted
    if (onedayPreset && onedayPreset !== 'custom') {
      const from = computeFrom(onedayPreset)
      dateFiltered = sorted.filter(cls => (cls.start_date || '') >= from && (cls.start_date || '') <= today)
    } else if (onedayPreset === 'custom' && onedayFrom && onedayTo) {
      dateFiltered = sorted.filter(cls => (cls.start_date || '') >= onedayFrom && (cls.start_date || '') <= onedayTo)
    }

    wrap.innerHTML = dateFiltered.length > 0
      ? `<div class="card-list">${dateFiltered.map(cls => onedayCardHTML(cls)).join('')}</div>`
      : `<div class="empty-state"><div class="empty-state-icon">📚</div><div class="empty-state-text">해당 기간에 보강 수업이 없습니다</div></div>`

    // 카드 클릭
    wrap.querySelectorAll('.card[data-class-id]').forEach(card => {
      card.addEventListener('click', () => {
        const cls = dateFiltered.find(c => c.id === card.dataset.classId)
        if (cls) openClassDetailModal(cls)
      })
    })
  } else {
    const active = filtered.filter(cls => cls.is_completed !== true)
    const completed = filtered.filter(cls => cls.is_completed === true)

    if (active.length === 0 && completed.length > 0) showCompleted = true

    let html = ''
    if (active.length > 0) {
      html += `<div class="card-list">${active.map(cls => classCardHTML(cls)).join('')}</div>`
    }
    if (completed.length > 0) {
      html += `<button class="completed-toggle-btn" id="completed-toggle-btn">${showCompleted ? '지난 수업 접기 ▲' : '지난 수업 보기 ▼'}</button>`
      if (showCompleted) {
        html += `
          <div class="completed-section-divider"></div>
          <div class="completed-section-label">종료된 수업</div>
          <div class="card-list">${completed.map(cls => classCardHTML(cls, true)).join('')}</div>
        `
      }
    }

    wrap.innerHTML = html

    wrap.querySelector('#completed-toggle-btn')?.addEventListener('click', () => {
      showCompleted = !showCompleted
      renderClassList()
    })

    wrap.querySelectorAll('.card[data-class-id]').forEach(card => {
      card.addEventListener('click', () => {
        const cls = [...active, ...completed].find(c => c.id === card.dataset.classId)
        if (cls) openClassDetailModal(cls)
      })
    })
  }
}

function classCardHTML(cls, isCompletedSection = false) {
  const students = cls.students || []
  const days = cls.days || []

  return `
    <div class="card${cls.start_date && cls.end_date ? ' card--timelimit' : ' card--regular'}${isCompletedSection ? ' card--completed' : ''}" data-class-id="${cls.id}">
      <div class="class-card-header">
        <div>
          <div class="class-card-name">${cls.name}</div>
          <div class="class-card-meta">${cls.teacher ? cls.teacher + ' · ' : ''}${cls.grade || ''}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span class="subject-tag ${cls.subject || ''}">${cls.subject || ''}</span>
          ${isCompletedSection ? '<span class="completed-badge">완강</span>' : ''}
        </div>
      </div>
      <div class="class-card-footer">
        <div class="class-card-days">
          ${DAYS.map(d => `<span class="day-chip ${days.includes(d) ? 'active' : ''}">${d}</span>`).join('')}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="time-badge">${cls.time || '-'}</span>
          <span class="count-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${students.length}명
          </span>
        </div>
      </div>
    </div>
  `
}

function onedayCardHTML(cls) {
  const students = cls.students || []
  return `
    <div class="card accordion-item--oneday" data-class-id="${cls.id}" style="border-radius:var(--radius);border:1px solid var(--border-oneday);cursor:pointer">
      <div class="class-card-header">
        <div>
          <div class="class-card-name">${cls.name}</div>
          <div class="class-card-meta">${cls.teacher ? cls.teacher + ' · ' : ''}${cls.start_date || ''}</div>
        </div>
        <span class="subject-tag ${cls.subject || ''}">${cls.subject || ''}</span>
      </div>
      <div class="class-card-footer">
        <div style="font-size:12px;color:var(--text3)">${cls.time || ''}</div>
        <span class="count-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ${students.length}명
        </span>
      </div>
    </div>
  `
}

// ========================================
// 수업 상세 모달
// ========================================

async function openClassDetailModal(cls) {
  const memos = await getAllClassMemos(cls.id)
  const students = cls.students || []
  const days = cls.days || []

  openModal(`
    <h2 class="modal-title">수업 상세</h2>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div>
        <div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:4px">${cls.name}</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="subject-tag ${cls.subject || ''}">${cls.subject || ''}</span>
          <span class="time-badge">${cls.time || '-'}</span>
          <span style="font-size:12px;color:var(--text2)">${cls.teacher || ''}</span>
          ${cls.sub_teacher ? `<span style="font-size:12px;color:var(--text3)">${cls.sub_teacher} (보조)</span>` : ''}
          ${cls.is_clinic ? '<span class="clinic-badge">클리닉</span>' : ''}
          ${cls.start_date && cls.end_date ? `<span style="font-size:11px;color:var(--text3);background:var(--surface2);padding:2px 8px;border-radius:6px">${cls.start_date} ~ ${cls.end_date}</span>` : ''}
        </div>
      </div>
    </div>

    <div style="display:flex;gap:4px;margin-bottom:16px">
      ${DAYS.map(d => `<span class="day-chip ${days.includes(d) ? 'active' : ''}">${d}</span>`).join('')}
    </div>

    ${cls.detail_memo ? `
      <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">수업 메모</div>
      <div class="results-memo-box" style="margin-bottom:16px">${escapeHtml(cls.detail_memo)}</div>
    ` : ''}

    <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">
      수강생 (${students.length}명)
    </div>
    <div class="class-detail-students">
      ${students.length === 0 ? '<div style="font-size:13px;color:var(--text3);padding:8px 0">수강생이 없습니다</div>' :
        students.map(s => {
          const student = typeof s === 'object' ? s : allStudents.find(st => st.id === s)
          if (!student) return ''
          const avatarClass = student.gender === '남' ? 'male' : 'female'
          return `
            <div class="class-detail-student-row">
              <div class="student-avatar ${avatarClass}" style="width:34px;height:34px;border-radius:10px;font-size:13px">${student.name.charAt(0)}</div>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--text)">${student.name}</div>
                <div style="font-size:11px;color:var(--text3)">${student.grade || ''} ${student.school ? '· ' + student.school : ''}</div>
              </div>
            </div>
          `
        }).join('')
      }
    </div>

    ${memos.length > 0 ? `
      <div class="section-divider"></div>
      <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">최근 수업 일지</div>
      <div class="memo-history-list">
        ${memos.slice(0, 5).map(m => `
          <div class="memo-history-item">
            <div class="memo-history-date">${m.date}</div>
            <div class="memo-history-text">${m.memo}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${cls.is_completed ? '<div style="font-size:12px;color:var(--text3);text-align:center;padding:4px 0 0">이 수업은 완강 처리되었습니다</div>' : ''}
    <div class="detail-action-row">
      ${!cls.is_oneday ? `<button class="btn ${cls.is_completed ? 'btn-secondary' : 'btn-complete'}" id="cls-complete-btn">${cls.is_completed ? '완강 취소' : '완강 처리'}</button>` : ''}
      <button class="btn btn-secondary" id="cls-edit-btn">수정</button>
      <button class="btn btn-danger" id="cls-delete-btn">삭제</button>
    </div>
  `)

  document.getElementById('cls-complete-btn')?.addEventListener('click', () => {
    const willComplete = !cls.is_completed
    openModal(`
      <h2 class="modal-title">${willComplete ? '완강 처리' : '완강 취소'}</h2>
      <p style="font-size:14px;color:var(--text2);margin-bottom:20px;line-height:1.6">
        <strong style="color:var(--text)">${cls.name}</strong> 수업을<br>
        ${willComplete ? '완강 처리하시겠습니까? 출석·수업 탭에서 숨겨집니다.' : '완강 취소하시겠습니까? 다시 활성 수업으로 복원됩니다.'}
      </p>
      <div class="form-actions">
        <button class="btn btn-secondary" id="comp-cancel">취소</button>
        <button class="btn ${willComplete ? 'btn-complete' : 'btn-secondary'}" id="comp-confirm">${willComplete ? '완강 처리' : '완강 취소'}</button>
      </div>
    `)
    document.getElementById('comp-cancel').onclick = () => openClassDetailModal(cls)
    document.getElementById('comp-confirm').onclick = async () => {
      try {
        await updateRow('classes', cls.id, { is_completed: willComplete })
        showToast(willComplete ? '완강 처리되었습니다' : '완강이 취소되었습니다', 'success')
        closeModal()
        await loadClasses()
      } catch (e) {
        showToast('저장 실패: ' + e.message, 'error')
      }
    }
  })

  document.getElementById('cls-edit-btn').onclick = () => openEditClassModal(cls)
  document.getElementById('cls-delete-btn').onclick = () => confirmDeleteClass(cls)
}

// ========================================
// 수업 추가/수정 모달
// ========================================

function openAddClassModal() {
  openModal(buildClassFormHTML('add', null), null)
  setupClassForm('add', null)
}

function openEditClassModal(cls) {
  openModal(buildClassFormHTML('edit', cls), null)
  setupClassForm('edit', cls)
}

function buildClassFormHTML(mode, cls = null) {
  const c = cls || {}
  const selectedDays = c.days || []
  const classStudentIds = (c.students || []).map(s => (typeof s === 'object' ? s.id : s))

  return `
    <h2 class="modal-title">${mode === 'add' ? '수업 추가' : '수업 수정'}</h2>
    <div class="form-group">
      <label class="form-label">수업명 *</label>
      <input class="form-input" id="cf-name" type="text" placeholder="수업명" value="${c.name || ''}" />
    </div>
    <div class="form-group">
      <label class="form-label">과목</label>
      <div class="subject-selector" id="cf-subjects">
        ${SUBJECTS.map(sub => `
          <button class="subject-toggle ${c.subject === sub ? 'selected' : ''}" data-subject="${sub}">${sub}</button>
        `).join('')}
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">담당 강사</label>
        <input class="form-input" id="cf-teacher" type="text" placeholder="강사명" value="${c.teacher || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">대상 학년</label>
        <select class="form-select" id="cf-grade">
          <option value="">선택</option>
          ${GRADES.map(g => `<option value="${g}" ${c.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${c.sub_teacher ? '8px' : '0'}">
        <label class="form-label" style="margin-bottom:0">보조강사</label>
        <button class="toggle-btn ${c.sub_teacher ? 'active' : ''}" id="cf-sub-teacher-toggle" data-active="${c.sub_teacher ? 'true' : 'false'}">
          <span class="toggle-knob"></span>
        </button>
      </div>
      <div id="cf-sub-teacher-wrap" style="display:${c.sub_teacher ? 'block' : 'none'}">
        <input class="form-input" id="cf-sub-teacher" type="text" placeholder="보조강사명" value="${c.sub_teacher || ''}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">수업 시간</label>
        <input class="form-input" id="cf-time" type="text" placeholder="예: 20-22" value="${c.time || ''}" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">수업 요일</label>
      <div class="days-selector" id="cf-days">
        ${DAYS.map(d => `
          <button class="day-toggle ${selectedDays.includes(d) ? 'selected' : ''}" data-day="${d}">${d}</button>
        `).join('')}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">수업 상세 메모 (교재, 진도 등)</label>
      <textarea class="form-textarea" id="cf-detail-memo" placeholder="교재명, 현재 진도, 특이사항...">${c.detail_memo || ''}</textarea>
    </div>
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div class="form-label" style="margin-bottom:2px">클리닉 수업</div>
          <div style="font-size:12px;color:var(--text3)">출석 탭에서 학생별 해당없음 표시 가능</div>
        </div>
        <button class="toggle-btn ${c.is_clinic ? 'active' : ''}" id="cf-clinic-toggle" data-active="${c.is_clinic ? 'true' : 'false'}">
          <span class="toggle-knob"></span>
        </button>
      </div>
    </div>
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${c.start_date ? '10px' : '0'}">
        <div>
          <div class="form-label" style="margin-bottom:2px">단기 기간 설정</div>
          <div style="font-size:12px;color:var(--text3)">설정 기간에만 출석·결과 탭에 표시</div>
        </div>
        <button class="toggle-btn ${c.start_date ? 'active' : ''}" id="cf-period-toggle" data-active="${c.start_date ? 'true' : 'false'}">
          <span class="toggle-knob"></span>
        </button>
      </div>
      <div id="cf-period-wrap" style="display:${c.start_date ? 'block' : 'none'}">
        <div class="form-row">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">시작일</label>
            <input class="form-input" id="cf-start-date" type="date" value="${c.start_date || ''}" />
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">종료일</label>
            <input class="form-input" id="cf-end-date" type="date" value="${c.end_date || ''}" min="${c.start_date || ''}" />
          </div>
        </div>
        ${c.start_date && c.end_date ? `<div style="font-size:12px;color:var(--text3);margin-top:6px">${c.start_date} ~ ${c.end_date}</div>` : ''}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">수강생</label>
      <div class="selected-student-tags" id="cf-selected-tags"></div>
      <input class="form-input" id="cf-student-search" type="text" placeholder="이름, 학교, 학년, 과목 검색..." />
      <div id="cf-student-results"></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" id="cf-cancel">취소</button>
      <button class="btn btn-primary" id="cf-submit">${mode === 'add' ? '추가' : '저장'}</button>
    </div>
  `
}

function setupClassForm(mode, cls) {
  // 보조강사 토글
  const subTeacherToggle = document.getElementById('cf-sub-teacher-toggle')
  if (subTeacherToggle) {
    subTeacherToggle.onclick = (e) => {
      e.stopPropagation()
      const next = subTeacherToggle.dataset.active !== 'true'
      subTeacherToggle.dataset.active = String(next)
      subTeacherToggle.classList.toggle('active', next)
      const wrap = document.getElementById('cf-sub-teacher-wrap')
      wrap.style.display = next ? 'block' : 'none'
      const row = subTeacherToggle.closest('.form-group').querySelector('div')
      row.style.marginBottom = next ? '8px' : '0'
    }
  }

  // 클리닉 토글
  const clinicToggle = document.getElementById('cf-clinic-toggle')
  if (clinicToggle) {
    clinicToggle.onclick = (e) => {
      e.stopPropagation()
      const next = clinicToggle.dataset.active !== 'true'
      clinicToggle.dataset.active = String(next)
      clinicToggle.classList.toggle('active', next)
    }
  }

  // 단기 기간 설정 토글
  const periodToggle = document.getElementById('cf-period-toggle')
  if (periodToggle) {
    periodToggle.onclick = (e) => {
      e.stopPropagation()
      const next = periodToggle.dataset.active !== 'true'
      periodToggle.dataset.active = String(next)
      periodToggle.classList.toggle('active', next)
      const wrap = document.getElementById('cf-period-wrap')
      wrap.style.display = next ? 'block' : 'none'
      periodToggle.closest('.form-group').querySelector('div').style.marginBottom = next ? '10px' : '0'
    }
  }

  // 시작일 변경 시 종료일 min 자동 설정
  const startDateInput = document.getElementById('cf-start-date')
  const endDateInput = document.getElementById('cf-end-date')
  if (startDateInput && endDateInput) {
    startDateInput.addEventListener('change', () => {
      endDateInput.min = startDateInput.value
      if (endDateInput.value && endDateInput.value < startDateInput.value) {
        endDateInput.value = ''
      }
    })
  }

  // 과목 — 단일 선택
  document.querySelectorAll('#cf-subjects .subject-toggle').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#cf-subjects .subject-toggle').forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
    }
  })

  // 요일 — 다중 선택
  document.querySelectorAll('#cf-days .day-toggle').forEach(btn => {
    btn.onclick = () => btn.classList.toggle('selected')
  })

  // 수강생 선택 상태 관리
  const classStudentIds = (cls?.students || []).map(s => (typeof s === 'object' ? s.id : s))
  let selectedStudentIds = new Set(classStudentIds)
  const activeStudents = allStudents.filter(s => s.status !== 'inactive')

  function renderSelectedTags() {
    const wrap = document.getElementById('cf-selected-tags')
    if (!wrap) return
    wrap.innerHTML = [...selectedStudentIds].map(id => {
      const s = allStudents.find(st => st.id === id)
      if (!s) return ''
      return `<span class="selected-student-tag" data-id="${s.id}">${s.name}<button class="tag-remove" data-id="${s.id}" title="삭제">×</button></span>`
    }).join('')
    wrap.querySelectorAll('.tag-remove').forEach(btn => {
      btn.onclick = () => {
        selectedStudentIds.delete(btn.dataset.id)
        renderSelectedTags()
        renderSearchResults(document.getElementById('cf-student-search').value.toLowerCase())
      }
    })
  }

  function renderSearchResults(q) {
    const resultsEl = document.getElementById('cf-student-results')
    if (!resultsEl) return
    if (!q) { resultsEl.innerHTML = ''; return }
    const matched = activeStudents.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.school || '').toLowerCase().includes(q) ||
      (s.grade || '').toLowerCase().includes(q) ||
      (s.subjects || []).join(' ').toLowerCase().includes(q)
    )
    if (matched.length === 0) {
      resultsEl.innerHTML = `<div class="student-search-results"><div style="padding:10px 10px;font-size:13px;color:var(--text3)">검색 결과 없음</div></div>`
      return
    }
    resultsEl.innerHTML = `<div class="student-search-results">${matched.map(s => `
      <div class="student-result-item ${selectedStudentIds.has(s.id) ? 'already-selected' : ''}" data-id="${s.id}">
        <div>
          <div class="student-check-name">${s.name}</div>
          <div class="student-check-meta">${s.grade || ''}${s.grade && s.school ? ' · ' : ''}${s.school || ''}</div>
        </div>
      </div>
    `).join('')}</div>`
    resultsEl.querySelectorAll('.student-result-item:not(.already-selected)').forEach(item => {
      item.onclick = () => {
        selectedStudentIds.add(item.dataset.id)
        renderSelectedTags()
        renderSearchResults(document.getElementById('cf-student-search').value.toLowerCase())
      }
    })
  }

  renderSelectedTags()

  document.getElementById('cf-student-search').addEventListener('input', e => {
    renderSearchResults(e.target.value.toLowerCase())
  })

  document.getElementById('cf-cancel').onclick = closeModal

  document.getElementById('cf-submit').onclick = async () => {
    const name = document.getElementById('cf-name').value.trim()
    if (!name) { showToast('수업명을 입력하세요', 'error'); return }

    const isPeriod = document.getElementById('cf-period-toggle')?.dataset.active === 'true'
    const startDate = document.getElementById('cf-start-date')?.value || ''
    const endDate = document.getElementById('cf-end-date')?.value || ''

    if (isPeriod) {
      if (!startDate || !endDate) {
        showToast('시작일과 종료일을 모두 입력해주세요', 'error'); return
      }
      if (endDate < startDate) {
        showToast('종료일은 시작일보다 앞설 수 없습니다', 'error'); return
      }
    }

    const subject = document.querySelector('#cf-subjects .subject-toggle.selected')?.dataset.subject || ''
    const days = [...document.querySelectorAll('#cf-days .day-toggle.selected')]
      .map(b => b.dataset.day)
    const studentIds = [...selectedStudentIds]

    const data = {
      name,
      subject,
      teacher: document.getElementById('cf-teacher').value.trim(),
      grade: document.getElementById('cf-grade').value,
      time: document.getElementById('cf-time').value.trim(),
      days,
      detail_memo: document.getElementById('cf-detail-memo').value.trim(),
      is_clinic: document.getElementById('cf-clinic-toggle')?.dataset.active === 'true',
      sub_teacher: document.getElementById('cf-sub-teacher-toggle')?.dataset.active === 'true'
        ? (document.getElementById('cf-sub-teacher').value.trim() || null)
        : null,
      start_date: isPeriod ? startDate : null,
      end_date: isPeriod ? endDate : null,
    }

    const btn = document.getElementById('cf-submit')
    btn.disabled = true
    btn.textContent = '저장 중...'

    try {
      if (mode === 'add') {
        const newCls = await insertRow('classes', data)
        await syncClassStudents(newCls.id, studentIds)
        showToast('수업이 추가되었습니다', 'success')
      } else {
        await updateRow('classes', cls.id, data)
        await syncClassStudents(cls.id, studentIds)
        showToast('저장되었습니다', 'success')
      }
      closeModal()
      await loadClasses()
    } catch (e) {
      showToast('저장 실패: ' + e.message, 'error')
      btn.disabled = false
      btn.textContent = mode === 'add' ? '추가' : '저장'
    }
  }
}

async function confirmDeleteClass(cls) {
  openModal(`
    <h2 class="modal-title">수업 삭제</h2>
    <p style="font-size:14px;color:var(--text2);margin-bottom:20px;line-height:1.6">
      <strong style="color:var(--text)">${cls.name}</strong> 수업을 삭제하시겠습니까?<br>
      관련 출결/메모/점수 기록도 모두 삭제됩니다.
    </p>
    <div class="form-actions">
      <button class="btn btn-secondary" id="del-cancel">취소</button>
      <button class="btn btn-danger" id="del-confirm">삭제</button>
    </div>
  `)

  document.getElementById('del-cancel').onclick = closeModal
  document.getElementById('del-confirm').onclick = async () => {
    try {
      await deleteRow('classes', cls.id)
      showToast('삭제되었습니다', 'success')
      closeModal()
      await loadClasses()
    } catch (e) {
      showToast('삭제 실패: ' + e.message, 'error')
    }
  }
}
