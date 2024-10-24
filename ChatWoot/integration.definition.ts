// File: ChatWoot/integration.definition.ts

import { IntegrationDefinition, z, messages } from '@botpress/sdk'
import { integrationName } from './package.json'
import { sendToAgentSchema, sendToTeamSchema } from './src/ActionDefinition/ActionsSchema'; // Import action schemas

export default new IntegrationDefinition({
  name: integrationName,
  version: '5.0.0',
  readme: 'hub.md',
  title: 'Chatwoot',
  description: 'Chatwoot Integration for live agent handoff',
  icon: 'icon.svg',
  actions: {
    sendToAgent: sendToAgentSchema, // Using the entire schema for sendToAgent
    sendToTeam: sendToTeamSchema, // Using the entire schema for sendToTeam
  },
  configuration: {
    schema: z.object({
      botToken: z.string().optional(),
      userAccessToken: z.string().describe('The Chatwoot user access token to authenticate API requests'), // Add user access token
      baseUrl: z.string(),
      accountNumber: z.number(),
      inboxNumber: z.number(),
    }),
  },
  states: {},
  channels: {
    chatwoot: {
      messages: messages.defaults, // Using messages.defaults to support all message types out of the box
      message: {
        tags: {
          chatwootId: {}, // Tag messages with chatwootId
        },
      },
      conversation: {
        tags: {
          chatwootId: {}, // Tag conversations with chatwootId
          platform: {}, // Include platform tag to distinguish between WhatsApp, FacebookPage, etc.
          inboxId: {}, // Include the inbox ID tag
        },
      },
    },
  },
  user: {
    tags: {
      chatwootId: {}, // Tag users with chatwootId
    },
  },
})
