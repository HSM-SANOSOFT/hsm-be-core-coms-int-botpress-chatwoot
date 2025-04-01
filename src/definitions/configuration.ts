import { z } from '@botpress/sdk';

export const configuration = {
  schema: z.object({
    userApiKey: z
      .string()
      .describe('The Chatwoot user access token to authenticate API requests'),
    baseUrl: z
      .string()
      .describe('The Chatwoot base URL, Example: https://app.chatwoot.com/'),
    accountId: z.number(),
    inboxNumber: z.array(z.number()),
  }),
};
