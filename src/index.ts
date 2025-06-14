import 'dotenv/config'
import { GithubCopilot } from './GithubCopilot'
import { CommandsController } from './CommandsController'
import { chat } from './commands/chat'
import { models } from './commands/models'

export const copilot = new GithubCopilot(process.env.GITHUB_TOKEN!)

const controller = new CommandsController()
controller.register('chat', chat)
controller.register('models', models)

const cmd = process.argv[2]
const args = process.argv.slice(3)
if (!cmd) {
  console.error('Please provide a command: chat or models')
  process.exit(1)
}
if (!controller.exist(cmd)) {
  console.error(
    `Command "${cmd}" not found. Available commands: ${controller
      .list()
      .join(', ')}`
  )
  process.exit(1)
}

try {
  const result = controller.execute(cmd, ...args)
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
