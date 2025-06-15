import process from 'node:process'
import { exec } from 'node:child_process'
import console from 'consola'
import clipboardy from 'clipboardy'

const CLIENT_ID = 'Iv1.b507a08c87ecfe98'
const DEVICE_CODE_ENDPOINT = `https://github.com/login/device/code?client_id=${CLIENT_ID}`

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const oepn = (url: string) => {
  const cmd =
    process.platform === 'win32'
      ? `start ${url}`
      : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`
  return new Promise<void>((resolve, reject) => {
    exec(cmd, (error) => {
      if (error) {
        reject(new Error(`Failed to open URL: ${error.message}`))
      } else {
        resolve()
      }
    })
  })
}

interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

interface AccessTokenResponse {
  access_token: string
  token_type: string
  scope: string
}
interface AccessTokenErrorResponse {
  error: string
  error_description?: string
  error_uri?: string
  interval?: number
}

export async function getAuthToken() {
  const deviceInfo = await fetch(DEVICE_CODE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch device code: ${res.statusText}`)
    }
    return res.json() as Promise<DeviceCodeResponse>
  })
  if (
    !deviceInfo.user_code ||
    !deviceInfo.device_code ||
    !deviceInfo.verification_uri
  ) {
    throw new Error('Invalid response from device code endpoint')
  }
  const expiredTime = Date.now() + deviceInfo.expires_in * 1000
  console.info(
    `Please open ${deviceInfo.verification_uri} and enter the code: ${deviceInfo.user_code}`
  )
  try {
    await clipboardy.write(deviceInfo.user_code)
    await oepn(deviceInfo.verification_uri)
    console.info(
      `User code copied to clipboard. Paste it in the opened browser window.`
    )
  } catch (error) {
    console.warn(
      'Failed to open verification URL automatically. Please copy the user code manually and open the verification URL in your browser.'
    )
    console.error(error)
  }
  console.info(
    `You have ${deviceInfo.expires_in} seconds to complete the authorization.`
  )
  await sleep(deviceInfo.interval * 1000) // Wait a bit before starting the loop
  const loop = async () => {
    if (Date.now() > expiredTime) {
      throw new Error('Device code has expired, please try again.')
    }
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      device_code: deviceInfo.device_code,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    })
    const res = await fetch(
      `https://github.com/login/oauth/access_token?${params}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )
    if (!res.ok) {
      throw new Error(`Failed to fetch access token: ${res.statusText}`)
    }
    const data = (await res.json()) as
      | AccessTokenResponse
      | AccessTokenErrorResponse

    if ('access_token' in data) {
      return data
    }
    if ('error' in data) {
      if (data.error === 'authorization_pending') {
        console.log('Authorization pending, waiting for user input...')
        await sleep(deviceInfo.interval * 1000)
        return loop()
      } else if (data.error === 'slow_down') {
        console.log('Slow down, waiting before retrying...')
        await sleep((data.interval || deviceInfo.interval || 5) * 1000)
        return loop()
      } else {
        throw new Error(
          `Error fetching access token: ${data.error_description || data.error}`
        )
      }
    }
  }
  const token = await loop()
  if (!token || !token.access_token) {
    throw new Error('Failed to retrieve access token')
  }
  console.success('Access Token:', token.access_token)
  try {
    await clipboardy.write(token.access_token)
    console.success('All done! Access token copied to clipboard.')
  } catch (_) {
    // DO NOTHING
  }
}
