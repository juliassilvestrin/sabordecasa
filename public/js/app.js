import { goBack, setState, getState } from './state.js';
import { initSearch } from './search.js';
import { toggleLang, applyTranslations } from './i18n.js';
import './ui.js';

// Apply translations on load
applyTranslations();

// Language toggle buttons (both headers)
document.querySelectorAll('.lang-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    toggleLang();
    applyTranslations();
    // Re-trigger current view so dynamic strings (tabs, save btn, etc.) re-render
    setState({});
  });
});

// Initialize search form
initSearch();

// Header back button
document.getElementById('header-back').addEventListener('click', goBack);

// Saved navigation buttons (both header variants)
document.getElementById('nav-saved-home').addEventListener('click', () => {
  setState({ currentView: 'saved' });
});
document.getElementById('nav-saved-sub').addEventListener('click', () => {
  setState({ currentView: 'saved' });
});

// Error retry button
document.getElementById('error-retry').addEventListener('click', () => {
  setState({ currentView: 'home', error: null });
});

// Popular ingredient cards
document.querySelectorAll('.popular-card').forEach(card => {
  card.addEventListener('click', () => {
    const ingredient = card.dataset.ingredient;
    document.getElementById('search-ingredient').value = ingredient;
    document.getElementById('search-dish').value = '';
    document.getElementById('search-form').requestSubmit();
  });
});

// Logo click returns home
document.querySelector('.logo')?.addEventListener('click', (e) => {
  e.preventDefault();
  setState({ currentView: 'home', results: null, selectedSubstitute: null, error: null });
});
