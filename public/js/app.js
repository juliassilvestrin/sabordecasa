import { goBack, setState, getState } from './state.js';
import { initSearch } from './search.js';
import { toggleLang, applyTranslations, getLang, t } from './i18n.js';
import { searchIngredient, searchRecipe } from './api.js';
import './ui.js';

// Apply translations on load
applyTranslations();

// Language toggle buttons (both headers)
document.querySelectorAll('.lang-toggle').forEach(btn => {
  btn.addEventListener('click', async () => {
    const lang = toggleLang();
    applyTranslations();

    const state = getState();
    const refetchViews = ['results-list', 'result-detail'];

    if (refetchViews.includes(state.currentView) && state.query?.ingredient) {
      // Re-fetch results in new language
      setState({ currentView: 'loading' });
      try {
        const result = await searchIngredient(state.query.ingredient, state.query.dish, lang);
        if (result.status === 'success') {
          if (result.substitutes.length === 1) {
            setState({ currentView: 'result-detail', results: result, selectedSubstitute: result.substitutes[0] });
          } else {
            setState({ currentView: 'results-list', results: result });
          }
        } else if (result.status === 'no_substitute') {
          setState({ currentView: 'no-substitute', results: result });
        } else {
          setState({ currentView: 'error', error: result.message || 'Something went wrong.' });
        }
      } catch (err) {
        setState({ currentView: 'error', error: err?.data?.message || 'Something went wrong.' });
      }
    } else {
      setState({});
    }
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

// Recipe mode toggle
const recipeToggleBtn = document.getElementById('recipe-toggle-btn');
const recipeInputSection = document.getElementById('recipe-input-section');

recipeToggleBtn?.addEventListener('click', () => {
  const isOpen = !recipeInputSection.classList.contains('hidden');
  recipeInputSection.classList.toggle('hidden', isOpen);
  recipeToggleBtn.querySelector('.recipe-toggle-label').textContent = isOpen ? t('recipeModeBtn') : t('recipeHideModeBtn');
  recipeToggleBtn.setAttribute('aria-expanded', String(!isOpen));
  if (!isOpen) document.getElementById('recipe-textarea')?.focus();
});

// Recipe search
document.getElementById('recipe-search-btn')?.addEventListener('click', async () => {
  const recipe = document.getElementById('recipe-textarea')?.value.trim();
  if (!recipe) return;

  setState({ currentView: 'loading' });
  requestAnimationFrame(() => {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) loadingText.textContent = t('recipeLoadingText');
  });

  try {
    const result = await searchRecipe(recipe, getLang());
    if (result.status === 'success' || result.status === 'none') {
      setState({ currentView: 'recipe-results', recipeResults: result });
    } else {
      setState({ currentView: 'error', error: result.message || 'Something went wrong.' });
    }
  } catch (err) {
    setState({ currentView: 'error', error: 'Something went wrong. Please try again.' });
  }
});
