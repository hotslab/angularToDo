import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
    public async login({ auth, request, response }: HttpContextContract) {
        await validator.validate({
            schema: schema.create({
                email: schema.string([rules.email()]),
                password: schema.string(),
            }),
            data: request.all()
        })
        const user = await User.query().where('email', request.input('email')).firstOrFail()
        if (!(await Hash.verify(user.password, request.input('password'))))
            return response.unauthorized('Invalid credentials')
        const token = await auth.use('api').generate(user, { expiresIn: '2 days' })
        response.created({
            user: user,
            token: token
        })
    }

    public async register({ auth, request, response }: HttpContextContract) {
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
            }),
            data: request.all()
        })
        const userExists = await User.findBy('email', request.input('email'))
        if (userExists) return response.unauthorized('User already exists')
        const user = await User.create(request.all())
        const token = await auth.use('api').generate(user, { expiresIn: '2 days' })
        response.created({
            user: user,
            token: token
        })
    }
}
