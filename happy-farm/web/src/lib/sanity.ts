import {createClient} from '@sanity/client'

export const projectId = 'lha5ip1s'
export const dataset = 'production'

// ⚠️ 演示用的 editor token：前端持有写权限 token 只适用于 hackathon demo，
// 正式环境应通过 serverless function 中转（这也是比赛文章的工程亮点素材）。
const writeToken = 'sk53MxegHLAX8EcB0N9WFIOe4mvHhxqr1zJfnOvlR8uTSfyJSmC0fmtdgaPltLt4bBOUjR0s6Lr5EPe4weyFCQglGSJ0jBZLZ6KEHtkaKjZokeox0xkCGBfA0zuhQUwwIYdP5qi4hx4FI3SghbGlKAaYnE1a7IqatMleotxs7UcVxbj4mQQS'

export const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  token: writeToken,
  apiVersion: '2024-01-01',
})
