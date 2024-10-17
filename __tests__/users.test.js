const request = require('supertest');
const { app } = require('../handler'); // Ensure the app is imported correctly

describe('POST /users', () => {
  afterEach(async () => {
    await request(app).delete('/users/223');
  });
  it('adds a user', async () => {
    const newUser = {
      userId: '223',
      name: 'jimbos',
    };
    const response = await request(app)
      .post('/users') // Adjust to match the base path used
      .set('Authorization', process.env.USER_AUTH_TOKEN)
      .send(newUser);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('success');
  });

  it('returns 400 if required fields are missing', async () => {
    const incompleteUser = {
      userId: '223',
    };
    const response = await request(app)
      .post('/users') // Adjust to match the base path used
      .set('Authorization', process.env.USER_AUTH_TOKEN)
      .send(incompleteUser);
    expect(response.statusCode).toEqual(400);
  });
});

describe('GET /users/:userId', () => {
  beforeEach(async () => {
    await request(app)
      .post('/users')
      .set('Authorization', process.env.USER_AUTH_TOKEN)
      .send({ userId: '224', name: 'aaron' });
  });
  afterEach(async () => {
    await request(app).delete('/users/224');
    console.log('FUCKAFTER')
  });
  it('reads a created user', async () => {
    response = await request(app).get('/users/224');
    console.log('FUCKDURING')
    expect(response.statusCode).toEqual(200);
  });
});

describe('PATCH /users/:userId', () => {
  beforeEach(async () => {
    await request(app).post('/users')
      .set('Authorization', process.env.USER_AUTH_TOKEN)
      .send({ userId: '225', name: 'aaron' });
  });
  afterEach(async () => {
    await request(app).delete('/users/225');
  });
  it('updates a user', async () => {
    response = await request(app)
      .patch('/users/225')
      .send({ name: 'fuckface' });
    compare = await request(app).get('/users/225');
    expect(response.statusCode).toEqual(200);
  });
});

describe('deletes a user', () => {
  beforeEach(async () => {
    await request(app).post('/users')
      .set('Authorization', process.env.USER_AUTH_TOKEN)
      .send({ userId: '226', name: 'aaron' });
  });
  it('deletes a user', async () => {
    response = await request(app).delete('/users/226');
    expect(response.statusCode).toEqual(200);
  });
});
