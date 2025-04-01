import { z } from '@botpress/sdk';

export const states = {
  configuration: {
    type: 'integration' as const,
    schema: z.object({
      agentBotApiKey: z
        .string()
        .describe(
          'The Chatwoot bot agent access token to authenticate API requests',
        ),
    }),
  },
};
