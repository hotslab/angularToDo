import Logger from '@ioc:Adonis/Core/Logger'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import ToDo from 'App/Models/ToDo'
import { usersToCreate, perkinsToDos, wickToDos, adminsToCreate } from 'Database/dummy'

export default class UserSeeder extends BaseSeeder {

  public async run() {
    Logger.info('Starting seeding...')
    const admins = await User.updateOrCreateMany('email', adminsToCreate)
    Logger.info(`${admins.length} admins have been ceated or updated.`)
    const users = await User.updateOrCreateMany('email', usersToCreate)
    Logger.info(`${users.length} users have been ceated or updated.`)
    for (const user of users) {
      let toDos: Record<string, any>[] = []
      if (user.email === 'john.wick@continental.com') toDos = wickToDos.map((a, i) => { return { ...a, user_id: user.id } }, [])
      if (user.email === 'perkins@continental.com') toDos = perkinsToDos.map(a => { return { ...a, user_id: user.id } }, [])
      const newTodos = await ToDo.updateOrCreateMany('title', toDos as any)
      Logger.info(`${newTodos.length} todos have been ceated or updated for ${user.email}.`)
    }
    Logger.info(`Seeding finished successfully`)
  }
}
