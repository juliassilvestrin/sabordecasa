import { subscribe, getState } from './state.js';
import { renderIngredientInfo, renderResultsList, renderResultDetail, renderNoSubstitute } from './results.js';

const sections = {
  'home': document.getElementById('search-section'),
  'loading': document.getElementById('loading-section'),
  'results-list': document.getElementById('results-list-section'),
  'result-detail': document.getElementById('result-detail-section'),
  'no-substitute': document.getElementById('no-substitute-section'),
  'error': document.getElementById('error-section'),
};

function showView(viewName) {
  Object.entries(sections).forEach(([key, el]) => {
    if (key === 'home') {
      // Hide search section when showing results/loading, show on home
      el.classList.toggle('hidden', viewName !== 'home');
    } else {
      el.classList.toggle('hidden', key !== viewName);
    }
  });

  // Scroll to top on view change
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

subscribe((state) => {
  showView(state.currentView);

  const searchButton = document.getElementById('search-button');

  switch (state.currentView) {
    case 'home':
      searchButton.disabled = false;
      searchButton.textContent = 'Find Substitutes';
      break;

    case 'loading':
      searchButton.disabled = true;
      searchButton.textContent = 'Searching...';
      document.querySelector('.loading-text').textContent = 'Finding your best substitute...';
      break;

    case 'results-list': {
      const data = state.results;
      renderIngredientInfo(document.getElementById('original-ingredient-info'), data.originalIngredient);
      document.getElementById('results-count').textContent = `${data.substitutes.length} options found:`;
      renderResultsList(document.getElementById('results-list'), data.substitutes);
      searchButton.disabled = false;
      searchButton.textContent = 'Find Substitutes';
      break;
    }

    case 'result-detail': {
      renderResultDetail(document.getElementById('result-detail'), state.selectedSubstitute);
      break;
    }

    case 'no-substitute': {
      renderNoSubstitute(document.getElementById('no-substitute-content'), state.results);
      searchButton.disabled = false;
      searchButton.textContent = 'Find Substitutes';
      break;
    }

    case 'error': {
      searchButton.disabled = false;
      searchButton.textContent = 'Find Substitutes';
      break;
    }
  }
});
