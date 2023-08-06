import { test } from '@japa/runner'
import ToDo from 'App/Models/ToDo';
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
  }
}

test.group('Todos', () => {
  const assert = new Assert()

  test('check unlogged user cannot fetch ToDos using GET', async ({ client }) => {
    const response = await client.get('/api/todos')
    response.assertStatus(401)
  })

  test('check logged in user can fetch ToDo using GET', async ({ client }) => {
    const loginResponse = await client.post('/api/login').form({ email: 'john.wick@continental.com', password: 'boogeyman' })
    const authUser: AuthUser = loginResponse.body()
    const response = await client.get(
      `/api/todos?userId=${authUser.user.id}&completed=0&order=desc`
    ).bearerToken(authUser.token.token)
    response.assertStatus(200)
    response.assertBodyContains({ toDos: [] })
    assert.isArray((response.body()).toDos)
  })

  test('check logged in user can POST new ToDo', async ({ client }) => {
    const loginResponse = await client.post('/api/login').form({ email: 'john.wick@continental.com', password: 'boogeyman' })
    const authUser: AuthUser = loginResponse.body()
    const response = await client.post('/api/todos').form({
      title: 'New Testing Todo',
      content: 'New Testing Todo Content',
      completed: 0,
      date: '2023-11-10',
      time: '10:00:00',
      due_date: '2023-11-10 10:00:00',
      user_id: authUser.user.id
    }).bearerToken(authUser.token.token)
    response.assertStatus(201)
    response.assertBodyContains({
      toDo: {
        title: 'New Testing Todo',
        content: 'New Testing Todo Content',
        completed: '0',
        user_id: String(authUser.user.id)
      }
    })
  })

  test('check logged in user can PUT an updated ToDo', async ({ client }) => {
    const loginResponse = await client.post('/api/login').form({ email: 'john.wick@continental.com', password: 'boogeyman' })
    const authUser: AuthUser = loginResponse.body()
    const todo = await ToDo.query().where('user_id', authUser.user.id).where('completed', 0).first()
    const response = await client.put(`/api/todos/${todo?.id}`).form({
      title: 'Updated Testing Todo',
      content: 'Updated Testing Todo Content',
      completed: 0,
      date: '2023-11-25',
      time: '12:30:00',
      due_date: '2023-11-25 12:30:00',
      user_id: authUser.user.id
    }).bearerToken(authUser.token.token)
    response.assertStatus(201)
    response.assertBodyContains({
      toDo: {
        title: 'Updated Testing Todo',
        content: 'Updated Testing Todo Content',
        completed: '0',
        user_id: String(authUser.user.id)
      }
    })
    const updatedToDoFromDb = await ToDo.find(todo?.id)
    assert.containsSubset(
      updatedToDoFromDb,
      {
        id: todo?.id,
        title: 'Updated Testing Todo',
        content: 'Updated Testing Todo Content',
        completed: 0,
        userId: authUser.user.id
      }
    )
  })

  test('check logged in user can DELETE a ToDo', async ({ client }) => {
    const loginResponse = await client.post('/api/login').form({ email: 'john.wick@continental.com', password: 'boogeyman' })
    const authUser: AuthUser = loginResponse.body()
    const todo = await ToDo.query().where('user_id', authUser.user.id).where('completed', 0).first()
    const response = await client.delete(`/api/todos/${todo?.id}`).bearerToken(authUser.token.token)
    response.assertStatus(200)
    response.assertBodyContains({
      toDo: {
        id: todo?.id,
        title: todo?.title,
        content: todo?.content,
        completed: todo?.completed,
        user_id: todo?.userId,
      }
    })
    const deletedUserFromDb = await ToDo.find(todo?.id)
    assert.isNull(deletedUserFromDb)
  })
})
