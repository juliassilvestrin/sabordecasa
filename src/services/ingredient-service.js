const fs = require('fs');
const path = require('path');
const { createProvider } = require('./ai-provider');
const { buildSystemPrompt, buildUserMessage } = require('../prompts/ingredient-prompt');
const { parseAIResponse } = require('../utils/response-parser');

// Persistent file-based cache so results are consistent across server restarts
const CACHE_FILE = path.join(__dirname, '../../.cache.json');

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch {}
}

const cache = loadCache();

function getCacheKey(ingredient, dish, lang) {
  return `${ingredient.toLowerCase()}::${(dish || '').toLowerCase()}::${lang}`;
}

async function findSubstitutes(ingredient, dish, lang = 'en') {
  const key = getCacheKey(ingredient, dish, lang);

  if (cache[key]) {
    return cache[key];
  }

  const provider = createProvider();
  const systemPrompt = buildSystemPrompt();
  const userMessage = buildUserMessage(ingredient, dish, lang);
  const rawResponse = await provider.complete(systemPrompt, userMessage);
  const result = parseAIResponse(rawResponse);

  cache[key] = result;
  saveCache(cache);
  return result;
}

module.exports = { findSubstitutes };
