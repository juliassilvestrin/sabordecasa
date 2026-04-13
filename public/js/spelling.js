// Known Brazilian ingredients for client-side fuzzy matching
const KNOWN_INGREDIENTS = [
  'catupiry', 'requeijão', 'requeijao', 'batata palha', 'queijo coalho',
  'queijo minas', 'queijo minas frescal', 'polvilho', 'polvilho azedo', 'polvilho doce',
  'leite condensado', 'creme de leite', 'farofa', 'farinha de mandioca',
  'farinha de rosca', 'farinha de trigo', 'farinha', 'goiabada', 'goiabada cascão',
  'paçoca', 'pacoca', 'brigadeiro', 'beijinho', 'quindim',
  'guaraná', 'guarana', 'tucupi', 'dendê', 'dende', 'azeite de dendê', 'azeite de dende',
  'açaí', 'acai', 'tapioca', 'mandioca', 'aipim', 'macaxeira',
  'coxinha', 'pão de queijo', 'pao de queijo',
  'linguiça', 'linguica', 'calabresa', 'charque',
  'carne seca', 'feijão preto', 'feijao preto', 'feijão', 'feijao', 'rapadura',
  'leite de coco', 'coco ralado', 'colorau', 'urucum',
  'castanha de caju', 'castanha do pará', 'castanha do para',
  'maizena', 'amido de milho', 'queijo prato', 'queijo muçarela', 'queijo mussarela',
  'cream cheese', 'catupiri', 'requejão', 'requejao',
  'queijo colho', 'queijo coalgo', 'bata palha', 'batata pala',
  'polvilho asedo', 'goiabda', 'paçoa', 'mandioka', 'tapioka',
  'canjica', 'curau', 'pamonha', 'cocada', 'cuscuz', 'cuscuz paulista',
  'vinagrete', 'farofa de bacon', 'moqueca', 'cachaça', 'cachaca',
  'pimenta dedo de moça', 'pimenta dedo de moca', 'pimenta biquinho',
  'erva mate', 'erva-mate', 'chimichurri', 'sal grosso',
];

/**
 * Simple Levenshtein distance for fuzzy matching
 */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Strip diacritics for accent-insensitive comparison
 */
function stripAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Check if input is an exact or near-exact known ingredient.
 * Returns null if it's a known ingredient (no suggestion needed).
 * Returns the best match string if the input looks like a misspelling.
 */
export function checkSpelling(input) {
  const normalized = input.toLowerCase().trim();
  const normalizedStripped = stripAccents(normalized);

  // Exact match (with or without accents) — no suggestion needed
  for (const known of KNOWN_INGREDIENTS) {
    if (known === normalized || stripAccents(known) === normalizedStripped) {
      return null;
    }
  }

  // Find closest match using accent-stripped forms
  let bestMatch = null;
  let bestDist = Infinity;

  for (const known of KNOWN_INGREDIENTS) {
    const dist = levenshtein(normalizedStripped, stripAccents(known));
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = known;
    }
  }

  // Only suggest if the distance is small enough to be a plausible typo
  // Max 2 edits to reduce false positives
  const threshold = Math.min(2, Math.max(1, Math.ceil(normalized.length * 0.2)));

  if (bestDist > 0 && bestDist <= threshold) {
    // Capitalize first letter of each word for display
    return bestMatch.replace(/\b\w/g, c => c.toUpperCase());
  }

  return null;
}
