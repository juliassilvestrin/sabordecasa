import { getSavedItems, removeSaved } from './saved.js';
import { setState } from './state.js';
import { t } from './i18n.js';

function getMatchClass(percentage) {
  if (percentage >= 75) return 'match-high';
  if (percentage >= 50) return 'match-mid';
  return 'match-low';
}

export function renderSavedList() {
  const listEl = document.getElementById('saved-list');
  const emptyEl = document.getElementById('saved-empty');
  const items = getSavedItems();

  if (items.length === 0) {
    listEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  listEl.classList.remove('hidden');

  listEl.innerHTML = items.map((item, index) => `
    <div class="saved-card" role="listitem" data-index="${index}">
      <div class="saved-card-content">
        <h3>${item.substituteName}</h3>
        <p>${t('savedSubstituteFor')} <strong>${item.ingredient}</strong>${item.dish ? ` ${t('savedIn')} <strong>${item.dish}</strong>` : ''}</p>
      </div>
      <div class="match-badge ${getMatchClass(item.matchPercentage)}">
        <span class="match-badge-pct">${item.matchPercentage}%</span>
        <span class="match-badge-label">match</span>
      </div>
      <div class="saved-card-actions">
        <button class="saved-card-remove" data-index="${index}" aria-label="Remove ${item.substituteName} from saved">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button class="saved-card-detail" data-index="${index}" aria-label="View details for ${item.substituteName}">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
  `).join('');

  // Remove buttons
  listEl.querySelectorAll('.saved-card-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index);
      const item = items[idx];
      removeSaved(item.substituteName, item.ingredient, item.dish);
      renderSavedList();
    });
  });

  // Detail buttons
  listEl.querySelectorAll('.saved-card-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index);
      const item = items[idx];
      if (item.substitute) {
        setState({
          currentView: 'result-detail',
          selectedSubstitute: item.substitute,
          query: { ingredient: item.ingredient, dish: item.dish },
        });
      }
    });
  });
}
