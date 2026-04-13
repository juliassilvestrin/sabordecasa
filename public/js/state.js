const state = {
  currentView: 'home',    // 'home' | 'loading' | 'results-list' | 'result-detail' | 'no-substitute' | 'error' | 'saved' | 'recipe-results'
  previousView: null,
  query: { ingredient: '', dish: '' },
  results: null,
  selectedSubstitute: null,
  error: null,
  recipeResults: null,
};

const listeners = [];

export function getState() {
  return { ...state };
}

export function setState(updates) {
  if (updates.currentView && updates.currentView !== state.currentView) {
    state.previousView = state.currentView;
  }
  Object.assign(state, updates);
  listeners.forEach(fn => fn(state));
}

export function subscribe(fn) {
  listeners.push(fn);
}

export function goBack() {
  if (state.currentView === 'result-detail' && state.results && state.results.substitutes && state.results.substitutes.length > 1) {
    setState({ currentView: 'results-list', selectedSubstitute: null });
  } else if (state.currentView === 'recipe-results') {
    setState({ currentView: 'home', recipeResults: null });
  } else if (state.currentView === 'saved') {
    // Go back to wherever we came from, default home
    const dest = state.previousView || 'home';
    setState({ currentView: dest === 'saved' ? 'home' : dest });
  } else {
    setState({ currentView: 'home', results: null, selectedSubstitute: null, error: null });
  }
}
