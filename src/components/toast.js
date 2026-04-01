/**
 * Toast 컴포넌트
 * 하단 중앙, 2.2초 자동 사라짐
 */

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container')
  if (!container) return

  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.textContent = message
  container.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('fade-out')
    toast.addEventListener('animationend', () => toast.remove(), { once: true })
  }, 2200)
}
