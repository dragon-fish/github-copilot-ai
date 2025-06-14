import { copilot } from './client.js'

export async function chat(...args: string[]) {
  const content = args.join(' ')
  if (!content) {
    console.error('Please provide a prompt as an argument.')
    process.exit(1)
  }

  const res = await copilot.chat.completions.create({
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
