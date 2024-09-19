// test/restaurants.test.js
const request = require('supertest');
const { app } = require('../handler');  // Ensure the app is imported correctly

describe('POST /restaurants', () => {
  it('should add a new restaurant and return success', async () => {
    const newRestaurant = {
      id: "1",
      userId: "123",
      restaurantId: "223",
      restaurantName: "jimbos"
    };

    const response = await request(app)
      .post('/restaurants')  // Adjust to match the base path used
      .send(newRestaurant);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('success');
  });

  it('should return 400 if required fields are missing', async () => {
    const incompleteRestaurant = {
      id: "1",
      userId: "123",
      restaurantId: "223"
      // restaurantName is missing
    };

    const response = await request(app)
      .post('/restaurants')  // Adjust to match the base path used
      .send(incompleteRestaurant);

    expect(response.statusCode).toEqual(400);
    expect(response.body.error).toEqual('Missing required fields: id, userId, restaurantId, and restaurantName are all required.');
  });
});
