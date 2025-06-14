# GithubCopilotAI

Using GitHub Copilot API like OpenAI API.

**For learning and research purposes only. There is no guarantee of availability. Don't file issues.**

## Installation

```bash
pnpm add github-copilot-ai
```

## Usage

Just like OpenAI API.

Read more at [OpenAI documentation](https://npmjs.com/package/openai).

```ts
import { GithubCopilotAI } from 'github-copilot-ai'

const client = new GithubCopilotAI({
  apiKey: 'YOUR_GITHUB_AUTH_TOKEN',
})

const response = await client.chat.completions.create({
  model: 'claude-sonnet-4',
  messages: [
    {
      role: 'user',
      content: 'Who are you?',
    },
  ],
})
```

---

> MIT License
>
> Copyright © 2025 @dragon-fish
