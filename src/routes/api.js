const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { findSubstitutes } = require('../services/ingredient-service');

const REPORTS_FILE = path.join(__dirname, '../../reports.json');

function appendReport(report) {
  let reports = [];
  try {
    if (fs.existsSync(REPORTS_FILE)) {
      reports = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
    }
  } catch {}
  reports.push(report);
  try {
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
  } catch {}
}

router.post('/search', async (req, res) => {
  const { ingredient, dish, lang } = req.body;

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
    const result = await findSubstitutes(ingredient.trim(), dish?.trim(), lang || 'en');
    return res.json(result);
  } catch (error) {
    console.error('Search error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again.',
    });
  }
});

router.post('/report', (req, res) => {
  const { ingredient, dish, substituteName, reason } = req.body;
  if (!ingredient || !substituteName || !reason) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
  }
  appendReport({
    ingredient,
    dish: dish || null,
    substituteName,
    reason,
    timestamp: new Date().toISOString(),
  });
  return res.json({ status: 'ok' });
});

module.exports = router;
