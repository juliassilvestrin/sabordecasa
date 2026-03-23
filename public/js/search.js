import { setState } from './state.js';
import { searchIngredient } from './api.js';

export function initSearch() {
  const form = document.getElementById('search-form');
  const ingredientInput = document.getElementById('search-ingredient');
  const dishInput = document.getElementById('search-dish');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ingredient = ingredientInput.value.trim();
    const dish = dishInput.value.trim();

    if (!ingredient) return;

    setState({
      currentView: 'loading',
      query: { ingredient, dish },
    });

    // Show "taking longer" message after 5 seconds
    const slowTimer = setTimeout(() => {
      const loadingText = document.querySelector('.loading-text');
      if (loadingText) loadingText.textContent = 'Still searching, almost there...';
    }, 5000);

    try {
      const result = await searchIngredient(ingredient, dish);
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
