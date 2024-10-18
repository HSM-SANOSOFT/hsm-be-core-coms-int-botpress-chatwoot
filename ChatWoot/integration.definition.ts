// File: ChatWoot/integration.definition.ts

import { IntegrationDefinition, z, messages } from '@botpress/sdk'
import { integrationName } from './package.json'

export default new IntegrationDefinition({
  name: integrationName,
  version: '3.1.4',
  readme: 'hub.md',
  title: 'Chatwoot',
  description: 'Chatwoot Integration for live agent handoff',
  icon: 'icon.svg',
  actions: {
    sendToAgent: {
      title: 'Send to Agent',
      description: 'Directs the conversation to an agent',
      input: {
        schema: z.object({
          conversationId: z.string()
        }),
      },
      output: {
        schema: z.object({
          currentStatus: z.string().describe('Conversation Status'),
        }),
      },
    }
  },
  events: {},
  configuration: {
    schema: z.object({
      botToken: z.string().optional(),
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
