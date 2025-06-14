import { copilot } from './client.js'

export async function models() {
  const formatDate = new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format
  const res = await copilot.models.list()
  res.data.forEach((model, index) => {
    console.log(`${index + 1}. ${model.id} (${formatDate(model.created)})`)
  })
}
