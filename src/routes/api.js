const express = require('express');
const router = express.Router();
const calculatePoints = require('../utils/points');

const receipts = {};

// POST /receipts/process: Process a receipt and return a generated ID.
router.post('/receipts/process', (req, res) => {
  const { retailer, purchaseDate, purchaseTime, items, total } = req.body;

  // validation (would be middleware in a larger server but for this it feels premature)
  if (!retailer || !purchaseDate || !purchaseTime || !items || !total) {
    return res.status(400).json({ error: "Bad Request. Please verify input." });
  }

  const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const points = calculatePoints({ retailer, purchaseDate, purchaseTime, total, items });
  receipts[id] = { ...req.body, points };

  res.status(200).json({ id });
});

// GET /receipts/:id/points: return points for the given receipt ID.
router.get('/receipts/:id/points', (req, res) => {
  const id = req.params.id;

  if (!receipts[id]) {
    return res.status(404).json({ error: "No receipt found for that ID." });
  }

  res.status(200).json({ points: receipts[id].points });
});

module.exports = router;
