import { BaseCommand, args, flags } from '@adonisjs/core/build/standalone'

export default class CreateAdmin extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'create:admin'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Command to register a new admin for ToDo application'

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

  public async run() {
    const { validator, schema, rules } = await import('@ioc:Adonis/Core/Validator')
    const { default: User } = await import('App/Models/User')
    const { Roles } = await import('Contracts/enums')

    const email = await this.prompt.ask('Add account email', {
      async validate(answer) {
        try {
          await validator.validate({
            schema: schema.create({ email: schema.string([rules.email()]) }),
            data: { email: answer }
          })
          return true
        } catch (error) {
          return 'Email validation failed. Please try again in correct format'
        }
      },
    })
    const name = await this.prompt.ask('Add account name', {
      validate(answer) {
        if (!answer || answer.length < 3) return 'Username is required and must be over 4 characters'
        return true
      },
    })
    const surname = await this.prompt.ask('Add account surname', {
      validate(answer) {
        if (!answer || answer.length < 3) return 'Username is required and must be over 4 characters'
        return true
      },
    })
    const password = await this.prompt.secure('Add account password', {
      validate(answer) {
        if (!answer || answer.length < 4) return 'Password is required and must be over 4 characters'
        return true
      },
    })
    await this.prompt.secure('Remmember password', {
      validate(answer) {
        if (answer !== password) return 'Passwords do not match'
        return true
      },
    })

    const existingUser = await User.findBy('email', email)
    if (!existingUser) {
      const newUser = await User.create({
        email: email,
        name: name,
        surname: surname,
        role: Roles.ADMIN,
        password: password
      })
      this.logger.info(`New admin has been created with email ${newUser.email}`)
    } else if (existingUser) {
      this.logger.info(`User already exists with email ${existingUser.email}`)
    }
  }
}
