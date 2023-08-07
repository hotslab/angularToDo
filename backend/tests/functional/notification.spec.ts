import { test } from '@japa/runner'
import Notification from 'App/Models/Notification';
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

test.group('Notifications', () => {
  const assert = new Assert()

  test('check unlogged user cannot fetch Notifications using GET', async ({ client }) => {
    const response = await client.get('/api/notifications')
    response.assertStatus(401)
  })

  test('check logged in user can fetch Notifications using GET', async ({ client }) => {
    const loginResponse = await client.post('/api/login').form({ email: 'john.wick@continental.com', password: 'boogeyman' })
    const authUser: AuthUser = loginResponse.body()
    const response = await client.get(
      `/api/notifications?userId=${authUser.user.id}`
    ).bearerToken(authUser.token.token)
    response.assertStatus(200)
    response.assertBodyContains({ notifications: [] })
    assert.isArray((response.body()).notifications)
  })

  test('check logged in user can mark Notification as viewed by PUT', async ({ client }) => {
    const loginResponse = await client.post('/api/login').form({ email: 'john.wick@continental.com', password: 'boogeyman' })
    const authUser: AuthUser = loginResponse.body()
    const notification = await Notification.query().where('user_id', authUser.user.id).where('viewed', 0).first()
    const response = await client.put(`/api/notifications/${notification?.id}`).bearerToken(authUser.token.token)
    response.assertStatus(201)
    response.assertBodyContains({
      notification: {
        id: notification?.id,
        title: notification?.title,
        status: notification?.status,
        user_id: notification?.userId,
        to_do_id: notification?.toDoId
      }
    })
  })
})
