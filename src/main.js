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
import { renderLoginPage } from './pages/login.js'
import { supabase, isOnline } from './lib/supabase.js'
import { clearAcademyIdCache } from './api.js'
import { openModal, closeModal } from './components/modal.js'
import { showToast } from './components/toast.js'

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
  // 공유 링크 모드: ?report=TOKEN (인증 불필요)
  const params = new URLSearchParams(window.location.search)
  const reportToken = params.get('report')
  if (reportToken) {
    document.getElementById('app-header')?.style.setProperty('display', 'none')
    document.getElementById('bottom-nav')?.style.setProperty('display', 'none')
    const content = document.getElementById('page-content')
    content.style.paddingBottom = '0'
    const reportTheme = params.get('theme') === 'light' ? 'light' : 'dark'
    applyTheme(reportTheme)
    await renderReportPage(content, reportToken)
    return
  }

  // 인증 체크 (온라인 모드에서만)
  if (isOnline) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      renderLoginPage()
      return
    }
    // 로그아웃 감지 → 페이지 리로드
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearAcademyIdCache()
        location.reload()
      }
    })
    // 헤더에 설정(비밀번호 변경) + 로그아웃 버튼 추가
    const actions = document.getElementById('header-actions')

    const settingsBtn = document.createElement('button')
    settingsBtn.className = 'header-logout-btn'
    settingsBtn.title = '비밀번호 변경'
    settingsBtn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
    settingsBtn.onclick = () => {
      openModal(`
        <h2 class="modal-title">비밀번호 변경</h2>
        <div class="form-group">
          <label class="form-label">새 비밀번호</label>
          <input class="form-input" id="pw-new" type="password" placeholder="새 비밀번호 (6자 이상)" />
        </div>
        <div class="form-group">
          <label class="form-label">새 비밀번호 확인</label>
          <input class="form-input" id="pw-confirm" type="password" placeholder="다시 입력" />
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" id="pw-cancel">취소</button>
          <button class="btn btn-primary" id="pw-submit">변경</button>
        </div>
      `)
      document.getElementById('pw-cancel').onclick = closeModal
      document.getElementById('pw-submit').onclick = async () => {
        const pw = document.getElementById('pw-new').value
        const confirm = document.getElementById('pw-confirm').value
        if (pw.length < 6) { showToast('비밀번호는 6자 이상이어야 합니다', 'error'); return }
        if (pw !== confirm) { showToast('비밀번호가 일치하지 않습니다', 'error'); return }
        const btn = document.getElementById('pw-submit')
        btn.disabled = true
        btn.textContent = '변경 중...'
        const { error } = await supabase.auth.updateUser({ password: pw })
        if (error) {
          showToast('변경 실패: ' + error.message, 'error')
          btn.disabled = false
          btn.textContent = '변경'
        } else {
          showToast('비밀번호가 변경되었습니다', 'success')
          closeModal()
        }
      }
    }

    const logoutBtn = document.createElement('button')
    logoutBtn.className = 'header-logout-btn'
    logoutBtn.title = '로그아웃'
    logoutBtn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`
    logoutBtn.onclick = () => supabase.auth.signOut()

    actions.prepend(logoutBtn)
    actions.prepend(settingsBtn)
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
