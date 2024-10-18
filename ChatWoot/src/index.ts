// File: ChatWoot/src/index.ts

import * as sdk from '@botpress/sdk';
import * as bp from '.botpress';
import { Integration, RuntimeError } from '@botpress/sdk';
import { handleIncomingRequest } from './handler';
import { sendOutgoingMessage } from './msn/outgoing-messages';

export default new bp.Integration({
  register: async ({ }) => { },
  unregister: async ({ }) => { },
  actions: {
    sendToAgent: async ({ ctx, client, input }) => {
      console.log("Sending to agent");

      const conversationId = input.conversationId;
      const { conversation } = await client.getConversation({
        id: conversationId
      });
      const chatwootConversationId = conversation.tags.chatwootId;

      const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/toggle_status`;
      console.log("Endpoint: ", endpoint);
      await axios.post(endpoint, {
        status: 'open',
      }, {
        headers: {
          'api_access_token': ctx.configuration.botToken,
          'Content-Type': 'application/json'
        },
        maxBodyLength: Infinity
      }).then((response: any) => {
        console.log("Response For Send To Agent: ", response.data);
      }).catch((error: any) => {
        throw new RuntimeError(
          `Error sending message to Chatwoot! ${error}`
        );
      });

      return { currentStatus: 'open' };
    },
  },
  channels: {
    chatwoot: {
      messages: {
        // Delegating the handling of outgoing messages to sendOutgoingMessage in outgoing-messages.ts
        text: async (params) => {
          console.log("Debugging params for text message:", params);
          const { ctx, conversation, message, client } = params;
          await sendOutgoingMessage({ ctx, conversation, message, type: 'text', client });
        },

        choice: async (params) => {
          console.log("Debugging params for choice message:", params);
          await sendOutgoingMessage({ ...params, type: 'choice' });
        },
        dropdown: async (params) => {
          console.log("Debugging params for dropdown message:", params);
          await sendOutgoingMessage({ ...params, type: 'dropdown' });
        },
        image: async (params) => {
          console.log("Debugging params for image message:", params);
          await sendOutgoingMessage({ ...params, type: 'media', mediaType: 'image' });
        },
        video: async (params) => {
          console.log("Debugging params for video message:", params);
          await sendOutgoingMessage({ ...params, type: 'media', mediaType: 'video' });
        },
        audio: async (params) => {
          console.log("Debugging params for audio message:", params);
          await sendOutgoingMessage({ ...params, type: 'media', mediaType: 'audio' });
        },
        file: async (params) => {
          console.log("Debugging params for file message:", params);
          await sendOutgoingMessage({ ...params, type: 'media', mediaType: 'file' });
        },
        markdown: async (params) => {
          console.log("Debugging params for markdown message:", params);
          await sendOutgoingMessage({ ...params, type: 'markdown' });
        },
        bloc: async (params) => {
          console.log("Debugging params for bloc message:", params);
          await sendOutgoingMessage({ ...params, type: 'block' });
        },
        carousel: async (params) => {
          console.log("Debugging params for carousel message:", params);
          await sendOutgoingMessage({ ...params, type: 'carousel' });
        },
        card: async (params) => {
          console.log("Debugging params for card message:", params);
          await sendOutgoingMessage({ ...params, type: 'card' });
        },
        location: async (params) => {
          console.log("Debugging params for location message:", params);
          await sendOutgoingMessage({ ...params, type: 'location' });
        },
      },
    },
  },
  handler: handleIncomingRequest,
});
