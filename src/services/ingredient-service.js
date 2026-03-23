const { createProvider } = require('./ai-provider');
const { buildSystemPrompt, buildUserMessage } = require('../prompts/ingredient-prompt');
const { parseAIResponse } = require('../utils/response-parser');

// Simple in-memory cache — same query returns the same result
const cache = new Map();

function getCacheKey(ingredient, dish) {
  return `${ingredient.toLowerCase()}::${(dish || '').toLowerCase()}`;
}

async function findSubstitutes(ingredient, dish) {
  const key = getCacheKey(ingredient, dish);

  if (cache.has(key)) {
    return cache.get(key);
  }

  const provider = createProvider();
  const systemPrompt = buildSystemPrompt();
  const userMessage = buildUserMessage(ingredient, dish);

  const rawResponse = await provider.complete(systemPrompt, userMessage);
  const result = parseAIResponse(rawResponse);

  cache.set(key, result);
  return result;
}

module.exports = { findSubstitutes };
