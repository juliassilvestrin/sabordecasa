const state = {
  currentView: 'home',    // 'home' | 'loading' | 'results-list' | 'result-detail' | 'no-substitute' | 'error'
  previousView: null,
  query: { ingredient: '', dish: '' },
  results: null,
  selectedSubstitute: null,
  error: null,
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
  if (state.currentView === 'result-detail' && state.results && state.results.substitutes.length > 1) {
    setState({ currentView: 'results-list', selectedSubstitute: null });
  } else {
    setState({ currentView: 'home', results: null, selectedSubstitute: null, error: null });
  }
}
