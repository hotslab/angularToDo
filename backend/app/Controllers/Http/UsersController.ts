import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import { Roles } from 'Contracts/enums'

export default class UsersController {
    public async index({ response }: HttpContextContract) {
        const users = await User.all()
        response.ok({ users: users })
    }

    public async store({ request, response }: HttpContextContract) {
        await validator.validate({
            schema: schema.create({
                email: schema.string([
                    rules.email(),
                    rules.unique({
                        table: 'users',
                        column: 'email',
                        caseInsensitive: true,
                    })
                ]),
                name: schema.string(),
                surname: schema.string(),
                password: schema.string(),
                role: schema.enum(
                    Object.values(Roles)
                )
            }),
            data: request.all()
        })
        const userExists = await User.findBy('email', request.input('email'))
        if (userExists) return response.unauthorized('User already exists')
        const user = await User.create(request.all())
        response.created({ user: user })
    }

    public async update({ request, response }: HttpContextContract) {
        await validator.validate({
            schema: schema.create({
                email: schema.string.optional([
                    rules.email(),
                    rules.unique({
                        table: 'users',
                        column: 'email',
                        caseInsensitive: true,
                        whereNot: { id: request.param('id') }
                    })
                ]),
                name: schema.string.optional(),
                surname: schema.string.optional(),
                password: schema.string.optional(),
                role: schema.enum.optional(
                    Object.values(Roles)
                )
            }),
            data: request.all()
        })
        await User
            .query()
            .where('id', request.param('id'))
            .update(request.all())
        response.created({ message: 'User updated' })
    }

    public async destroy({ request, response }: HttpContextContract) {
        const user = await User.findOrFail(request.param('id'))
        await user.delete()
        response.ok({ user: user })
    }
}
