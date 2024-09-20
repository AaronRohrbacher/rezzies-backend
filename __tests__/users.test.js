const request = require('supertest');
const { app } = require('../handler');  // Ensure the app is imported correctly

// describe('POST /users', () => {
//     it('should add a new user and return success', async () => {
//       const newUser = {
//         id: "1",
//         id: "123",
//         userId: "223",
//         name: "jimbos"
//       };
  
//       const response = await request(app)
//         .post('/users')  // Adjust to match the base path used
//         .set('Authorization', process.env.USER_AUTH_TOKEN)
//         .send(newUser);
  
//       expect(response.statusCode).toEqual(200);
//       expect(response.body).toEqual('success');
//     });
  
//     it('should return 400 if required fields are missing', async () => {
//       const incompleteUser = {
//         id: "1",
//         userId: "123",
//         // name is missing
//       };
  
//       const response = await request(app)
//         .post('/users')  // Adjust to match the base path used
//         .set('Authorization', process.env.USER_AUTH_TOKEN)
//         .send(incompleteUser);
  
//       expect(response.statusCode).toEqual(400);
//     });
//   });

  describe('GET /users/:userId', () => {
    it('reads one user from database', async () => {
      const user = {
        userId: "123",
      };
  
      const response = await request(app)
        .get(`/users/:${user.userId}`)  // Adjust to match the base path used
        .set('Authorization', process.env.USER_AUTH_TOKEN)
        .send();
  
    });
});

  