import * as sdk from '@botpress/sdk';
import * as bp from '.botpress';
import { Integration, RuntimeError } from '@botpress/sdk';
import { handleIncomingRequest } from './handler';
import { sendOutgoingMessage } from './msn/outgoing-messages';
import axios from 'axios';

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

      try {
        const response = await axios.post(endpoint, {
          status: 'open',
        }, {
          headers: {
            'api_access_token': ctx.configuration.botToken,
            'Content-Type': 'application/json'
          },
          maxBodyLength: Infinity
        });

        console.log("Response For Send To Agent: ", response.data);
        return { currentStatus: 'open' };

      } catch (error) {
        console.error(`Error sending to agent: ${error}`);
        throw new RuntimeError(
          `Error sending to agent! ${error}`
        );
      }
    },
  },
  channels: {
    chatwoot: {
      messages: {
        // Delegating the handling of outgoing messages to sendOutgoingMessage in outgoing-messages.ts
        text: async (params) => { await sendOutgoingMessage({ ...params, type: 'text' }); },
        choice: async (params) => { await sendOutgoingMessage({ ...params, type: 'choice' }); },
        dropdown: async (params) => { await sendOutgoingMessage({ ...params, type: 'dropdown' }); },
        image: async (params) => { await sendOutgoingMessage({ ...params, type: 'image' }); },
        video: async (params) => { await sendOutgoingMessage({ ...params, type: 'video' }); },
        audio: async (params) => { await sendOutgoingMessage({ ...params, type: 'audio' }); },
        file: async (params) => { await sendOutgoingMessage({ ...params, type: 'file' }); },
        markdown: async (params) => { await sendOutgoingMessage({ ...params, type: 'markdown' }); },
        bloc: async (params) => { await sendOutgoingMessage({ ...params, type: 'block' }); },
        carousel: async (params) => { await sendOutgoingMessage({ ...params, type: 'carousel' }); },
        card: async (params) => { await sendOutgoingMessage({ ...params, type: 'card' }); },
        location: async (params) => { await sendOutgoingMessage({ ...params, type: 'location' }); },
      },
    },
  },
  handler: handleIncomingRequest,
});
