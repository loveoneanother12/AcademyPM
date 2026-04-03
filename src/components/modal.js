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

  // 드래그 다운 → 닫기
  bindDragToClose()
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay')
  const sheet = document.getElementById('modal-sheet')
  if (!overlay) return
  overlay.classList.remove('visible')
  overlay.classList.add('hidden')
  if (sheet) sheet.style.transform = ''
  if (typeof _onClose === 'function') {
    _onClose()
    _onClose = null
  }
}

export function getModalContent() {
  return document.getElementById('modal-content')
}

function bindDragToClose() {
  const sheet = document.getElementById('modal-sheet')
  const handle = sheet?.querySelector('.modal-handle')
  if (!sheet || !handle) return

  const THRESHOLD = 80
  let startY = 0
  let dragging = false

  function onStart(e) {
    dragging = true
    startY = e.touches ? e.touches[0].clientY : e.clientY
    sheet.style.transition = 'none'
  }

  function onMove(e) {
    if (!dragging) return
    const currentY = e.touches ? e.touches[0].clientY : e.clientY
    const dy = Math.max(0, currentY - startY)
    sheet.style.transform = `translateY(${dy}px)`
  }

  function onEnd(e) {
    if (!dragging) return
    dragging = false
    const currentY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY
    const dy = Math.max(0, currentY - startY)

    if (dy >= THRESHOLD) {
      // 임계값 초과 → 내려가며 닫기
      sheet.style.transition = 'transform 0.25s ease'
      sheet.style.transform = `translateY(100%)`
      sheet.addEventListener('transitionend', () => closeModal(), { once: true })
    } else {
      // 미달 → 원위치 복귀
      sheet.style.transition = 'transform 0.2s ease'
      sheet.style.transform = ''
    }
  }

  // 이전 리스너 제거 후 재등록
  const newHandle = handle.cloneNode(true)
  handle.parentNode.replaceChild(newHandle, handle)

  newHandle.addEventListener('touchstart', onStart, { passive: true })
  document.addEventListener('touchmove', onMove, { passive: true })
  document.addEventListener('touchend', onEnd)

  newHandle.addEventListener('mousedown', onStart)
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)

  // 모달 닫힐 때 document 리스너 정리
  const overlay = document.getElementById('modal-overlay')
  const cleanup = () => {
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)
    overlay?.removeEventListener('click', cleanup)
  }
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) cleanup()
  })
}
