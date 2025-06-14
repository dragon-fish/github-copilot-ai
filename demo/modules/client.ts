import { GithubCopilotAI } from '../../src/index.js'

export const copilot = new GithubCopilotAI({
  apiKey: process.env.GITHUB_TOKEN!,
})
