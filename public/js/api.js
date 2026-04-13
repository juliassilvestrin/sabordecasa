export async function searchIngredient(ingredient, dish, lang = 'en') {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredient, dish: dish || undefined, lang }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}

export async function searchRecipe(recipe, lang = 'en') {
  const response = await fetch('/api/recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe, lang }),
  });
  const data = await response.json();
  if (!response.ok) throw { status: response.status, data };
  return data;
}

export async function reportSubstitute({ ingredient, dish, substituteName, reason }) {
  try {
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredient, dish, substituteName, reason }),
    });
  } catch (_) { /* best effort */ }
}
