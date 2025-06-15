import { resolve } from 'node:path'
import { homedir } from 'node:os'
import {
  CopilotInternalAuth,
  CopilotInternalUser,
  GithubCopilotAI,
} from '../../src/index.js'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

let _client: GithubCopilotAI | undefined

const LOCAL_CONFIGS_DIR = resolve(homedir(), '.github_copilot_ai_configs')
await mkdir(LOCAL_CONFIGS_DIR, { recursive: true }).catch(() => {
  // Ignore error if the directory already exists
})
const AUTH_CONFIG = resolve(LOCAL_CONFIGS_DIR, 'auth.json')
const USER_CONFIG = resolve(LOCAL_CONFIGS_DIR, 'user.json')

const readLocalSotre = async <T>(file: string): Promise<T | null> => {
  try {
    const data = await readFile(file, 'utf-8')
    return JSON.parse(data) as T
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null // File does not exist
    }
    console.warn(`Failed to read local store from ${file}:`, err)
    return null
  }
}
const writeLocalStore = async (file: string, data: any): Promise<void> => {
  try {
    await writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.warn(`Failed to write local store to ${file}:`, err)
  }
}

export async function getClient() {
  if (!_client) {
    _client = new GithubCopilotAI({
      apiKey: process.env.GITHUB_TOKEN!,
    })
    const localUser = await readLocalSotre<CopilotInternalUser>(USER_CONFIG)
    const localAuth = await readLocalSotre<CopilotInternalAuth>(AUTH_CONFIG)
    if (localUser) {
      _client.setCopilotInternalUser(localUser)
    }
    if (localAuth) {
      _client.setCopilotInternalAuth(localAuth)
    }
    const user = await _client.getCopilotInternalUser().catch(() => {
      console.warn('Failed to fetch copilot internal user')
      return null
    })
    const auth = await _client.getCopilotInternalAuth().catch(() => {
      console.warn('Failed to fetch copilot internal auth')
      return null
    })
    await writeLocalStore(
      USER_CONFIG,
      user ? _client.setCopilotInternalUser(user) : null
    )
    await writeLocalStore(
      AUTH_CONFIG,
      auth ? _client.setCopilotInternalAuth(auth) : null
    )
    if (!user || !auth) {
      console.warn(
        'Failed to initialize Github Copilot AI client. Please check your GITHUB_TOKEN environment variable.'
      )
      process.exit(1)
    }
  }
  return _client
}
