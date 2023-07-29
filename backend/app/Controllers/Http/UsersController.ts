import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
    public async index({ response }: HttpContextContract) {
        const users = await User.all()
        response.status(200).send({ users: users })
    }

    public async store({ request, response }: HttpContextContract) {
        const email = request.input('email')
        const userExists = await User.findBy('email', email)
        if (userExists) return response.unauthorized('User already exists')
        const user = await User.create(request.all())
        response.status(200).send({ user: user })
    }

    public async update({ request, response }: HttpContextContract) {
        await User
            .query()
            .where('id', request.param('id'))
            .update(request.all())
        response.status(200).send({ message: 'User updated' })
    }

    public async destroy({ request, response }: HttpContextContract) {
        const user = await User.findOrFail(request.param('id'))
        await user.delete()
        response.status(200).send({ user: user })
    }
}
