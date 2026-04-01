/**
 * Modal / BottomSheet 컴포넌트
 * 하단 바텀시트, 위로 슬라이드
 */

let _onClose = null

export function openModal(contentHTML, onClose = null) {
  const overlay = document.getElementById('modal-overlay')
  const content = document.getElementById('modal-content')
  if (!overlay || !content) return

  content.innerHTML = contentHTML
  overlay.classList.remove('hidden')
  overlay.classList.add('visible')
  _onClose = onClose

  // 오버레이 클릭 → 닫기
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal()
  }
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay')
  if (!overlay) return
  overlay.classList.remove('visible')
  overlay.classList.add('hidden')
  if (typeof _onClose === 'function') {
    _onClose()
    _onClose = null
  }
}

export function getModalContent() {
  return document.getElementById('modal-content')
}
