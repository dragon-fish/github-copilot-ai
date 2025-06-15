import 'dotenv/config'
import { CommandsController } from './CommandsController'
import { chat } from './modules/chat'
import { models } from './modules/models'
import { runOAuthFlow } from './modules/oauth'

const cmd = new CommandsController()
cmd.register('chat', chat)
cmd.register('models', models)
cmd.register('oauth', runOAuthFlow)

const cliCommand = process.argv[2]
const cliArgs = process.argv.slice(3)
if (!cliCommand) {
  console.error('Please provide a command: chat or models')
  process.exit(1)
}
if (!cmd.exist(cliCommand)) {
  console.error(
    `Command "${cliCommand}" not found. Available commands: ${cmd
      .list()
      .join(', ')}`
  )
  process.exit(1)
}

try {
  const result = cmd.execute(cliCommand, ...cliArgs)
  if (result instanceof Promise) {
    result.then((res) => {
      if (res !== undefined) {
        console.log(res)
      }
    })
  } else if (result !== undefined) {
    console.log(result)
  } else {
    console.log('Command executed successfully.')
    process.exit(0)
  }
} catch (err) {
  console.error('Error:', err)
  process.exit(1)
}
