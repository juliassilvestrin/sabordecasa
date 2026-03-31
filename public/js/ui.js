import { subscribe, getState } from './state.js';
import { renderResultsList, renderResultDetail, renderNoSubstitute } from './results.js';
import { renderSavedList } from './saved-ui.js';
import { t } from './i18n.js';

const sections = {
  'home': document.getElementById('search-section'),
  'loading': document.getElementById('loading-section'),
  'results-list': document.getElementById('results-list-section'),
  'result-detail': document.getElementById('result-detail-section'),
  'no-substitute': document.getElementById('no-substitute-section'),
  'error': document.getElementById('error-section'),
  'saved': document.getElementById('saved-section'),
};

const headerHome = document.getElementById('header-home');
const headerSub = document.getElementById('header-sub');
const headerTitle = document.getElementById('header-title');
const contextBar = document.getElementById('context-bar');
const contextBarText = document.getElementById('context-bar-text');

function showView(viewName) {
  // Toggle sections
  Object.entries(sections).forEach(([key, el]) => {
    el.classList.toggle('hidden', key !== viewName);
  });

  // Toggle headers
  const isHome = viewName === 'home';
  headerHome.classList.toggle('hidden', !isHome);
  headerSub.classList.toggle('hidden', isHome);

  // Set header title
  if (viewName === 'saved') {
    headerTitle.textContent = 'Saved';
  } else {
    headerTitle.textContent = 'Results';
  }

  // Context bar — show on results/detail/no-substitute pages
  const state = getState();
  const showContext = ['results-list', 'result-detail', 'no-substitute'].includes(viewName);
  contextBar.classList.toggle('hidden', !showContext);

  if (showContext && state.query.ingredient) {
    const dish = state.query.dish;
    contextBarText.innerHTML = dish
      ? t('contextWith', state.query.ingredient, dish)
      : t('contextWithout', state.query.ingredient);
  }

  // Scroll to top on view change
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

subscribe((state) => {
  showView(state.currentView);

  const searchButton = document.getElementById('search-button');

  switch (state.currentView) {
    case 'home':
      searchButton.disabled = false;
      searchButton.textContent = t('searchBtn');
      break;

    case 'loading':
      searchButton.disabled = true;
      searchButton.textContent = t('searchBtn') + '...';
      document.querySelector('.loading-text').textContent = t('loadingText');
      break;

    case 'results-list': {
      const data = state.results;
      document.getElementById('results-count').textContent = t('optionsFound', data.substitutes.length);
      renderResultsList(document.getElementById('results-list'), data.substitutes);
      searchButton.disabled = false;
      searchButton.textContent = t('searchBtn');
      break;
    }

    case 'result-detail': {
      renderResultDetail(
        document.getElementById('result-detail'),
        state.selectedSubstitute,
        state.query.ingredient,
        state.query.dish
      );
      break;
    }

    case 'no-substitute': {
      renderNoSubstitute(document.getElementById('no-substitute-content'), state.results);
      searchButton.disabled = false;
      searchButton.textContent = t('searchBtn');
      break;
    }

    case 'error': {
      searchButton.disabled = false;
      searchButton.textContent = t('searchBtn');
      break;
    }

    case 'saved': {
      renderSavedList();
      break;
    }
  }
});
