const app = require('../src/app')

describe('App', () => {
  it('GET / responds with 200 containing "hello from Restaurant Finder!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'hello from Restaurant Finder!')
  })
})