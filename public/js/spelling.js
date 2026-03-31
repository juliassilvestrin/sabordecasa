// Known Brazilian ingredients for client-side fuzzy matching
const KNOWN_INGREDIENTS = [
  'catupiry', 'requeijão', 'requeijao', 'batata palha', 'queijo coalho',
  'queijo minas', 'polvilho', 'polvilho azedo', 'polvilho doce',
  'leite condensado', 'creme de leite', 'farofa', 'farinha de mandioca',
  'farinha de rosca', 'goiabada', 'paçoca', 'pacoca', 'brigadeiro',
  'guaraná', 'guarana', 'tucupi', 'dendê', 'dende', 'azeite de dendê',
  'açaí', 'acai', 'tapioca', 'mandioca', 'coxinha', 'pão de queijo',
  'pao de queijo', 'linguiça', 'linguica', 'calabresa', 'charque',
  'carne seca', 'feijão preto', 'feijao preto', 'rapadura',
  'leite de coco', 'coco ralado', 'colorau', 'urucum',
  'castanha de caju', 'castanha do pará', 'farinha de trigo',
  'maizena', 'amido de milho', 'queijo prato', 'queijo muçarela',
  'cream cheese', 'catupiri', 'requejão', 'requejao',
  'queijo colho', 'queijo coalgo', 'bata palha', 'batata pala',
  'polvilho asedo', 'goiabda', 'paçoa', 'mandioka', 'tapioka',
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
 * Check if input is an exact or near-exact known ingredient.
 * Returns null if it's a known ingredient (no suggestion needed).
 * Returns the best match string if the input looks like a misspelling.
 */
export function checkSpelling(input) {
  const normalized = input.toLowerCase().trim();

  // Exact match — no suggestion needed
  if (KNOWN_INGREDIENTS.includes(normalized)) {
    return null;
  }

  // Find closest match
  let bestMatch = null;
  let bestDist = Infinity;

  for (const known of KNOWN_INGREDIENTS) {
    const dist = levenshtein(normalized, known);
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = known;
    }
  }

  // Only suggest if the distance is small enough to be a plausible typo
  // Threshold: up to ~30% of the input length, minimum 1, max 3
  const threshold = Math.min(3, Math.max(1, Math.ceil(normalized.length * 0.3)));

  if (bestDist > 0 && bestDist <= threshold) {
    // Capitalize first letter of each word for display
    return bestMatch.replace(/\b\w/g, c => c.toUpperCase());
  }

  return null;
}
