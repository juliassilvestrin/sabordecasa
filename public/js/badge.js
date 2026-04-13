import { getSavedItems } from './saved.js';

export function updateSavedBadges() {
  const count = getSavedItems().length;
  document.querySelectorAll('.saved-badge').forEach(badge => {
    badge.textContent = count > 0 ? count : '';
    badge.classList.toggle('hidden', count === 0);
  });
}
