import { test } from '@japa/runner'

test.group('Auth', () => {

  test('should login existing user using POST', async ({ client }) => {
    const response = await client.post('/api/login').form({ email: 'john.wick@continental.com', password: 'boogeyman' })
    response.assertStatus(201)
    response.assertBodyContains({
      user: {
        email: 'john.wick@continental.com'
      },
      token: {}
    })
  })

  test('should register new user using POST', async ({ client }) => {
    const response = await client.post('/api/register').form({
      email: 'mr.nobody@continental.com',
      name: 'Mr',
      surname: 'Nobody',
      password: 'test'
    })
    response.assertStatus(201)
    response.assertBodyContains({
      user: {
        email: 'mr.nobody@continental.com',
        name: 'Mr',
        surname: 'Nobody',
      },
      token: {}
    })
  })
})
