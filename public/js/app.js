import { goBack, setState } from './state.js';
import { initSearch } from './search.js';
import './ui.js';

// Initialize search form
initSearch();

// Back buttons
document.getElementById('back-to-search').addEventListener('click', goBack);
document.getElementById('back-to-results').addEventListener('click', goBack);
document.getElementById('back-from-nosub').addEventListener('click', goBack);

// Error retry button
document.getElementById('error-retry').addEventListener('click', () => {
  setState({ currentView: 'home', error: null });
});
