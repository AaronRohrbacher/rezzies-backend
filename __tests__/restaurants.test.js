const request = require('supertest');
const { app } = require('../handler');  // Import the app, not the handler

describe('POST /restaurants', () => {
  it('should add a new restaurant and return success', async () => {
    const newRestaurant = {
      id: "1",
      userId: "123",
      restaurantId: "223",
      restaurantName: "jimbos"
    };

    // Use Supertest to make a POST request to the /restaurants endpoint
    const response = await request(app)
      .post('/restaurants')
      .send(newRestaurant);  // Send JSON body with the request

    expect(response.statusCode).toEqual(200);  // Check for success status
    expect(response.body).toEqual('success');  // Check for correct response body
  });
});
