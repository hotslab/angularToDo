import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Notification from "App/Models/Notification"

export default class NotificationsController {
    public async index({ request, response }: HttpContextContract) {
        const notifications = await Notification.query().where('userId', request.input('userId'))
            .where('viewed', false)
            .orderBy('due_date', 'desc')
        return response.ok({ notifications: notifications })
    }

    public async update({ request, response }: HttpContextContract) {
        const notification = await Notification.find(request.param('id'))
        if (notification) {
            await notification.merge({ viewed: true }).save()
            return response.created({ notification: notification })
        } else return response.notFound('Notification not found')
    }
}
