const app = require('../src/app')

describe('App', () => {
  it('GET / responds with 200 containing "hello from restaurant finder!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'hello from restaurant finder!')
  })
})