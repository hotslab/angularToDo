import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { NotificationStatus } from 'Contracts/enums'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title', 255).notNullable()
      table.enum('status', Object.values(NotificationStatus))
        .defaultTo(NotificationStatus.DUE)
        .notNullable()
      table.boolean('viewed').defaultTo(false).notNullable()
      table
        .dateTime('due_date', { useTz: true })
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE') // delete notification when user is deleted
      table
        .integer('to_do_id')
        .unsigned()
        .references('to_dos.id')
        .onDelete('CASCADE') // delete notification when toDo is deleted
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
