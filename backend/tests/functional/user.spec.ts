import { test } from '@japa/runner'
import User from 'App/Models/User';
import { Assert } from '@japa/assert';

type AuthUser = {
  user: {
    id: number
    email: string
    name: string
    surname: string
    role: string
    remember_me_token: null,
    created_at: string
    updated_at: string
  },
  token: {
    type: string
    token: string
    expires_at: string
  },
  notifications: any[]
}

test.group('Users', () => {
  const assert = new Assert()

  test('check unlogged user cannot fetch users using GET', async ({ client }) => {
    const response = await client.get('/api/users')
    response.assertStatus(401)
  })

  test('check if logged in user whose role is not an admin cannot fetch users using GET', async ({ client }) => {
    const loginResponse = await client.post('/api/login').form({ email: 'john.wick@continental.com', password: 'boogeyman' })
    const authUser: AuthUser = loginResponse.body()
    const response = await client.get('/api/users?role=user&order=desc').bearerToken(authUser.token.token)
    response.assertStatus(401)
  })

  test('check logged in user whose role is an admin can fetch users using GET', async ({ client }) => {
    const loginResponse = await client.post('/api/login').form({ email: 'manager@continental.com', password: 'test' })
    const authUser: AuthUser = loginResponse.body()
    const response = await client.get('/api/users?role=user&order=desc').bearerToken(authUser.token.token)
    response.assertStatus(200)
    response.assertBodyContains({ users: [] })
  })

  test('check logged in user whose role is an admin can POST new users', async ({ client }) => {
    const loginResponse = await client.post('/api/login').form({ email: 'manager@continental.com', password: 'test' })
    const authUser: AuthUser = loginResponse.body()
    const response = await client.post('/api/users').form({
      email: 'new.user@company.com',
      name: 'New',
      surname: 'User',
      role: 'user',
      password: 'test'
    }).bearerToken(authUser.token.token)
    response.assertStatus(201)
    response.assertBodyContains({
      user: {
        email: 'new.user@company.com',
        name: 'New',
        surname: 'User',
        role: 'user',
      }
    })
  })

  test('check logged in user whose role is an admin can PUT and updated user', async ({ client }) => {
    const user = await User.query().where('role', 'user').first()
    const loginResponse = await client.post('/api/login').form({ email: 'manager@continental.com', password: 'test' })
    const authUser: AuthUser = loginResponse.body()
    const response = await client.put(`/api/users/${user?.id}`).form({
      email: 'updated.user@company.com',
      name: 'Updated',
      surname: 'UpdatedSurname',
      role: 'admin',
      password: 'secret'
    }).bearerToken(authUser.token.token)
    response.assertStatus(201)
    response.assertBodyContains({
      user: {
        email: 'updated.user@company.com',
        name: 'Updated',
        surname: 'UpdatedSurname',
        role: 'admin',
      }
    })
    const updatedUserFromDb = await User.find(user?.id)
    assert.containsSubset(
      updatedUserFromDb,
      {
        email: 'updated.user@company.com',
        name: 'Updated',
        surname: 'UpdatedSurname',
        role: 'admin',
      }
    )
  })

  test('check logged in user whose role is an admin can DELETE a user', async ({ client }) => {
    const user = await User.query().where('role', 'user').first()
    const loginResponse = await client.post('/api/login').form({ email: 'manager@continental.com', password: 'test' })
    const authUser: AuthUser = loginResponse.body()
    const response = await client.delete(`/api/users/${user?.id}`).bearerToken(authUser.token.token)
    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        email: user?.email,
        name: user?.name,
        surname: user?.surname,
        role: user?.role,
      }
    })
    const deletedUserFromDb = await User.find(user?.id)
    assert.isNull(deletedUserFromDb)
  })
})
