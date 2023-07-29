import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ToDo from 'App/Models/ToDo'

export default class ToDosController {
    public async show({ request, response }: HttpContextContract) {
        const toDos = await ToDo.query().where('userId', request.param('id')).orderBy('due_date', 'desc')
        response.status(200).send({ toDos: toDos })
    }

    public async store({ request, response }: HttpContextContract) {
        const toDo = await ToDo.create(request.all())
        response.status(200).send({ toDo: toDo })
    }

    public async update({ request, response }: HttpContextContract) {
        const toDo = await ToDo.query().where('id', request.param('id')).update(request.all())
        response.status(200).send({ toDo: toDo })
    }

    public async destroy({ request, response }: HttpContextContract) {
        const toDo = await ToDo.findOrFail(request.param('id'))
        await toDo.delete()
        response.status(200).send({ toDo: toDo })
    }
}
