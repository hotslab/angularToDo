import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {
    public async login({ auth, request, response }: HttpContextContract) {
        const email = request.input('email')
        const password = request.input('password')
        const user = await User.query().where('email', email).firstOrFail()
        if (!(await Hash.verify(user.password, password)))
            return response.unauthorized('Invalid credentials')
        const token = await auth.use('api').generate(user, { expiresIn: '2 days' })
        response.status(200).send({
            user: user,
            token: token
        })
    }

    public async register({ auth, request, response }: HttpContextContract) {
        const email = request.input('email')
        const userExists = await User.findBy('email', email)
        if (userExists) return response.unauthorized('User already exists')
        const user = await User.create(request.all())
        const token = await auth.use('api').generate(user, { expiresIn: '2 days' })
        response.status(200).send({
            user: user,
            token: token
        })
    }
}
