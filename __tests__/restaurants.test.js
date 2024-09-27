const request = require('supertest');
const { app } = require('../handler'); // Ensure the app is imported correctly

describe('POST /restaurants', () => {
  afterEach(async () => {
    await request(app).delete('/restaurants/223');
  });
  it('adds a restaurant', async () => {
    const newRestaurant = {
      restaurantId: '223',
      restaurantName: 'jimbos',
      userId: '2',
    };

    const response = await request(app)
      .post('/restaurants') // Adjust to match the base path used
      // .set('Authorization', process.env.USER_AUTH_TOKEN)
      .send(newRestaurant);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('success');
  });

  it('returns 400 if required fields are missing', async () => {
    const incompleteRestaurant = {
      restaurantId: '223',
    };
    const response = await request(app)
      .post('/restaurants') // Adjust to match the base path used
      // .set('Authorization', process.env.USER_AUTH_TOKEN)
      .send(incompleteRestaurant);
    expect(response.statusCode).toEqual(400);
  });
});

describe('GET /restaurants/:restaurantId', () => {
  beforeEach(async () => {
    await request(app)
      .post('/restaurants')
      .send({ restaurantId: '224', restaurantName: 'aaron', userId: '4' });
  });
  afterEach(async () => {
    await request(app).delete('/restaurants/224');
  });
  it('reads a created restaurant', async () => {
    response = await request(app).get('/restaurants/224');
    expect(response.statusCode).toEqual(200);
  });
});

describe('PATCH /restaurants/:restaurantId', () => {
  beforeEach(async () => {
    await request(app)
      .post('/restaurants')
      .send({ restaurantId: '225', restaurantName: 'aaron', userId: '4' });
  });
  afterEach(async () => {
    await request(app).delete('/restaurants/225');
  });
  it('updates a restaurant', async () => {
    response = await request(app)
      .patch('/restaurants/225')
      .send({ name: 'fuckface' });
    compare = await request(app).get('/restaurants/225');
    expect(response.statusCode).toEqual(200);
  });
});

describe('deletes a restaurant', () => {
  beforeEach(async () => {
    await request(app)
      .post('/restaurants')
      .send({ restaurantId: '226', restaurantName: 'aaron', userId: '4' });
  });
  it('deletes a restaurant', async () => {
    response = await request(app).delete('/restaurants/226');
    expect(response.statusCode).toEqual(200);
  });
});
