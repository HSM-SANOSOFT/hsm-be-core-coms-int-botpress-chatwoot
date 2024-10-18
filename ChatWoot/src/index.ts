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
        text: async (params) => { await sendOutgoingMessage({ ...params, type: 'text' }); },
        choice: async (params) => { await sendOutgoingMessage({ ...params, type: 'choice' }); },
        dropdown: async (params) => { await sendOutgoingMessage({ ...params, type: 'dropdown' }); },
        image: async (params) => { await sendOutgoingMessage({ ...params, type: 'image' }); },  // Updated from 'media'
        video: async (params) => { await sendOutgoingMessage({ ...params, type: 'video' }); },  // Updated from 'media'
        audio: async (params) => { await sendOutgoingMessage({ ...params, type: 'audio' }); },  // Updated from 'media'
        file: async (params) => { await sendOutgoingMessage({ ...params, type: 'file' }); },    // Updated from 'media'
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
