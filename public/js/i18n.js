const translations = {
  en: {
    // Header
    saved: 'Saved',
    back: 'Back',
    results: 'Results',

    // Home
    heroTitle: 'Find substitutes for ingredients from home',
    heroSubtitle: "Type what you need and what dish you're making",
    ingredientLabel: "Ingredient you can't find",
    ingredientPlaceholder: 'e.g. catupiry, requeijão...',
    dishLabel: "Dish you're making",
    dishPlaceholder: 'e.g. pastel, stroganoff...',
    searchBtn: 'Search',
    browseLabel: 'or browse popular ingredients',
    findSubstitutes: 'Find substitutes',

    // Loading
    loadingText: 'Finding your best substitute...',
    loadingSlowText: 'Still searching, almost there...',

    // Results
    optionsFound: (n) => `${n} option${n === 1 ? '' : 's'} found:`,

    // Detail tabs
    tabWhy: 'Why it Works',
    tabWhere: 'Where to Buy',
    tabHow: 'How to Use',
    limitations: 'Limitations:',
    storeAisle: 'Look in:',
    saveBtn: 'Save for later',
    savedBtn: 'Saved',

    // Context bar
    contextWith: (ingredient, dish) => `Substitute for <strong>${ingredient}</strong> in <strong>${dish}</strong>`,
    contextWithout: (ingredient) => `Substitute for <strong>${ingredient}</strong>`,

    // No substitute
    noSubTitle: 'No good substitute found',
    noSubWhat: 'What you could try instead',
    noSubOrder: (name) => `Order ${name.toLowerCase()} online`,
    noSubOrderSub: 'Find it on Amazon or Brazilian import stores',
    noSubDiff: 'Try a different dish',
    noSubDiffSub: 'Browse other recipes that work with US ingredients',

    // Error
    errorTitle: 'Something went wrong',
    errorMsg: "We couldn't load this page. Try refreshing or come back later.",
    errorBtn: 'Refresh Page',

    // Saved page
    savedTitle: 'Your Saved Substitutes',
    savedSubtitle: "Quick access to substitutes you've saved for later",
    savedEmptyLine1: "You haven't saved any substitutes yet.",
    savedEmptyLine2: 'Search for an ingredient and tap "Save for later" to bookmark it here.',
    savedSubstituteFor: 'Substitute for',
    savedIn: 'in',

    // Spelling
    spellingError: "We couldn't find that ingredient. Check your spelling?",
    spellingDidYouMean: 'Did you mean:',

    // Language toggle
    langToggle: 'PT',
  },

  pt: {
    // Header
    saved: 'Salvos',
    back: 'Voltar',
    results: 'Resultados',

    // Home
    heroTitle: 'Encontre substitutos para ingredientes de casa',
    heroSubtitle: 'Digite o que você precisa e qual prato está fazendo',
    ingredientLabel: 'Ingrediente que você não encontrou',
    ingredientPlaceholder: 'ex: catupiry, requeijão...',
    dishLabel: 'Prato que você está fazendo',
    dishPlaceholder: 'ex: pastel, stroganoff...',
    searchBtn: 'Buscar',
    browseLabel: 'ou explore ingredientes populares',
    findSubstitutes: 'Ver substitutos',

    // Loading
    loadingText: 'Encontrando o melhor substituto...',
    loadingSlowText: 'Ainda buscando, quase lá...',

    // Results
    optionsFound: (n) => `${n} opç${n === 1 ? 'ão' : 'ões'} encontrada${n === 1 ? '' : 's'}:`,

    // Detail tabs
    tabWhy: 'Por que funciona',
    tabWhere: 'Onde comprar',
    tabHow: 'Como usar',
    limitations: 'Limitações:',
    storeAisle: 'Procure em:',
    saveBtn: 'Salvar para depois',
    savedBtn: 'Salvo',

    // Context bar
    contextWith: (ingredient, dish) => `Substituto para <strong>${ingredient}</strong> em <strong>${dish}</strong>`,
    contextWithout: (ingredient) => `Substituto para <strong>${ingredient}</strong>`,

    // No substitute
    noSubTitle: 'Nenhum substituto encontrado',
    noSubWhat: 'O que você pode tentar',
    noSubOrder: (name) => `Pedir ${name.toLowerCase()} online`,
    noSubOrderSub: 'Encontre no Amazon ou lojas de importados brasileiros',
    noSubDiff: 'Tentar um prato diferente',
    noSubDiffSub: 'Veja receitas que funcionam com ingredientes dos EUA',

    // Error
    errorTitle: 'Algo deu errado',
    errorMsg: 'Não conseguimos carregar esta página. Tente recarregar ou volte mais tarde.',
    errorBtn: 'Recarregar página',

    // Saved page
    savedTitle: 'Seus Substitutos Salvos',
    savedSubtitle: 'Acesso rápido aos substitutos que você salvou',
    savedEmptyLine1: 'Você ainda não salvou nenhum substituto.',
    savedEmptyLine2: 'Busque um ingrediente e clique em "Salvar para depois" para guardar aqui.',
    savedSubstituteFor: 'Substituto para',
    savedIn: 'em',

    // Spelling
    spellingError: 'Não encontramos esse ingrediente. Verifique a ortografia?',
    spellingDidYouMean: 'Você quis dizer:',

    // Language toggle
    langToggle: 'EN',
  },
};

const LANG_KEY = 'sabordecasa_lang';

export function getLang() {
  return localStorage.getItem(LANG_KEY) || 'en';
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

export function toggleLang() {
  const next = getLang() === 'en' ? 'pt' : 'en';
  setLang(next);
  return next;
}

export function t(key, ...args) {
  const lang = getLang();
  const val = translations[lang][key];
  if (typeof val === 'function') return val(...args);
  return val ?? translations['en'][key] ?? key;
}

export function applyTranslations() {
  const lang = getLang();
  const tr = translations[lang];

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (tr[key] && typeof tr[key] === 'string') {
      el.textContent = tr[key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (tr[key]) el.placeholder = tr[key];
  });

  // Update lang toggle buttons
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.textContent = tr.langToggle;
    btn.setAttribute('aria-label', lang === 'en' ? 'Mudar para Português' : 'Switch to English');
  });

  // Update html lang attribute
  document.documentElement.lang = lang;
}
