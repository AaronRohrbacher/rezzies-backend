const request = require('supertest');
const { app } = require('../handler'); // Ensure the app is imported correctly

describe('POST /restaurants/:restaurantId/tables', () => {
  beforeEach(async () => {
    await request(app)
      .post('/restaurants')
      .send({ restaurantId: '224', restaurantName: 'aaron', userId: '4' });
  });
  afterEach(async () => {
    // await request(app).delete('/restaurants/224/tables/224')
    await request(app).delete('/restaurants/224');
  });
  it('adds a table', async () => {
    const newTable = {
      restaurantId: '224',
      tableId: '11',
      tableName: '1', 
    };

    const response = await request(app)
      .post(`/restaurants/${newTable.restaurantId}/tables`) // Adjust to match the base path used
      // .set('Authorization', process.env.USER_AUTH_TOKEN)
      .send(newTable);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('success');
  });

  it('returns 400 if required fields are missing', async () => {
    const incompleteRestaurant = {
      tableId: '223',
    };
    const response = await request(app)
      .post('/restaurants/224/tables') // Adjust to match the base path used
      // .set('Authorization', process.env.USER_AUTH_TOKEN)
      .send(incompleteRestaurant);
    expect(response.statusCode).toEqual(400);
  });
});

// describe('GET /restaurants/:restaurantId', () => {
//   beforeEach(async () => {
//     await request(app)
//       .post('/restaurants')
//       .send({ restaurantId: '224', restaurantName: 'aaron', userId: '4' });
//   });
//   afterEach(async () => {
//     await request(app).delete('/restaurants/224');
//   });
//   it('reads a created restaurant', async () => {
//     response = await request(app).get('/restaurants/224');
//     expect(response.statusCode).toEqual(200);
//   });
// });

// describe('PATCH /restaurants/:restaurantId', () => {
//   beforeEach(async () => {
//     await request(app)
//       .post('/restaurants')
//       .send({ restaurantId: '225', restaurantName: 'aaron', userId: '4' });
//   });
//   afterEach(async () => {
//     await request(app).delete('/restaurants/225');
//   });
//   it('updates a restaurant', async () => {
//     response = await request(app)
//       .patch('/restaurants/225')
//       .send({ name: 'fuckface' });
//     compare = await request(app).get('/restaurants/225');
//     expect(response.statusCode).toEqual(200);
//   });
// });

// describe('deletes a restaurant', () => {
//   beforeEach(async () => {
//     await request(app)
//       .post('/restaurants')
//       .send({ restaurantId: '226', restaurantName: 'aaron', userId: '4' });
//   });
//   it('deletes a restaurant', async () => {
//     response = await request(app).delete('/restaurants/226');
//     expect(response.statusCode).toEqual(200);
//   });
// });
