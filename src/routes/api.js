const express = require('express');
const router = express.Router();
const { findSubstitutes } = require('../services/ingredient-service');

router.post('/search', async (req, res) => {
  const { ingredient, dish } = req.body;

  if (!ingredient || typeof ingredient !== 'string' || ingredient.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Please enter an ingredient name.',
    });
  }

  if (ingredient.trim().length > 200) {
    return res.status(400).json({
      status: 'error',
      message: 'Ingredient name is too long. Please keep it under 200 characters.',
    });
  }

  try {
    const result = await findSubstitutes(ingredient.trim(), dish?.trim());
    return res.json(result);
  } catch (error) {
    console.error('Search error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again.',
    });
  }
});

module.exports = router;
