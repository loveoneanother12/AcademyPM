import { signInWithEmail, signInWithGoogle } from '../lib/supabase.js'
import { showToast } from '../components/toast.js'

export function renderLoginPage() {
  document.getElementById('app-header')?.style.setProperty('display', 'none')
  document.getElementById('bottom-nav')?.style.setProperty('display', 'none')

  const content = document.getElementById('page-content')
  content.style.paddingBottom = '0'
  content.style.paddingTop = '0'

  content.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-logo">
          <span class="logo-icon">✦</span>
          <span class="logo-text">AcademyPM</span>
        </div>
        <p class="login-subtitle">학원 관리 시스템에 로그인하세요</p>

        <div class="login-form">
          <input class="form-input" id="login-email" type="email" placeholder="이메일" autocomplete="email" />
          <input class="form-input" id="login-password" type="password" placeholder="비밀번호" autocomplete="current-password" style="margin-top:8px" />
          <button class="btn btn-primary" id="login-submit" style="width:100%;margin-top:12px">로그인</button>
        </div>

        <div class="login-divider"><span>또는</span></div>

        <button class="btn btn-secondary login-google-btn" id="login-google">
          <svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 계속하기
        </button>

        <p class="login-notice">계정 문의는 관리자에게 연락하세요</p>
      </div>
    </div>
  `

  const submitBtn = content.querySelector('#login-submit')
  const emailInput = content.querySelector('#login-email')
  const passwordInput = content.querySelector('#login-password')

  async function handleEmailLogin() {
    const email = emailInput.value.trim()
    const password = passwordInput.value
    if (!email || !password) {
      showToast('이메일과 비밀번호를 입력하세요', 'error')
      return
    }
    submitBtn.disabled = true
    submitBtn.textContent = '로그인 중...'
    try {
      const { error } = await signInWithEmail(email, password)
      if (error) throw error
      location.reload()
    } catch (e) {
      showToast('로그인 실패: 이메일 또는 비밀번호를 확인하세요', 'error')
      submitBtn.disabled = false
      submitBtn.textContent = '로그인'
    }
  }

  submitBtn.onclick = handleEmailLogin
  passwordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleEmailLogin()
  })

  content.querySelector('#login-google').onclick = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (e) {
      showToast('Google 로그인 실패: ' + e.message, 'error')
    }
  }
}
