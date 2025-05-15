import { z } from '@botpress/sdk';

export const actions = {
  closeConversation: {
    title: 'Close Conversation',
    description: 'Closes a conversation in Chatwoot',
    input: {
      schema: z.object({
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
        name: z.string().nullable().optional().describe('Name of the contact'),
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
        email: z.string().optional().describe('Email of the contact to update'),
        phone_number: z.string().optional().describe('Phone number to update'),
        custom_attributes: z
          .array(z.record(z.unknown()))
          .optional()
          .describe(
            'Custom attributes to update as an array of one object: [{key: value}]',
          ),
      }),
    },
    output: {
      schema: z.object({
        email: z
          .string()
          .nullable()
          .optional()
          .describe('Email of the contact'),
        name: z.string().nullable().optional().describe('Name of the contact'),
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
};
