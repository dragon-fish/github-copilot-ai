import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device'
import clipboardy from 'clipboardy'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import open from 'open'

const APP_ID = 'Iv1.b507a08c87ecfe98'
const DOTENT_FILE = resolve(import.meta.dirname, './../../.env')

const getToken = createOAuthDeviceAuth({
  clientType: 'oauth-app',
  clientId: APP_ID,
  scopes: [],
  async onVerification({ verification_uri, user_code, expires_in, interval }) {
    try {
      await clipboardy.write(user_code)
      await open(verification_uri)
      console.info(
        `User code copied to clipboard. Please paste it in the opened browser window.`
      )
    } catch (err) {
      console.info(
        `Please open the following URL in your browser, and enter the code:`
      )
    }
    console.info(`Verification URL: ${verification_uri}`)
    console.info(`User code:        ${user_code}`)
    console.info(
      `You have ${expires_in} seconds to complete the authorization.`
    )
  },
})

export async function runOAuthFlow() {
  const res = await getToken({ type: 'oauth' })

  console.info('Access Token:', res.token)
  try {
    const env = await readFile(DOTENT_FILE, 'utf-8')
    const newEnv = env.replace(/GITHUB_TOKEN=.*/, `GITHUB_TOKEN="${res.token}"`)
    await writeFile(DOTENT_FILE, newEnv, 'utf-8')
    console.info(`Your token has been saved to ${DOTENT_FILE}: ${res.token}`)
  } catch {
    await clipboardy
      .write(res.token)
      .then(() => {
        console.info(`Your token has been copied to clipboard: ${DOTENT_FILE}`)
      })
      .catch((err) => {
        console.error(`Here's your token: ${res.token}`)
      })
  }
}
