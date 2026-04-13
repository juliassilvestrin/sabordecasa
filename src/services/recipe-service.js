const { createProvider } = require('./ai-provider');
const { buildRecipeSystemPrompt, buildRecipeUserMessage } = require('../prompts/recipe-prompt');

async function findRecipeSubstitutes(recipe, lang = 'en') {
  const provider = createProvider();
  const systemPrompt = buildRecipeSystemPrompt();
  const userMessage = buildRecipeUserMessage(recipe, lang);
  const rawResponse = await provider.complete(systemPrompt, userMessage);
  try {
    const result = JSON.parse(rawResponse);
    if (!result.status) result.status = 'error';
    return result;
  } catch {
    return { status: 'error', message: 'Failed to parse AI response.' };
  }
}

module.exports = { findRecipeSubstitutes };
