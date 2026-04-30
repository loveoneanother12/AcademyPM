import { getAllAcademies } from '../api.js'

export async function renderAdminPage(container, onSelectAcademy) {
  container.innerHTML = `<div class="loading-screen"><div class="loading-spinner"></div></div>`

  const academies = await getAllAcademies()

  container.innerHTML = `
    <div class="admin-wrap">
      <div class="admin-header">
        <div class="admin-title">학원 목록</div>
        <div class="admin-subtitle">${academies.length}개 학원</div>
      </div>
      <div class="admin-list">
        ${academies.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🏫</div>
            <div class="empty-state-text">등록된 학원이 없습니다</div>
          </div>
        ` : academies.map(a => `
          <button class="admin-academy-card" data-id="${a.id}" data-name="${a.name}">
            <div class="admin-academy-icon">${a.name.charAt(0)}</div>
            <div class="admin-academy-info">
              <div class="admin-academy-name">${a.name}</div>
              <div class="admin-academy-meta">생성일 ${a.created_at?.slice(0, 10) ?? '-'}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text3);flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        `).join('')}
      </div>
    </div>
  `

  container.querySelectorAll('.admin-academy-card').forEach(card => {
    card.onclick = () => onSelectAcademy(card.dataset.id, card.dataset.name)
  })
}
