import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import { Roles } from 'Contracts/enums'

export default class UsersController {
    public async index({ request, response, auth }: HttpContextContract) {
        if (auth.user?.role !== 'admin') return response.unauthorized('Unauthorized')
        const users = await User.query().where('role', request.input('role'))
            .where((query) => {
                if (request.input('email'))
                    query.whereILike('email', `%${request.input('email')}%`)
                if (request.input('name'))
                    query.whereILike('name', `%${request.input('name')}%`)
                if (request.input('surname'))
                    query.where('surname', request.input('surname'))
            })
            .orderBy('created_at', request.input('order') === 'desc' ? 'desc' : 'asc')
        return response.ok({ users: users })
    }

    public async show({ request, response }: HttpContextContract) {
        return response.ok({ user: await User.find(request.param('id')) })
    }

    public async store({ request, response, auth }: HttpContextContract) {
        if (auth.user?.role !== 'admin') return response.unauthorized('Unauthorized')
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

    public async update({ request, response, auth }: HttpContextContract) {
        if ((auth.user?.id !== Number(request.param('id'))) && (auth.user?.role !== 'admin'))
            return response.unauthorized('Unauthorized')
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
            return response.created({ user: user })
        } else response.notFound('User not found')
    }

    public async destroy({ request, response, auth }: HttpContextContract) {
        if (auth.user?.role !== 'admin') return response.unauthorized('Unauthorized')
        const user = await User.findOrFail(request.param('id'))
        await user.delete()
        return response.ok({ user: user })
    }
}
