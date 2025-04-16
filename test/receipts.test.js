const request = require('supertest');
const app = require('../src/app');
const morningReceipt = require('../receipts/morning-receipt')
const simpleReceipt = require('../receipts/simple-receipt')
const noRetailerReceipt = require('../receipts/no-retailer-receipt')
const targetReceipt = require('../receipts/target-receipt')
const cornerMarketReceipt = require('../receipts/corner-market-receipt')

describe('Receipt Processor API', () => {
  let receiptId;
  let targetReceiptId
  let cornerMarketReceiptId

  // Test the POST /receipts/process endpoint
  test('POST /receipts/process - should process a valid receipt and return an ID', async () => {
    const validReceipt = morningReceipt

    const response = await request(app)
      .post('/api/v1/receipts/process')
      .send(validReceipt)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe("string");

    // Save the receipt ID for further testing.
    receiptId = response.body.id;
  });

  // Test the POST /receipts/process endpoint with target receipt
  test('POST /receipts/process - should process target receipt and return an ID', async () => {
    const validReceipt = targetReceipt

    const response = await request(app)
      .post('/api/v1/receipts/process')
      .send(validReceipt)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe("string");

    // Save the receipt ID for further testing.
    targetReceiptId = response.body.id;
  });

  // Test the POST /receipts/process endpoint with cornerMarket receipt
  test('POST /receipts/process - should process a corner market receipt and return an ID', async () => {
    const validReceipt = cornerMarketReceipt

    const response = await request(app)
      .post('/api/v1/receipts/process')
      .send(validReceipt)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe("string");

    // Save the receipt ID for further testing.
    cornerMarketReceiptId = response.body.id;
  });

  // Test the POST /receipts/process endpoint for no retailer field
  test('POST /receipts/process - should return an error if processing an invalid reciept', async () => {
    const invalidReceipt = noRetailerReceipt
    const response = await request(app)
      .post('/api/v1/receipts/process')
      .send(invalidReceipt)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(typeof response.body.error).toBe("string");
  });

  // Test the GET /receipts/:id/points endpoint on target receipt
  test('GET /receipts/:id/points - should return 28 points for target receipt', async () => {
    const response = await request(app)
      .get(`/api/v1/receipts/${targetReceiptId}/points`)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('points');
    expect(typeof response.body.points).toBe("number");
    expect(response.body.points).toBe(28)
  });

  // Test the GET /receipts/:id/points endpoint on corner market receipt
  test('GET /receipts/:id/points - should return 109 points for corner market receipt', async () => {
    const response = await request(app)
      .get(`/api/v1/receipts/${cornerMarketReceiptId}/points`)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('points');
    expect(typeof response.body.points).toBe("number");
    expect(response.body.points).toBe(109)
  });

  // Test the GET /receipts/:id/points endpoint on the targetReceipt
  test('GET /receipts/:id/points - should return the points awarded for a valid known receipt', async () => {
    const response = await request(app)
      .get(`/api/v1/receipts/${receiptId}/points`)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('points');
    expect(typeof response.body.points).toBe("number");
  });


  // Test error response for invalid receipt (missing required field)
  test('POST /receipts/process - invalid receipt should return 400', async () => {
    const invalidReceipt = {
      retailer: "M&M Corner Market",
      // Missing purchaseDate, purchaseTime, items, total
    };

    const response = await request(app)
      .post('/api/v1/receipts/process')
      .send(invalidReceipt)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/Please verify input\./);
  });

  // Test error response when receipt ID not found
  test('GET /receipts/:id/points - non-existent ID should return 404', async () => {
    const response = await request(app)
      .get('/api/v1/receipts/nonexistentID/points')
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});
