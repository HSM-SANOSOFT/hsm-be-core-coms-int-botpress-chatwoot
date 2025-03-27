import type * as messages from '@botpress/sdk/dist/message';

import { ChatwootClient } from './client';
import { Integration } from '.botpress';

export default new Integration({
  register: async params => {
    const { ctx, logger, webhookUrl, client } = params;
    const { baseUrl, userApiKey, accountId, inboxNumber } = ctx.configuration;
    if (!baseUrl || !userApiKey || !accountId || !inboxNumber?.length) {
      logger
        .forBot()
        .warn('Missing required configuration values. Skipping registration.');
      return;
    }
    logger.forBot().debug('Registering Chatwoot integration');
    const chatwootClient = new ChatwootClient(
      logger,
      ctx.configuration.userApiKey,
      ctx.configuration.accountId,
      ctx.configuration.baseUrl,
    );

    const { id, access_token } =
      await chatwootClient.createAgentBot(webhookUrl);

    await chatwootClient.assignAgentBot(id, ctx.configuration.inboxNumber);

    logger.forBot().debug(`agentBotApiKey: ${access_token}`);

    logger.forBot().debug('Chatwoot agent bot access token received');
    await client.setState({
      id: ctx.integrationId,
      type: 'integration',
      name: 'configuration',
      payload: { agentBotApiKey: access_token },
    });

    logger.forBot().debug('Chatwoot integration registered');
  },

  unregister: async params => {
    const { ctx, logger } = params;
    logger.forBot().debug('Unregistering Chatwoot integration');
    const chatwootClient = new ChatwootClient(
      logger,
      ctx.configuration.userApiKey,
      ctx.configuration.accountId,
      ctx.configuration.baseUrl,
    );
    logger.forBot().debug('Deleting Chatwoot agent bot');
    await chatwootClient.deleteAgentBot(ctx.configuration.inboxNumber);
  },

  actions: {
    sendToAgent: async params => {
      const { ctx, input, client, logger } = params;
      const conversation_id = input.conversation_id;
      const assignee_id = input.assignee_id;

      const {
        state: {
          payload: { agentBotApiKey },
        },
      } = await client.getState({
        id: ctx.integrationId,
        type: 'integration',
        name: 'configuration',
      });

      const chatwootClient = new ChatwootClient(
        logger,
        agentBotApiKey,
        ctx.configuration.accountId,
        ctx.configuration.baseUrl,
      );
      await chatwootClient.toggleStatus(conversation_id, 'open');
      await chatwootClient.assignConversation({
        conversation_id: conversation_id,
        assignee_id: assignee_id,
      });

      return { currentStatus: 'open' };
    },

    sendToTeam: async params => {
      const { ctx, input, client, logger } = params;
      const conversation_id = input.conversation_id;
      const team_id = input.team_id;

      const {
        state: {
          payload: { agentBotApiKey },
        },
      } = await client.getState({
        id: ctx.integrationId,
        type: 'integration',
        name: 'configuration',
      });

      const chatwootClient = new ChatwootClient(
        logger,
        agentBotApiKey,
        ctx.configuration.accountId,
        ctx.configuration.baseUrl,
      );
      await chatwootClient.toggleStatus(conversation_id, 'open');
      await chatwootClient.assignConversation({
        conversation_id: conversation_id,
        team_id: team_id,
      });

      return { currentStatus: 'open' };
    },

    getContact: async params => {
      const { ctx, input, logger } = params;
      const contact_Id = input.contact_Id;

      const chatwootClient = new ChatwootClient(
        logger,
        ctx.configuration.userApiKey,
        ctx.configuration.accountId,
        ctx.configuration.baseUrl,
      );
      const response = await chatwootClient.getContact(contact_Id);
      return response;
    },

    updateContact: async params => {
      const { ctx, input, logger } = params;
      const { contact_Id, ...updateData } = input;

      const chatwootClient = new ChatwootClient(
        logger,
        ctx.configuration.userApiKey,
        ctx.configuration.accountId,
        ctx.configuration.baseUrl,
      );

      const response = await chatwootClient.updateContact(
        contact_Id,
        updateData,
      );

      return response;
    },
  },

  channels: {
    chatwoot: {
      messages: {
        text: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = payload.text;
          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            true,
            type,
          );

          await ack({ tags: { id: id.toString() } });
        },
        choice: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = payload.text;
          const content_attributes = {
            items: payload.options.map(opt => ({
              title: opt.label,
              value: opt.value,
            })),
          };

          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            false,
            type,
            content_attributes,
          );

          await ack({ tags: { id: id.toString() } });
        },
        dropdown: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = payload.text;
          const content_attributes = {
            items: payload.options.map(opt => ({
              title: opt.label,
              value: opt.value,
            })),
          };

          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            false,
            type,
            content_attributes,
          );

          await ack({ tags: { id: id.toString() } });
        },
        image: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = payload.imageUrl;
          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
            true,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            false,
            type,
          );

          await ack({ tags: { id: id.toString() } });
        },
        video: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = payload.videoUrl;
          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
            true,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            false,
            type,
          );

          await ack({ tags: { id: id.toString() } });
        },
        audio: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = payload.audioUrl;
          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
            true,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            false,
            type,
          );

          await ack({ tags: { id: id.toString() } });
        },
        file: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = payload.fileUrl;
          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
            true,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            false,
            type,
          );

          await ack({ tags: { id: id.toString() } });
        },
        bloc: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = 'bloc';
          const content_attributes = payload;

          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            false,
            type,
            content_attributes,
          );

          await ack({ tags: { id: id.toString() } });
        },
        carousel: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = payload.items.map(item => item.title).join('\n');
          const content_attributes = {
            items: payload.items.map(item => ({
              media_url: item.imageUrl,
              title: item.title,
              description: item.subtitle,
              actions: item.actions.map(({ action, label, value }) => {
                if (action === 'url') {
                  return {
                    type: 'link',
                    text: label,
                    uri: value,
                  };
                } else {
                  return {
                    type: 'postback',
                    text: label,
                    payload: value,
                  };
                }
              }),
            })),
          };

          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            false,
            type,
            content_attributes,
          );

          await ack({ tags: { id: id.toString() } });
        },
        card: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = payload.title;
          const content_attributes = {
            items: [
              {
                media_url: payload.imageUrl,
                title: payload.title,
                description: payload.subtitle,
                actions: payload.actions.map(({ action, label, value }) => {
                  if (action === 'url') {
                    return {
                      type: 'link',
                      text: label,
                      uri: value,
                    };
                  } else {
                    return {
                      type: 'postback',
                      text: label,
                      payload: value,
                    };
                  }
                }),
              },
            ],
          };

          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            false,
            type,
            content_attributes,
          );

          await ack({ tags: { id: id.toString() } });
        },
        location: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          const conversation_id = conversation.tags.id as string;
          const content = payload.title as string;
          const content_attributes = {
            latitude: payload.latitude,
            longitude: payload.longitude,
            address: payload.address,
          };

          const {
            state: {
              payload: { agentBotApiKey },
            },
          } = await client.getState({
            id: ctx.integrationId,
            type: 'integration',
            name: 'configuration',
          });

          const chatwootClient = new ChatwootClient(
            logger,
            agentBotApiKey,
            ctx.configuration.accountId,
            ctx.configuration.baseUrl,
          );

          const { id } = await chatwootClient.createNewMessage(
            conversation_id,
            content,
            'outgoing',
            false,
            type,
            content_attributes,
          );

          await ack({ tags: { id: id.toString() } });
        },
      },
    },
  },
  handler: async params => {
    const { logger, client, req } = params;
    logger.forBot().debug('Received message from Chatwoot' + req.body);
    const data = JSON.parse(req.body as string) as {
      account: {
        id: number;
        name: string;
      };
      additional_attributes: Record<string, unknown>;
      content_attributes: Record<string, unknown>;
      content_type: string;
      content: string | null;
      conversation: {
        additional_attributes: Record<string, unknown>;
        can_reply: boolean;
        channel: string;
        contact_inbox: {
          id: number;
          contact_id: number;
          inbox_id: number;
          source_id: string;
          created_at: string;
          updated_at: string;
          hmac_verified: boolean;
          pubsub_token: string;
        };
        id: number;
        inbox_id: number;
        messages: [
          {
            id: number;
            content: string;
            account_id: number;
            inbox_id: number;
            conversation_id: number;
            message_type: number;
            created_at: number;
            updated_at: string;
            private: boolean;
            status: string;
            source_id: string;
            content_type: string;
            content_attributes: Record<string, unknown>;
            sender_type: string;
            sender_id: number;
            external_source_ids: Record<string, unknown>;
            additional_attributes: Record<string, unknown>;
            processed_message_content: string;
            sentiment: Record<string, unknown>;
            conversation: {
              assignee_id: number | null;
              unread_count: number;
              last_activity_at: number;
              contact_inbox: {
                source_id: string;
              };
            };
          },
          sender: {
            additional_attributes: Record<string, unknown>;
            custom_attributes: Record<string, unknown>;
            email: string | null;
            id: number;
            identifier: string | null;
            name: string;
            phone_number: string | null;
            thumbnail: string;
            blocked: boolean;
            type: string;
          },
        ];
        labels: Array<string>;
        meta: {
          sender: {
            additional_attributes: Record<string, unknown>;
            custom_attributes: Record<string, unknown>;
            email: string | undefined;
            id: number;
            identifier: string | null;
            name: string;
            phone_number: string | undefined;
            thumbnail: string;
            blocked: boolean;
            type: string;
          };
          assignee: number | null;
          team: number | null;
          hmac_verified: boolean;
        };
        status: string;
        custom_attributes: Record<string, unknown>;
        snoozed_until: string | null;
        unread_count: number;
        first_reply_created_at: number | null;
        priority: string | null;
        waiting_since: number;
        agent_last_seen_at: number;
        contact_last_seen_at: number;
        last_activity_at: number;
        timestamp: number;
        created_at: number;
        updated_at: number;
      };
      created_at: string;
      id: number;
      inbox: {
        id: number;
        name: string;
      };
      message_type: string;
      private: boolean;
      sender: {
        account: {
          id: number;
          name: string;
        };
        additional_attributes: Record<string, unknown>;
        avatar: string;
        custom_attributes: Record<string, unknown>;
        email: string | null;
        id: number;
        identifier: string | null;
        name: string;
        phone_number: string | null;
        thumbnail: string;
        blocked: boolean;
      };
      source_id: string;
      event: string;
    };
    const conversationId = data?.id.toString();
    const userId = data?.sender?.id.toString();
    const phone_number = data?.sender?.phone_number;
    const email = data?.sender?.email || '';
    const name = data?.sender?.name || '';
    const messageId = data?.conversation.messages[0]?.id.toString();
    const platform =
      data?.conversation?.channel?.replace('Channel::', '') || '';
    const inboxId = data?.conversation?.inbox_id.toString();
    const content_type = data?.content_type;
    const mappedtype: Record<string, keyof typeof messages.defaults> = {
      text: 'text',
      choice: 'choice',
      dropdown: 'dropdown',
      image: 'image',
      video: 'video',
      audio: 'audio',
      file: 'file',
      bloc: 'bloc',
      carousel: 'carousel',
      card: 'card',
      location: 'location',
    } as const;

    const type = mappedtype[content_type] ?? 'text';
    const content = data?.content;

    logger.forBot().debug(
      'Received message from Chatwoot' +
        JSON.stringify({
          conversationId,
          userId,
          inboxId,
          platform,
          messageId,
          type,
          content,
        }),
    );

    /*
    let payload;

    switch (type) {
      case 'text':
        payload = { text: content ?? '' };
        break;

      case 'image':
        payload = { image: { url: content } };
        break;
      case 'video':
        payload = { video: { url: content } };
        break;
      case 'audio':
        payload = { audio: { url: content } };
        break;
      case 'file':
        payload = { file: { url: content } };
        break;

      case 'bloc':
        payload = { bloc: { id: content } };
        break;

      case 'location':
        payload = {
          location: {
            latitude: 0,
            longitude: 0,
          },
        };
        break;

      case 'choice':
        payload = {
          choice: {
            text: content,
            choices: [],
          },
        };
        break;
      case 'dropdown':
        payload = {
          dropdown: {
            text: content,
            choices: [],
          },
        };
        break;

      case 'card':
        payload = {
          card: {
            title: content ?? 'Default title',
            actions: [],
          },
        };
        break;

      case 'carousel':
        payload = {
          carousel: {
            items: [],
          },
        };
        break;

      default:
        payload = { text: content };
    }
    */

    await client.getOrCreateConversation({
      channel: 'chatwoot',
      tags: {
        id: conversationId,
        platform: platform,
        inboxId: inboxId,
      },
    });

    await client.getOrCreateUser({
      tags: {
        id: userId,
        name: name,
        email: email,
        phone_number: phone_number,
      },
    });

    await client.getOrCreateMessage({
      userId,
      conversationId,
      tags: {
        id: messageId,
      },
      type,
      payload: { text: content ?? '' },
    });
  },
});
