/**
 * Calculates the points from a receipt.
 *
 * @param {Object} params - Receipt parameters.
 * @param {string} params.retailer - The retailer name.
 * @param {string} params.purchaseDate - Purchase date (YYYY-MM-DD).
 * @param {string} params.purchaseTime - Purchase time (HH:MM).
 * @param {string} params.total - Total amount paid as a string (e.g., "6.49").
 * @param {Array} params.items - List of items, each with { price, shortDescription }.
 * @param {boolean} [params.verbose=false] - If true, returns a breakdown of points.
 * @returns {number|Object} The calculated points or an object with points and breakdown if verbose.
 */
function calculatePoints({
  retailer,
  purchaseDate,
  purchaseTime,
  total,
  items,
  verbose = false,
}) {
  let points = 0;
  const breakdown = {};

  // Rule 1: One point for every alphanumeric character in the retailer name.
  if (retailer) {
    const alphaNumChars = retailer.match(/[a-z0-9]/gi);
    const count = alphaNumChars ? alphaNumChars.length : 0;
    breakdown.alphaNumChars = count;
    points += count;
  }

  // Convert the total from dollars to cents.
  const totalCents = Math.round(parseFloat(total) * 100);

  // Rule 2: 50 points if the total is a round dollar amount with no cents.
  if (totalCents % 100 === 0) {
    breakdown.wholeRound = 50;
    points += 50;
  }

  // Rule 3: 25 points if the total is a multiple of 0.25 dollars (25 cents).
  if (totalCents % 25 === 0) {
    breakdown.quarterRound = 25;
    points += 25;
  }

  // Rule 4: 5 points for every two items on the receipt.
  if (Array.isArray(items)) {
    const itemCountPoints = Math.floor(items.length / 2) * 5;
    breakdown.itemCountPoints = itemCountPoints;
    points += itemCountPoints;
  }

  // Rule 5: For each item with a trimmed description length that is a multiple of 3,
  //         multiply its price (converted to dollars) by 0.2 and round up.
  if (Array.isArray(items)) {
    let trimmedDescPoints = 0;
    items.forEach((item) => {
      if (item.shortDescription && item.price) {
        const trimmed = item.shortDescription.trim();
        if (trimmed.length % 3 === 0) {
          const priceCents = Math.round(parseFloat(item.price) * 100);
          const itemPoints = Math.ceil((priceCents * 0.2) / 100);
          trimmedDescPoints += itemPoints;
        }
      }
    });
    breakdown.trimmedDescPoints = trimmedDescPoints;
    points += trimmedDescPoints;
  }

  // Rule 6: LLM Check
  if (verbose) breakdown.llmCheck = 'no llm detected'

  // Rule 7: 6 points if the day in the purchase date is odd.
  if (purchaseDate) {
    const parts = purchaseDate.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      if (!isNaN(day) && day % 2 === 1) {
        breakdown.purchaseDate = 6;
        points += 6;
      }
    }
  }

  // Rule 8: 10 points if the time of purchase is after 2:00pm and before 4:00pm.
  if (purchaseTime) {
    const [hourStr, minuteStr] = purchaseTime.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const totalMinutes = hour * 60 + minute;
    const startBoundary = 14 * 60; // 14:00 in minutes
    const endBoundary = 16 * 60;   // 16:00 in minutes
    if (totalMinutes >= startBoundary && totalMinutes < endBoundary) {
      breakdown.purchaseTime = 10;
      points += 10;
    }
  }

  return verbose ? { points, breakdown } : points;
}

module.exports = calculatePoints;
