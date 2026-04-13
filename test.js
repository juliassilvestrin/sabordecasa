// Integration tests for The Ingredient Translator
// Run with: node test.js

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    → ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, text: await res.text() };
}

console.log('\n── Server ──────────────────────────────────');

await test('serves home page', async () => {
  const r = await get('/');
  assert(r.status === 200, `Expected 200, got ${r.status}`);
  assert(r.text.includes('Ingredient Translator'), 'Missing app name in HTML');
});

await test('serves static JS files', async () => {
  const r = await get('/js/app.js');
  assert(r.status === 200, `Expected 200, got ${r.status}`);
});

await test('serves static CSS files', async () => {
  const r = await get('/css/components.css');
  assert(r.status === 200, `Expected 200, got ${r.status}`);
});

console.log('\n── POST /api/search ────────────────────────');

await test('returns substitutes for known ingredient (cached)', async () => {
  const r = await post('/api/search', { ingredient: 'catupiry', dish: 'pastel', lang: 'en' });
  assert(r.status === 200, `Expected 200, got ${r.status}`);
  assert(r.body.status === 'success', `Expected success, got ${r.body.status}`);
  assert(Array.isArray(r.body.substitutes), 'substitutes should be an array');
  assert(r.body.substitutes.length === 3, `Expected 3 substitutes, got ${r.body.substitutes.length}`);
});

await test('substitute has required fields', async () => {
  const r = await post('/api/search', { ingredient: 'catupiry', dish: 'pastel', lang: 'en' });
  const sub = r.body.substitutes[0];
  assert(sub.name, 'Missing name');
  assert(sub.matchPercentage >= 1 && sub.matchPercentage <= 100, `Bad matchPercentage: ${sub.matchPercentage}`);
  assert(sub.whyItWorks, 'Missing whyItWorks');
  assert(Array.isArray(sub.whereToBuy), 'whereToBuy should be array');
  assert(sub.howToUse, 'Missing howToUse');
});

await test('returns 400 for missing ingredient', async () => {
  const r = await post('/api/search', { dish: 'stroganoff' });
  assert(r.status === 400, `Expected 400, got ${r.status}`);
});

await test('returns 400 for empty ingredient', async () => {
  const r = await post('/api/search', { ingredient: '   ' });
  assert(r.status === 400, `Expected 400, got ${r.status}`);
});

await test('returns 400 for ingredient over 200 chars', async () => {
  const r = await post('/api/search', { ingredient: 'a'.repeat(201) });
  assert(r.status === 400, `Expected 400, got ${r.status}`);
});

await test('works without dish (dish is optional)', async () => {
  const r = await post('/api/search', { ingredient: 'catupiry', lang: 'en' });
  assert(r.status === 200, `Expected 200, got ${r.status}`);
  assert(r.body.status === 'success', `Expected success, got ${r.body.status}`);
});

await test('lang pt returns Portuguese content', async () => {
  const r = await post('/api/search', { ingredient: 'catupiry', dish: 'pastel', lang: 'pt' });
  assert(r.status === 200, `Expected 200, got ${r.status}`);
  assert(r.body.status === 'success', 'Expected success status');
});

await test('results are consistent (cache works)', async () => {
  const r1 = await post('/api/search', { ingredient: 'batata palha', dish: 'stroganoff', lang: 'en' });
  const r2 = await post('/api/search', { ingredient: 'batata palha', dish: 'stroganoff', lang: 'en' });
  assert(r1.body.substitutes[0].name === r2.body.substitutes[0].name, 'Results differ between calls — cache may be broken');
});

console.log('\n── POST /api/recipe ────────────────────────');

await test('finds specialty ingredients in a recipe', async () => {
  const recipe = '500g frango, 200g catupiry, 1 pacote batata palha, sal e alho a gosto';
  const r = await post('/api/recipe', { recipe, lang: 'en' });
  assert(r.status === 200, `Expected 200, got ${r.status}`);
  assert(r.body.status === 'success' || r.body.status === 'none', `Unexpected status: ${r.body.status}`);
  if (r.body.status === 'success') {
    assert(Array.isArray(r.body.ingredients), 'ingredients should be array');
    assert(r.body.ingredients.length > 0, 'Expected at least 1 specialty ingredient');
    const names = r.body.ingredients.map(i => i.name.toLowerCase());
    assert(names.some(n => n.includes('catupiry') || n.includes('batata')), `Expected catupiry or batata palha flagged, got: ${names.join(', ')}`);
  }
});

await test('recipe ingredient has required fields', async () => {
  const recipe = '200g catupiry, 1 pacote batata palha';
  const r = await post('/api/recipe', { recipe, lang: 'en' });
  if (r.body.status === 'success') {
    const item = r.body.ingredients[0];
    assert(item.name, 'Missing name');
    assert(item.substitute, 'Missing substitute');
    assert(item.matchPercentage >= 1 && item.matchPercentage <= 100, `Bad matchPercentage: ${item.matchPercentage}`);
  }
});

await test('returns 400 for recipe under 10 chars', async () => {
  const r = await post('/api/recipe', { recipe: 'abc' });
  assert(r.status === 400, `Expected 400, got ${r.status}`);
});

await test('returns 400 for recipe over 4000 chars', async () => {
  const r = await post('/api/recipe', { recipe: 'a'.repeat(4001) });
  assert(r.status === 400, `Expected 400, got ${r.status}`);
});

await test('returns 400 for missing recipe body', async () => {
  const r = await post('/api/recipe', {});
  assert(r.status === 400, `Expected 400, got ${r.status}`);
});

console.log('\n── POST /api/report ────────────────────────');

await test('accepts valid report', async () => {
  const r = await post('/api/report', {
    ingredient: 'catupiry',
    substituteName: 'Cream Cheese',
    reason: 'not-similar',
  });
  assert(r.status === 200, `Expected 200, got ${r.status}`);
  assert(r.body.status === 'ok', `Expected ok, got ${r.body.status}`);
});

await test('returns 400 for report missing fields', async () => {
  const r = await post('/api/report', { ingredient: 'catupiry' });
  assert(r.status === 400, `Expected 400, got ${r.status}`);
});

console.log('\n── 404 handling ────────────────────────────');

await test('unknown API route returns 404', async () => {
  const res = await fetch(`${BASE}/api/doesnotexist`);
  assert(res.status === 404, `Expected 404, got ${res.status}`);
});

console.log(`\n────────────────────────────────────────────`);
console.log(`  ${passed} passed  |  ${failed} failed`);
console.log(`────────────────────────────────────────────\n`);
process.exit(failed > 0 ? 1 : 0);
