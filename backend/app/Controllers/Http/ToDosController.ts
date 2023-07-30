import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ToDo from 'App/Models/ToDo'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'

export default class ToDosController {
    public async show({ request, response }: HttpContextContract) {
        const toDos = await ToDo.query().where('userId', request.param('id'))
            .where((query) => {
                if (request.input('title'))
                    query.whereILike('title', `%${request.input('title')}%`)
                if (request.input('content'))
                    query.whereILike('content', `%${request.input('content')}%`)
                if (request.input('completed'))
                    query.where('completed', Boolean(request.input('completed')))
            })
            .orderBy('due_date', 'desc')
        response.ok({ toDos: toDos })
    }

    public async store({ request, response }: HttpContextContract) {
        await validator.validate({
            schema: schema.create({
                title: schema.string(([rules.maxLength(255)])),
                content: schema.string([rules.maxLength(3000)]),
                due_date: schema.date({ format: 'yyyy-MM-dd HH:mm:ss' }),
                completed: schema.boolean(),
                user_id: schema.number(),
            }),
            data: request.all()
        })
        const toDo = await ToDo.create(request.all())
        response.created({ toDo: toDo })
    }

    public async update({ request, response }: HttpContextContract) {
        await validator.validate({
            schema: schema.create({
                title: schema.string.optional(([rules.maxLength(255)])),
                content: schema.string.optional([rules.maxLength(3000)]),
                due_date: schema.date.optional({ format: 'yyyy-MM-dd HH:mm:ss' }),
                completed: schema.boolean.optional(),
            }),
            data: request.all()
        })
        const toDo = await ToDo.query().where('id', request.param('id')).update(request.all())
        response.created({ toDo: toDo })
    }

    public async destroy({ request, response }: HttpContextContract) {
        const toDo = await ToDo.findOrFail(request.param('id'))
        await toDo.delete()
        response.ok({ toDo: toDo })
    }
}
