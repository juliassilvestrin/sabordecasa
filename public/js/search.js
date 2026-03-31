import { setState } from './state.js';
import { searchIngredient } from './api.js';
import { checkSpelling } from './spelling.js';
import { t, getLang } from './i18n.js';

export function initSearch() {
  const form = document.getElementById('search-form');
  const ingredientInput = document.getElementById('search-ingredient');
  const dishInput = document.getElementById('search-dish');
  const fieldGroup = document.getElementById('ingredient-field-group');
  const errorEl = document.getElementById('ingredient-error');
  const spellingEl = document.getElementById('spelling-suggestion');
  const spellingBtn = document.getElementById('spelling-btn');
  const spellingText = document.getElementById('spelling-text');
  const spellingDidYouMean = document.querySelector('.spelling-suggestion > span');

  function clearSpellingError() {
    fieldGroup.classList.remove('has-error');
    errorEl.classList.add('hidden');
    spellingEl.classList.add('hidden');
  }

  // Clear error when user types
  ingredientInput.addEventListener('input', clearSpellingError);

  // Spelling suggestion click — fill in the suggestion and submit
  spellingBtn.addEventListener('click', () => {
    ingredientInput.value = spellingText.textContent;
    clearSpellingError();
    form.requestSubmit();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearSpellingError();

    const ingredient = ingredientInput.value.trim();
    const dish = dishInput.value.trim();

    if (!ingredient) {
      ingredientInput.focus();
      return;
    }

    // Client-side spelling check
    const suggestion = checkSpelling(ingredient);
    if (suggestion && suggestion.toLowerCase() !== ingredient.toLowerCase()) {
      fieldGroup.classList.add('has-error');
      document.getElementById('ingredient-error-text').textContent = t('spellingError');
      errorEl.classList.remove('hidden');
      if (spellingDidYouMean) spellingDidYouMean.textContent = t('spellingDidYouMean');
      spellingText.textContent = suggestion;
      spellingEl.classList.remove('hidden');
      ingredientInput.focus();
      return;
    }

    setState({
      currentView: 'loading',
      query: { ingredient, dish },
    });

    // Show "taking longer" message after 5 seconds
    const slowTimer = setTimeout(() => {
      const loadingText = document.querySelector('.loading-text');
      if (loadingText) loadingText.textContent = t('loadingSlowText');
    }, 5000);

    try {
      const result = await searchIngredient(ingredient, dish, getLang());
      clearTimeout(slowTimer);

      if (result.status === 'success') {
        if (result.substitutes.length === 1) {
          setState({
            currentView: 'result-detail',
            results: result,
            selectedSubstitute: result.substitutes[0],
          });
        } else {
          setState({
            currentView: 'results-list',
            results: result,
          });
        }
      } else if (result.status === 'no_substitute') {
        setState({
          currentView: 'no-substitute',
          results: result,
        });
      } else {
        setState({
          currentView: 'error',
          error: result.message || 'Something went wrong.',
        });
      }
    } catch (err) {
      clearTimeout(slowTimer);
      setState({
        currentView: 'error',
        error: err?.data?.message || 'Something went wrong. Please try again.',
      });
    }
  });
}
