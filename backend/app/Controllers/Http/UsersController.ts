import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import { Roles } from 'Contracts/enums'

export default class UsersController {
    public async index({ response }: HttpContextContract) {
        const users = await User.all()
        return response.ok({ users: users })
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
        if (userExists) return response.conflict('User already exists')
        const user = await User.create(request.all())
        return response.created({ user: user })
    }

    public async update({ request, response }: HttpContextContract) {
        const user = await User.find(request.param('id'))
        if (user) {
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
            await user.merge(request.all()).save()
            return response.created('User updated')
        } else response.notFound('User not found')
    }

    public async destroy({ request, response }: HttpContextContract) {
        const user = await User.findOrFail(request.param('id'))
        await user.delete()
        return response.ok({ user: user })
    }
}
