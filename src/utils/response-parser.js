function parseAIResponse(rawText) {
  let cleaned = rawText.trim();

  // Strip markdown code fences if the AI added them
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    return {
      status: 'error',
      message: 'We had trouble processing the response. Please try again.',
    };
  }

  if (!parsed.status) {
    return {
      status: 'error',
      message: 'We received an unexpected response. Please try again.',
    };
  }

  // Normalize match percentages
  if (parsed.substitutes) {
    parsed.substitutes.forEach(sub => {
      sub.matchPercentage = Math.min(100, Math.max(1, Math.round(sub.matchPercentage)));
    });
    parsed.substitutes.sort((a, b) => a.rank - b.rank);
  }

  return parsed;
}

module.exports = { parseAIResponse };
