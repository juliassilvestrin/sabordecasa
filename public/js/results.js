import { setState, getState } from './state.js';
import { toggleSave, isSaved } from './saved.js';
import { t, getLang } from './i18n.js';
import { showToast } from './toast.js';
import { reportSubstitute } from './api.js';

function getMatchClass(percentage) {
  if (percentage >= 75) return 'match-high';
  if (percentage >= 50) return 'match-mid';
  return 'match-low';
}

function matchBadgeHTML(percentage, extraClass = '') {
  return `
    <div class="match-badge ${getMatchClass(percentage)} ${extraClass}">
      <span class="match-badge-pct">${percentage}%</span>
      <span class="match-badge-label">match</span>
    </div>
  `;
}

const checkSVG = `<svg class="why-check" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 10l3.5 3.5L15 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function renderResultsList(container, substitutes) {
  container.innerHTML = substitutes.map(sub => `
    <div class="result-card" data-rank="${sub.rank}" role="listitem" tabindex="0" aria-label="${sub.name}, ${sub.matchPercentage}% match. ${sub.description}">
      <div class="result-card-content">
        <h3>${sub.name}</h3>
        <p>${sub.description}</p>
      </div>
      <div class="result-card-right">
        ${matchBadgeHTML(sub.matchPercentage)}
        <div class="result-card-arrow" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.result-card').forEach(card => {
    const handler = () => {
      const rank = parseInt(card.dataset.rank);
      const substitute = substitutes.find(s => s.rank === rank);
      setState({ currentView: 'result-detail', selectedSubstitute: substitute });
    };
    card.addEventListener('click', handler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });
}

export function renderResultDetail(container, substitute, ingredient, dish) {
  const saved = isSaved(substitute.name, ingredient, dish);

  // Split whyItWorks into bullet points (by sentence)
  const whyPoints = substitute.whyItWorks
    .split(/(?<=[.!])\s+/)
    .filter(s => s.trim().length > 0);

  const infoSVG = `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M10 8.5v.5M10 11v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

  container.innerHTML = `
    <div class="result-detail">
      <div class="detail-header">
        <div class="detail-header-text">
          <h3>${substitute.name}</h3>
          <p>${substitute.description}</p>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          ${matchBadgeHTML(substitute.matchPercentage, 'match-badge--inline')}
          <button class="match-info-btn" id="match-info-btn" aria-label="${t('matchInfoBtn')}">${infoSVG}</button>
        </div>
      </div>
      <div class="tabs" role="tablist" aria-label="Substitute details">
        <button class="tab active" role="tab" aria-selected="true" aria-controls="panel-why" id="tab-why" data-tab="why">${t('tabWhy')}</button>
        <button class="tab" role="tab" aria-selected="false" aria-controls="panel-where" id="tab-where" data-tab="where">${t('tabWhere')}</button>
        <button class="tab" role="tab" aria-selected="false" aria-controls="panel-how" id="tab-how" data-tab="how">${t('tabHow')}</button>
      </div>
      <div class="tab-content">
        <div class="tab-panel active" role="tabpanel" id="panel-why" aria-labelledby="tab-why" data-panel="why">
          <ul class="why-list">
            ${whyPoints.map(point => `<li>${checkSVG}<span>${point}</span></li>`).join('')}
          </ul>
          ${substitute.limitations ? `<p style="margin-top: var(--space-lg);"><span class="label">${t('limitations')}</span> ${substitute.limitations}</p>` : ''}
        </div>
        <div class="tab-panel" role="tabpanel" id="panel-where" aria-labelledby="tab-where" data-panel="where" hidden>
          <div class="store-list">
            ${substitute.whereToBuy.map(store => `
              <div class="store-item">
                <span class="store-name">${store.store}</span>
                <span class="store-product">${store.product}</span>
                <span class="store-aisle">${t('storeAisle')} ${store.aisle}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="tab-panel" role="tabpanel" id="panel-how" aria-labelledby="tab-how" data-panel="how" hidden>
          <p>${substitute.howToUse}</p>
        </div>
      </div>
    </div>
    <button class="btn-save ${saved ? 'saved' : ''}" id="save-btn" aria-pressed="${saved}">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      ${saved ? t('savedBtn') : t('saveBtn')}
    </button>
    <button class="report-btn" id="report-btn" aria-label="${t('reportBtn')}">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3l7 13H3L10 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 8v4M10 14.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      ${t('reportBtn')}
    </button>
  `;

  // Tab switching with keyboard support
  const tabs = container.querySelectorAll('.tab');
  const panels = container.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab, tabs, panels, container));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const tabArr = [...tabs];
        const idx = tabArr.indexOf(tab);
        const next = e.key === 'ArrowRight'
          ? tabArr[(idx + 1) % tabArr.length]
          : tabArr[(idx - 1 + tabArr.length) % tabArr.length];
        next.focus();
        switchTab(next, tabs, panels, container);
      }
    });
  });

  // Save button
  const saveBtn = container.querySelector('#save-btn');
  saveBtn.addEventListener('click', () => {
    const nowSaved = toggleSave(substitute, ingredient, dish);
    saveBtn.classList.toggle('saved', nowSaved);
    saveBtn.setAttribute('aria-pressed', String(nowSaved));
    saveBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${nowSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      ${nowSaved ? t('savedBtn') : t('saveBtn')}
    `;
    showToast(nowSaved ? t('toastSaved') : t('toastUnsaved'));
  });

  // Match info button
  const matchInfoBtn = container.querySelector('#match-info-btn');
  matchInfoBtn.addEventListener('click', () => showMatchTooltip());

  // Report button
  const reportBtn = container.querySelector('#report-btn');
  reportBtn.addEventListener('click', () => showReportOverlay(substitute, ingredient, dish));
}

function showMatchTooltip() {
  const overlay = document.createElement('div');
  overlay.className = 'match-tooltip-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', t('matchInfoTitle'));
  overlay.innerHTML = `
    <div class="match-tooltip-box">
      <h4>${t('matchInfoTitle')}</h4>
      <div class="match-tooltip-row">
        <div class="match-badge match-high" style="min-width:52px"><span class="match-badge-pct">80%+</span><span class="match-badge-label">match</span></div>
        <div>
          <strong>${t('matchInfo80label')}</strong><br>
          <span style="color:var(--color-text-light);font-size:0.8125rem">${t('matchInfo80desc')}</span>
        </div>
      </div>
      <div class="match-tooltip-row">
        <div class="match-badge match-mid" style="min-width:52px"><span class="match-badge-pct">60%+</span><span class="match-badge-label">match</span></div>
        <div>
          <strong>${t('matchInfo60label')}</strong><br>
          <span style="color:var(--color-text-light);font-size:0.8125rem">${t('matchInfo60desc')}</span>
        </div>
      </div>
      <div class="match-tooltip-row">
        <div class="match-badge match-low" style="min-width:52px"><span class="match-badge-pct">&lt;60%</span><span class="match-badge-label">match</span></div>
        <div>
          <strong>${t('matchInfo0label')}</strong><br>
          <span style="color:var(--color-text-light);font-size:0.8125rem">${t('matchInfo0desc')}</span>
        </div>
      </div>
      <button class="match-tooltip-close" id="match-tooltip-close">${t('matchInfoClose')}</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#match-tooltip-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  overlay.querySelector('#match-tooltip-close').focus();
}

function showReportOverlay(substitute, ingredient, dish) {
  const overlay = document.createElement('div');
  overlay.className = 'report-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', t('reportTitle'));

  const reasons = [
    { key: 'not-available', label: t('reportNotAvailable') },
    { key: 'not-similar',   label: t('reportNotSimilar') },
    { key: 'wrong-store',   label: t('reportWrongStore') },
    { key: 'other',         label: t('reportOther') },
  ];

  overlay.innerHTML = `
    <div class="report-box">
      <h4>${t('reportTitle')}</h4>
      <p>${t('reportDesc')}</p>
      <div class="report-options">
        ${reasons.map(r => `
          <button class="report-option" data-reason="${r.key}">${r.label}</button>
        `).join('')}
      </div>
      <div class="report-actions">
        <button class="report-cancel" id="report-cancel">${t('reportCancel')}</button>
        <button class="report-submit" id="report-submit" disabled>${t('reportSubmit')}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  let selectedReason = null;

  overlay.querySelectorAll('.report-option').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.report-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedReason = btn.dataset.reason;
      overlay.querySelector('#report-submit').disabled = false;
    });
  });

  const close = () => overlay.remove();

  overlay.querySelector('#report-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  overlay.querySelector('#report-submit').addEventListener('click', async () => {
    if (!selectedReason) return;
    try {
      await reportSubstitute({
        ingredient,
        dish: dish || null,
        substituteName: substitute.name,
        reason: selectedReason,
      });
    } catch (_) { /* silently ignore — best effort */ }
    close();
    showToast(t('reportSuccess'));
  });
}

function switchTab(activeTab, tabs, panels, container) {
  tabs.forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  panels.forEach(p => {
    p.classList.remove('active');
    p.setAttribute('hidden', '');
  });

  activeTab.classList.add('active');
  activeTab.setAttribute('aria-selected', 'true');

  const panel = container.querySelector(`[data-panel="${activeTab.dataset.tab}"]`);
  panel.classList.add('active');
  panel.removeAttribute('hidden');
}

export function renderNoSubstitute(container, data) {
  const triangleSVG = `<svg width="56" height="56" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M24 4L44 40H4L24 4z" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <path d="M24 18v10M24 32v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;

  const ingredientName = data.originalIngredient?.name || 'This ingredient';

  container.innerHTML = `
    <div class="no-sub-icon">${triangleSVG}</div>
    <h3>${t('noSubTitle')}</h3>
    <p>${data.message}</p>
    <div class="nosub-divider"></div>
    <p class="suggestions-title">${t('noSubWhat')}</p>
    <div class="suggestions-grid">
      <div class="suggestion-card" role="link" tabindex="0" aria-label="${t('noSubOrder', ingredientName)}">
        <div class="suggestion-card-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <div class="suggestion-card-text">
          <h4>${t('noSubOrder', ingredientName)}</h4>
          <p>${t('noSubOrderSub')}</p>
        </div>
        <div class="suggestion-card-arrow" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5v10H5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div class="suggestion-card" role="button" tabindex="0" aria-label="${t('noSubDiff')}" id="try-different-dish">
        <div class="suggestion-card-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <div class="suggestion-card-text">
          <h4>${t('noSubDiff')}</h4>
          <p>${t('noSubDiffSub')}</p>
        </div>
        <div class="suggestion-card-arrow" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
    </div>
  `;

  // "Try a different dish" goes back to search
  const tryDiffBtn = container.querySelector('#try-different-dish');
  if (tryDiffBtn) {
    const handler = () => setState({ currentView: 'home', results: null, error: null });
    tryDiffBtn.addEventListener('click', handler);
    tryDiffBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  }
}
