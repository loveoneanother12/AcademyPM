/**
 * AcademyPM v2 — 메인 진입점
 * 탭 라우팅 및 페이지 전환 관리
 */

import './styles/main.css'
import { renderStudentsPage } from './pages/students.js'
import { renderClassesPage } from './pages/classes.js'
import { renderAttendancePage } from './pages/attendance.js'
import { renderResultsPage } from './pages/results.js'
import { renderReportPage } from './pages/report.js'
import { isOnline } from './lib/supabase.js'

let currentTab = 'students'

// === 테마 관리 ===
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  const meta = document.getElementById('meta-theme-color')
  if (meta) meta.content = theme === 'light' ? '#f0ebe0' : '#111113'
  const pill = document.getElementById('theme-toggle-btn')
  if (pill) pill.classList.toggle('is-light', theme === 'light')
  const label = document.getElementById('theme-toggle-label')
  if (label) label.textContent = theme === 'light' ? 'Light' : 'Dark'
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark'
  applyTheme(saved)
  const wrap = document.getElementById('theme-toggle-wrap')
  if (wrap) {
    wrap.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark'
      applyTheme(current === 'dark' ? 'light' : 'dark')
    })
  }
}

const PAGE_RENDERERS = {
  students: renderStudentsPage,
  classes: renderClassesPage,
  attendance: renderAttendancePage,
  results: renderResultsPage,
}

async function navigateTo(tab) {
  if (currentTab === tab) return

  // 이전 FAB 제거
  const oldFab = document.querySelector('.fab')
  if (oldFab) oldFab.remove()

  currentTab = tab

  // 탭 활성화
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab)
  })

  const content = document.getElementById('page-content')
  content.classList.remove('oneday-mode')
  content.innerHTML = '<div class="loading-screen"><div class="loading-spinner"></div></div>'

  try {
    await PAGE_RENDERERS[tab](content)
  } catch (e) {
    console.error(`[main.js] navigateTo(${tab}) error:`, e)
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">페이지 로드 중 오류가 발생했습니다</div>
        <div class="empty-state-sub">${e.message}</div>
      </div>
    `
  }
}

async function init() {
  // 공유 링크 모드: ?report=TOKEN
  const reportToken = new URLSearchParams(window.location.search).get('report')
  if (reportToken) {
    // 앱 UI 숨기고 리포트 페이지만 표시
    document.getElementById('app-header')?.style.setProperty('display', 'none')
    document.getElementById('bottom-nav')?.style.setProperty('display', 'none')
    const content = document.getElementById('page-content')
    content.style.paddingBottom = '0'
    await renderReportPage(content, reportToken)
    return
  }

  // 탭 클릭 이벤트
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.tab))
  })

  // 테마 초기화
  initTheme()

  // 오프라인 상태 표시
  if (!isOnline) {
    const logo = document.querySelector('.logo-text')
    if (logo) logo.title = '오프라인 모드'
  }

  // 기본 탭으로 출석 탭 시작 (가장 많이 사용)
  currentTab = null
  await navigateTo('attendance')

  // 네비게이션 활성화 업데이트
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === 'attendance')
  })
}

init()
