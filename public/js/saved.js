const STORAGE_KEY = 'sabordecasa_saved';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSaved(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getSavedItems() {
  return loadSaved();
}

export function isSaved(substituteName, ingredient, dish) {
  const items = loadSaved();
  return items.some(
    i => i.substituteName === substituteName &&
         i.ingredient === ingredient &&
         i.dish === dish
  );
}

export function saveSubstitute(substitute, ingredient, dish) {
  const items = loadSaved();
  const exists = items.some(
    i => i.substituteName === substitute.name &&
         i.ingredient === ingredient &&
         i.dish === dish
  );
  if (exists) return;

  items.push({
    substituteName: substitute.name,
    ingredient,
    dish: dish || '',
    matchPercentage: substitute.matchPercentage,
    description: substitute.description,
    substitute,
  });
  persistSaved(items);
}

export function removeSaved(substituteName, ingredient, dish) {
  let items = loadSaved();
  items = items.filter(
    i => !(i.substituteName === substituteName &&
           i.ingredient === ingredient &&
           i.dish === dish)
  );
  persistSaved(items);
}

export function toggleSave(substitute, ingredient, dish) {
  if (isSaved(substitute.name, ingredient, dish)) {
    removeSaved(substitute.name, ingredient, dish);
    return false;
  }
  saveSubstitute(substitute, ingredient, dish);
  return true;
}
