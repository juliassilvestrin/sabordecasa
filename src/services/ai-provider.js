function createProvider() {
  const providerName = process.env.AI_PROVIDER || 'openai';

  switch (providerName) {
    case 'openai':
      return require('./openai-provider');
    default:
      throw new Error(`Unknown AI provider: ${providerName}. Supported: openai`);
  }
}

module.exports = { createProvider };
