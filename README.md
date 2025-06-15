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
  apiKey: 'YOUR_COPILOT_OAUTH_TOKEN',
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

## How to get Copilot OAuth Token

We create a simple script to get GitHub Auth Token.

```sh
pnpm run oauth
```

Follow the instructions in the script to get your GitHub Auth Token.

Refer to [the source code](./demo/modules/oauth.ts) for more details, if you want to implement it elsewhere or in another language.

---

> MIT License
>
> Copyright © 2025 @dragon-fish
