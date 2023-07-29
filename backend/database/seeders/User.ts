import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import ToDo from 'App/Models/ToDo'
import { Roles } from 'Contracts/enums'
import { DateTime } from 'luxon'

export default class UserSeeder extends BaseSeeder {

  public async run() {

    const usersToCreate = [
      {
        email: 'admin@continental.com',
        name: 'Winston',
        surname: 'Scott',
        role: Roles.ADMIN,
        password: 'secret'
      },
      {
        email: 'john.wick@continental.com',
        name: 'John',
        surname: 'Wick',
        role: Roles.USER,
        password: 'boogeyman'
      }
    ]

    const users = await User.updateOrCreateMany('email', usersToCreate)

    if (users) {
      const user = await User.findBy('email', 'john.wick@continental.com')
      if (user) {
        const toDosToCreate = [
          {
            user_id: user.id,
            title: 'Meeting with Winston',
            content: 'Table 1 in the continental. Dress formaly.',
            due_date: DateTime.local().plus({ hours: 2 })
          },
          {
            user_id: user.id,
            title: 'Appointment with the  Sommelier',
            content: 'Get a tasting with the latest brands and a quality perusal of the cutlery on offer.',
            due_date: DateTime.local().plus({ days: 1 })
          },
          {
            user_id: user.id,
            title: 'Appointment with the  Tailor',
            content: 'Get a fitted suit for a dinner party. Suitshould be tactical.',
            due_date: DateTime.local().plus({ days: 2 })
          },
          {
            user_id: user.id,
            title: "Visit wife's grave",
            content: 'Remmember to buy some flowers from the florist on the way.',
            due_date: DateTime.local().plus({ days: 30 })
          }
        ]

        await ToDo.updateOrCreateMany('title', toDosToCreate)
      }
    }

  }
