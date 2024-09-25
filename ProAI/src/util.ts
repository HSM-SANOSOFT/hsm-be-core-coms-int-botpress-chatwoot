import { IntegrationCtx, Client } from './types'
import { WhatsApp } from './whatsapp'

export class UnreachableCaseError extends Error {
  public constructor(val: never) {
    super(`Unreachable case: ${val}`)
  }
}

export function chunkArray<T>(array: T[], chunkSize: number) {
  const chunks: T[][] = []
  if (chunkSize <= 0) {
    return chunks
  }

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }

  return chunks
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function truncate(input: string, maxLength: number) {
  let truncated = input.substring(0, maxLength)
  if (truncated.length < input.length) {
    truncated = truncated.substring(0, maxLength - 1) + '…'
  }
  return truncated
}

export async function getWhatsAppMediaUrl(
  whatsappMediaId: string,
  ctx: IntegrationCtx
): Promise<string> {
  const accessToken = ctx.configuration.whatsapp.accessToken
  const whatsapp = new WhatsApp({ token: accessToken, secure: false })
  const media = await whatsapp.retrieveMedia(whatsappMediaId)
  return media.url
}
