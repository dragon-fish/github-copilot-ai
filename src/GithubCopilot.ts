import { OpenAI } from 'openai'

export interface CopilotInternalAuth {
  annotations_enabled: boolean
  chat_enabled: boolean
  chat_jetbrains_enabled: boolean
  code_quote_enabled: boolean
  code_review_enabled: boolean
  codesearch: boolean
  copilotignore_enabled: boolean
  endpoints: {
    api: string
    'origin-tracker': string
    proxy: string
    telemetry: string
  }
  expires_at: number
  individual: boolean
  limited_user_quotas: null | any
  limited_user_reset_date: null | string
  prompt_8k: boolean
  public_suggestions: string
  refresh_in: number
  sku: string
  snippy_load_test_enabled: boolean
  telemetry: string
  token: string
  tracking_id: string
  vsc_electron_fetcher_v2: boolean
  xcode: boolean
  xcode_chat: boolean
}

export class GithubCopilot {
  readonly client: OpenAI
  private copilotInternalAuth: CopilotInternalAuth | null = null
  private defaultHeaders: Record<string, string> = {
    'copilot-integration-id': 'vscode-chat',
    'editor-plugin-version': 'copilot-chat/0.25.2025021001',
    'openai-intent': 'conversation-panel',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)',
    'editor-version': 'vscode/1.100.0-insider',
  }

  constructor(private readonly githubToken: string) {
    this.githubToken = githubToken.replace(/Bearer\s+/, '')
    this.client = new OpenAI({
      apiKey: '',
      baseURL: 'https://api.githubcopilot.com/',
      defaultHeaders: this.defaultHeaders,
      fetch: async (url, options) => {
        if (
          !this.copilotInternalAuth ||
          this.copilotInternalAuth.expires_at < Date.now() / 1000
        ) {
          await this.getCopilotInternalAuth()
        }
        const request = new Request(url, options)
        request.headers.set(
          'Authorization',
          `Bearer ${this.copilotInternalAuth?.token || this.githubToken}`
        )
        return fetch(request)
      },
    })
  }

  async getCopilotInternalAuth() {
    const res = await fetch(
      'https://api.github.com/copilot_internal/v2/token',
      {
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
        },
      }
    ).then((res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to fetch copilot internal auth: ${res.status} ${res.statusText}`
        )
      }
      return res.json() as Promise<CopilotInternalAuth>
    })
    if (!res || !res.token) {
      throw new Error('Failed to fetch copilot internal auth: no token found')
    }
    this.copilotInternalAuth = res
    return res
  }
}
