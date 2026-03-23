import { setState } from './state.js';

function getMatchClass(percentage) {
  if (percentage >= 75) return 'match-high';
  if (percentage >= 50) return 'match-mid';
  return 'match-low';
}

export function renderIngredientInfo(container, ingredient) {
  container.innerHTML = `
    <div class="ingredient-info">
      <span class="language-tag">${ingredient.language}</span>
      <h3>${ingredient.name}</h3>
      <p>${ingredient.description}</p>
      <div class="ingredient-dishes">
        ${ingredient.commonDishes.map(d => `<span class="dish-tag">${d}</span>`).join('')}
      </div>
    </div>
  `;
}

export function renderResultsList(container, substitutes) {
  container.innerHTML = substitutes.map(sub => `
    <div class="result-card" data-rank="${sub.rank}">
      <div class="result-card-content">
        <span class="match-badge ${getMatchClass(sub.matchPercentage)}">${sub.matchPercentage}% match</span>
        <h3>${sub.name}</h3>
        <p>${sub.description}</p>
      </div>
      <div class="result-card-arrow">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.result-card').forEach(card => {
    card.addEventListener('click', () => {
      const rank = parseInt(card.dataset.rank);
      const substitute = substitutes.find(s => s.rank === rank);
      setState({ currentView: 'result-detail', selectedSubstitute: substitute });
    });
  });
}

export function renderResultDetail(container, substitute) {
  container.innerHTML = `
    <div class="result-detail">
      <div class="detail-header">
        <span class="match-badge ${getMatchClass(substitute.matchPercentage)}">${substitute.matchPercentage}% match</span>
        <h3>${substitute.name}</h3>
        <p>${substitute.description}</p>
      </div>
      <div class="tabs">
        <button class="tab active" data-tab="why">Why it works</button>
        <button class="tab" data-tab="where">Where to buy</button>
        <button class="tab" data-tab="how">How to use</button>
      </div>
      <div class="tab-content">
        <div class="tab-panel active" data-panel="why">
          <p>${substitute.whyItWorks}</p>
          ${substitute.limitations ? `<p><span class="label">Limitations:</span> ${substitute.limitations}</p>` : ''}
        </div>
        <div class="tab-panel" data-panel="where">
          <div class="store-list">
            ${substitute.whereToBuy.map(store => `
              <div class="store-item">
                <span class="store-name">${store.store}</span>
                <span class="store-product">${store.product}</span>
                <span class="store-aisle">Look in: ${store.aisle}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="tab-panel" data-panel="how">
          <p>${substitute.howToUse}</p>
        </div>
      </div>
    </div>
  `;

  // Tab switching
  const tabs = container.querySelectorAll('.tab');
  const panels = container.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    });
  });
}

export function renderNoSubstitute(container, data) {
  container.innerHTML = `
    <div class="no-sub-icon">${'\u26A0'}</div>
    <h3>${data.originalIngredient.name}</h3>
    <p>${data.message}</p>
    ${data.suggestions && data.suggestions.length > 0 ? `
      <p class="suggestions-title">What you could try instead:</p>
      <div class="suggestions-list">
        ${data.suggestions.map(s => `<div class="suggestion-card">${s.text}</div>`).join('')}
      </div>
    ` : ''}
  `;
}
