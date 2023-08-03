import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo
} from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import User from 'App/Models/User'
import ToDo from 'App/Models/ToDo'
import { NotificationStatus } from 'Contracts/enums'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public status: NotificationStatus

  @column()
  public viewed: boolean

  @column.dateTime()
  public dueDate: DateTime

  @column()
  public userId: number

  @column()
  public toDoId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => ToDo, {
    localKey: 'id',
    foreignKey: 'to_do_id'
  })
  public todo: BelongsTo<typeof ToDo>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
