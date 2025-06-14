import 'dotenv/config'
import { GithubCopilot } from './GithubCopilot'

const copilot = new GithubCopilot(process.env.GITHUB_TOKEN!)

const command = process.argv[2]
const args = process.argv.slice(3)
if (!command) {
  console.error('Please provide a command: chat or models')
  process.exit(1)
}
const commands: Record<string, () => Promise<void>> = {
  chat: () => chat(args),
  models: () => models(),
}
if (!commands[command]) {
  console.error(
    `Unknown command: ${command}. Available commands: ${Object.keys(
      commands
    ).join(', ')}`
  )
  process.exit(1)
}

;(async () => {
  try {
    await commands[command]()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
})()

async function chat(args: string[]) {
  const content = args.join(' ')
  if (!content) {
    console.error('Please provide a prompt as an argument.')
    process.exit(1)
  }

  const res = await copilot.client.chat.completions.create({
    model: 'claude-sonnet-4',
    temperature: 1.3,
    messages: [
      {
        role: 'user',
        content,
      },
    ],
    stream: true,
  })
  for await (const part of res) {
    if (part.choices[0].delta.content) {
      process.stdout.write(part.choices[0].delta.content)
    }
  }
  process.stdout.write('\n')
  console.log('----')
}

async function models() {
  const formatDate = new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format
  const res = await copilot.client.models.list()
  res.data.forEach((model, index) => {
    console.log(`${index + 1}. ${model.id} (${formatDate(model.created)})`)
  })
}
