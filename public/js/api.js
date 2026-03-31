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
