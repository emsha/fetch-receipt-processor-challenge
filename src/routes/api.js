const express = require('express');
const router = express.Router();
const calculatePoints = require('../utils/points');

const receipts = {};

// POST /receipts/process: Process a receipt and return a generated ID.
router.post('/receipts/process', (req, res) => {
  const { retailer, purchaseDate, purchaseTime, items, total } = req.body;

  // Basic validation of required fields.
  if (!retailer || !purchaseDate || !purchaseTime || !items || !total) {
    return res.status(400).json({ error: "Bad Request. Please verify input." });
  }

  // Special testing case: Do not save receipts with this specific retailer.
  if (retailer === 'dont-save-me') {
    return res.status(500).json({ error: "special receipt, not save-able" });
  }

  // Generate a unique ID for the receipt.
  const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  // Calculate the points for this receipt.
  const points = calculatePoints({ retailer, purchaseDate, purchaseTime, total, items });

  // Save the receipt with points in the in-memory store.
  receipts[id] = { ...req.body, points };

  res.status(200).json({ id });
});

// GET /receipts/:id/points: Return the points for the given receipt ID.
router.get('/receipts/:id/points', (req, res) => {
  const id = req.params.id;

  if (!receipts[id]) {
    return res.status(404).json({ error: "No receipt found for that ID." });
  }

  res.status(200).json({ points: receipts[id].points });
});

module.exports = router;
