import { IntegrationDefinition, messages, z } from '@botpress/sdk';

import { integrationName } from './package.json';

export default new IntegrationDefinition({
  name: integrationName,
  version: '6.0.0',
  readme: 'hub.md',
  title: 'Chatwoot',
  description: 'Chatwoot Integration for live agent handoff',
  icon: 'icon.svg',

  actions: {
    sendToAgent: {
      title: 'Send to Agent',
      description:
        'Directs the conversation to an agent that is associated with the agentBot',
      input: {
        schema: z.object({
          assignee_id: z
            .number()
            .describe('Id of the chatwoot assignee user agent'),
          conversation_id: z
            .number()
            .describe('The numeric chatwoot ID of the conversation'),
        }),
      },
      output: {
        schema: z.object({
          currentStatus: z.string().describe('Conversation Status'),
        }),
      },
    },
    sendToTeam: {
      title: 'send to Team',
      description:
        'Assigns the conversation to a specific team based on the provided Team ID',
      input: {
        schema: z.object({
          team_id: z.number().describe('Id of the chatwoot team'),
          conversation_id: z
            .number()
            .describe('The numeric chatwoot ID of the conversation'),
        }),
      },
      output: {
        schema: z.object({
          currentStatus: z.string().describe('Conversation Status'),
        }),
      },
    },
    getContact: {
      title: 'Get Chatwoot Contact Information',
      description: 'Retrieve contact information for a Chatwoot contact',
      input: {
        schema: z.object({
          contact_Id: z.number().describe('ID of the chatwoot contact'),
        }),
      },
      output: {
        schema: z.object({
          email: z
            .string()
            .nullable()
            .optional()
            .describe('Email of the contact'),
          name: z
            .string()
            .nullable()
            .optional()
            .describe('Name of the contact'),
          phone_number: z
            .string()
            .nullable()
            .optional()
            .describe('Phone number of the contact'),
          additional_attributes: z
            .record(z.any())
            .describe('Additional attributes of the contact'),
          custom_attributes: z
            .record(z.any())
            .describe('Custom attributes of the contact'),
        }),
      },
    },

    updateContact: {
      title: 'Update Chatwoot Contact Information',
      description: 'Update contact information for a Chatwoot contact',
      input: {
        schema: z.object({
          contact_Id: z.number().describe('ID of the chatwoot contact'),
          name: z.string().optional().describe('Name of the contact to update'),
          email: z
            .string()
            .optional()
            .describe('Email of the contact to update'),
          phone_number: z
            .string()
            .optional()
            .describe('Phone number to update'),
          custom_attributes: z
            .object({})
            .catchall(z.any())
            .optional()
            .describe('Custom attributes to update'),
        }),
      },
      output: {
        schema: z.object({
          email: z
            .string()
            .nullable()
            .optional()
            .describe('Email of the contact'),
          name: z
            .string()
            .nullable()
            .optional()
            .describe('Name of the contact'),
          phone_number: z
            .string()
            .nullable()
            .optional()
            .describe('Phone number of the contact'),
          additional_attributes: z
            .record(z.any())
            .describe('Additional attributes of the contact'),
          custom_attributes: z
            .record(z.any())
            .describe('Custom attributes of the contact'),
        }),
      },
    },
  },

  configuration: {
    schema: z.object({
      userApiKey: z
        .string()
        .describe(
          'The Chatwoot user access token to authenticate API requests',
        ),
      baseUrl: z
        .string()
        .describe('The Chatwoot base URL, Example: https://app.chatwoot.com/'),
      accountId: z.number(),
      inboxNumber: z.array(z.number()),
    }),
  },

  states: {
    configuration: {
      type: 'integration',
      schema: z.object({
        agentBotApiKey: z
          .string()
          .describe(
            'The Chatwoot bot agent access token to authenticate API requests',
          ),
      }),
    },
  },

  channels: {
    chatwoot: {
      messages: {
        text: messages.defaults.text,
        choice: messages.defaults.choice,
        dropdown: messages.defaults.dropdown,
        card: messages.defaults.card,
        image: messages.defaults.image,
        audio: messages.defaults.audio,
        video: messages.defaults.video,
        file: messages.defaults.file,
      },
      message: {
        tags: {
          id: {
            title: 'Chatwoot ID',
            description: 'The Chatwoot ID of the message',
          },
        },
      },
      conversation: {
        tags: {
          id: {
            title: 'Chatwoot ID',
            description: 'The Chatwoot ID of the conversation',
          },
          platform: {
            title: 'Platform',
            description: 'The platform tag of the conversation',
          },
          inboxId: {
            title: 'Inbox ID',
            description: 'The inbox ID tag of the conversation',
          },
        },
      },
    },
  },

  user: {
    tags: {
      id: {
        title: 'Chatwoot ID',
        description: 'The Chatwoot ID of the user',
      },
      name: {
        title: 'Name',
        description: 'The name of the user',
      },
      email: {
        title: 'Email',
        description: 'The email of the user',
      },
      phone_number: {
        title: 'Phone',
        description: 'The phone number of the user',
      },
    },
  },
});
