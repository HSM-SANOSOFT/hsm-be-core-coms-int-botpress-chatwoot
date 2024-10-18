import * as sdk from '@botpress/sdk';
import * as bp from '.botpress';
import { Integration, RuntimeError } from '@botpress/sdk';
import { handleIncomingRequest } from './handler';
import { sendToChatwoot, prepareChatwootMessage } from './utils';

const axios = require('axios');
const FormData = require('form-data');

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
        carousel: async ({ payload, ...props }) => {
          console.log("Carousel: ", payload);
          // TODO: Implement Carousel
        },
        card: async ({ payload, ...props }) => {
          console.log("Card: ", payload);
          // TODO: Implement Card
        },
        dropdown: async ({ payload, ctx, conversation }) => {
          try {
            console.log("Handling dropdown menu:", payload);
            const dropdownMessage = prepareChatwootMessage(payload, 'input_select');
            await sendToChatwoot(dropdownMessage, ctx, conversation);
          } catch (error) {
            console.error(`Error handling dropdown: ${error}`);
            throw new RuntimeError(`Error handling dropdown: ${error}`);
          }
        },
        choice: async ({ payload, ctx, conversation }) => {
          console.log("Choice: ", payload);
          const chatwootBody = prepareChatwootMessage(payload, 'input_select');
          await sendToChatwoot(chatwootBody, ctx, conversation);
        },
        image: async ({ payload, ctx, conversation }) => {
          try {
            console.log("Handling image message:", payload);
            const imageUrl = payload.imageUrl;
            const response = await axios.get(imageUrl, {
              responseType: 'stream'
            });

            const formData = new FormData();
            formData.append('attachments[]', response.data, {
              filename: 'image.jpg',
              contentType: response.headers['content-type']
            });
            formData.append('message_type', 'outgoing');

            const chatwootConversationId = conversation.tags.chatwootId;
            const messageEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/messages`;

            const config = {
              headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(),
              },
              maxBodyLength: Infinity,
            };

            await axios.post(messageEndpoint, formData, config);
            console.log("Image sent successfully to Chatwoot");
          } catch (error) {
            throw new RuntimeError(
              `Error sending image to Chatwoot! ${error}`
            );
          }
        },
        video: async ({ payload, ctx, conversation }) => {
          try {
            console.log("Handling video message:", payload);
            const videoUrl = payload.videoUrl;
            const response = await axios.get(videoUrl, {
              responseType: 'stream',
            });

            const formData = new FormData();
            formData.append('attachments[]', response.data, {
              filename: payload.fileName || 'video.mp4',
              contentType: response.headers['content-type'],
            });
            formData.append('message_type', 'outgoing');

            const chatwootConversationId = conversation.tags.chatwootId;
            const messageEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/messages`;

            const config = {
              headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(),
              },
              maxBodyLength: Infinity,
            };

            await axios.post(messageEndpoint, formData, config);
            console.log("Video sent successfully to Chatwoot");
          } catch (error) {
            throw new RuntimeError(`Error sending video to Chatwoot: ${error}`);
          }
        },
        file: async ({ payload, ctx, conversation }) => {
          try {
            console.log("Handling file message:", payload);
            const fileUrl = payload.fileUrl;
            const response = await axios.get(fileUrl, {
              responseType: 'stream',
            });

            const formData = new FormData();
            formData.append('attachments[]', response.data, {
              filename: payload.fileName || 'file',
              contentType: response.headers['content-type'],
            });
            formData.append('message_type', 'outgoing');

            const chatwootConversationId = conversation.tags.chatwootId;
            const messageEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/messages`;

            const config = {
              headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(),
              },
              maxBodyLength: Infinity,
            };

            await axios.post(messageEndpoint, formData, config);
            console.log("File sent successfully to Chatwoot");
          } catch (error) {
            throw new RuntimeError(`Error sending file to Chatwoot: ${error}`);
          }
        },
        audio: async ({ payload, ctx, conversation }) => {
          try {
            console.log("Handling audio message:", payload);
            const audioUrl = payload.audioUrl;
            const response = await axios.get(audioUrl, {
              responseType: 'stream',
            });

            const formData = new FormData();
            formData.append('attachments[]', response.data, {
              filename: payload.fileName || 'audio.mp3',
              contentType: response.headers['content-type'],
            });
            formData.append('message_type', 'outgoing');

            const chatwootConversationId = conversation.tags.chatwootId;
            const messageEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/messages`;

            const config = {
              headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(),
              },
              maxBodyLength: Infinity,
            };

            await axios.post(messageEndpoint, formData, config);
            console.log("Audio sent successfully to Chatwoot");
          } catch (error) {
            throw new RuntimeError(`Error sending audio to Chatwoot: ${error}`);
          }
        },
        markdown: async ({ payload, ctx, conversation }) => {
          try {
            console.log("Handling Markdown message:", payload);
            const markdownMessage = prepareChatwootMessage(payload, 'markdown');
            await sendToChatwoot(markdownMessage, ctx, conversation);
          } catch (error) {
            throw new RuntimeError(`Error handling Markdown: ${error}`);
          }
        },
        bloc: async ({ payload, ctx, conversation }) => {
          try {
            console.log("Handling block message:", payload);
            const blockMessage = {
              content: payload.text || '',
              attachments: payload.attachments || [],
              message_type: 'outgoing',
              private: false,
            };
            await sendToChatwoot(blockMessage, ctx, conversation);
          } catch (error) {
            throw new RuntimeError(`Error handling block: ${error}`);
          }
        },
        text: async ({ payload, ctx, conversation }) => {
          const messageBody = prepareChatwootMessage(payload, 'text');
          await sendToChatwoot(messageBody, ctx, conversation);
        },
      },
    },
  },
  handler: handleIncomingRequest,
});
