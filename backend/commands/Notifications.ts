import { BaseCommand, flags } from '@adonisjs/core/build/standalone'

export default class Notifications extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'notifications'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Command to notify users of ToDo tasks that are due or overdue on a specified time, and which closes those that are stale after overdue cut off time.'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest` 
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call 
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  @flags.number({ alias: 'r', description: 'Time in hours to send ToDo notification before due time', name: 'remminderTime' })
  public remminderTime: number

  @flags.number({ alias: 'o', description: 'Time in hours to automatically close ToDo after due date', name: 'overdueTime' })
  public overdueTime: number

  public async run() {
    const { DateTime } = await import('luxon')
    const { default: ToDo } = await import('App/Models/ToDo')
    const { default: Notification } = await import('App/Models/Notification')
    const { NotificationStatus } = await import('Contracts/enums')

    this.remminderTime = this.remminderTime ? this.remminderTime : 1
    this.overdueTime = this.overdueTime ? this.overdueTime : 1

    this.logger.info(`Starting processs with remminderTime hours set to ${this.remminderTime} and overdueTime set to ${this.overdueTime} hours...`)

    const toDos = await ToDo.query()
      .where('completed', false)

    this.logger.info(`Found ${toDos.length} ToDos ready to be processed. Processing...`)

    for (const toDo of toDos) {
      const currentTime = DateTime.local().toSeconds()
      const currentDueDate = toDo.dueDate.toSeconds()
      const dueDateBeforeCutoff = toDo.dueDate.minus({ hours: this.remminderTime }).toSeconds()
      const toDoIsNowStale = toDo.dueDate.plus({ hours: this.overdueTime }).toSeconds()

      this.logger.info(`
      currentDueDate => ${currentDueDate}, 
      dueDateBeforeCutoff => ${dueDateBeforeCutoff}, 
      toDoIsNowStale => ${toDoIsNowStale}, 
      first => ${dueDateBeforeCutoff <= currentTime && currentTime < currentDueDate},
      second => ${currentTime >= currentDueDate && currentDueDate < toDoIsNowStale},
      third => ${currentDueDate >= toDoIsNowStale}
      `)

      if (dueDateBeforeCutoff <= currentTime && currentTime < currentDueDate) {
        const statusDueExists = await toDo
          .related('notifications').query().where('viewed', false).where('status', 'due').first()
        if (!statusDueExists) await Notification.create({
          title: toDo.title,
          viewed: false,
          dueDate: toDo.dueDate,
          userId: toDo.userId,
          toDoId: toDo.id
        })
      } else if (currentTime >= currentDueDate && currentDueDate < toDoIsNowStale) {
        const statusDueExists = await toDo
          .related('notifications').query().where('viewed', false).where('status', 'due').first()
        if (statusDueExists) statusDueExists.merge({ viewed: true })
        const statusOverdueExists = await toDo
          .related('notifications').query().where('viewed', false).where('status', 'overdue').first()
        if (!statusOverdueExists) await Notification.create({
          title: toDo.title,
          viewed: false,
          status: NotificationStatus.OVERDUE,
          dueDate: toDo.dueDate,
          userId: toDo.userId,
          toDoId: toDo.id
        })
      } else if (currentDueDate >= toDoIsNowStale) {
        const statusOverdueExists = await toDo
          .related('notifications').query().where('viewed', false).where('status', 'overdue').first()
        if (statusOverdueExists) statusOverdueExists.merge({ viewed: true })
        toDo.merge({ completed: true })
      }
    }

    this.logger.info(`Finished processing ${toDos.length} ToDos at ${DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss')}.`)
  }
}
