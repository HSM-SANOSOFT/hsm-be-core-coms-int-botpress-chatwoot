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
    const agentBotIds = await chatwootClient.getAgentBot();
    if (agentBotIds.length) {
      await chatwootClient.deleteAgentBot(agentBotIds);
    }
  },

  actions: {
    closeConversation: async params => {
      const { ctx, input, client, logger } = params;
      const conversation_id = input.conversation_id;
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
      await chatwootClient.toggleStatus(conversation_id, 'resolved');
      return { currentStatus: 'closed' };
    },
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

      const chatwootClient = new ChatwootClient(
        logger,
        ctx.configuration.userApiKey,
        ctx.configuration.accountId,
        ctx.configuration.baseUrl,
      );

      const { contact_Id, ...data } = input;

      const response = await chatwootClient.updateContact(contact_Id, data);

      return response;
    },
  },

  channels: {
    chatwoot: {
      messages: {
        text: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          logger.forBot().debug(`Sending ${type} message to Chatwoot`);
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
          logger.forBot().debug(`Sending ${type} message to Chatwoot`);
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
            'input_select',
            content_attributes,
          );

          await ack({ tags: { id: id.toString() } });
        },
        dropdown: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          logger.forBot().debug(`Sending ${type} message to Chatwoot`);
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
            'input_select',
            content_attributes,
          );

          await ack({ tags: { id: id.toString() } });
        },
        image: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          logger.forBot().debug(`Sending ${type} message to Chatwoot`);
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
        video: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          logger.forBot().debug(`Sending ${type} message to Chatwoot`);
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
        audio: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          logger.forBot().debug(`Sending ${type} message to Chatwoot`);
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
          logger.forBot().debug(`Sending ${type} message to Chatwoot`);
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
        card: async params => {
          const { ctx, client, ack, type, payload, conversation, logger } =
            params;
          logger.forBot().debug(`Sending ${type} message to Chatwoot`);
          const conversation_id = conversation.tags.id as string;
          const content = payload.title;
          const item: {
            media_url: string;
            title: string;
            description: string;
            actions?: Array<{
              type: string;
              text: string;
              uri?: string;
              payload?: string;
            }>;
          } = {
            media_url: payload.imageUrl as string,
            title: payload.title,
            description: payload.subtitle as string,
          };

          if (payload.actions?.length) {
            item.actions = payload.actions.map(({ action, label, value }) => {
              return action === 'url'
                ? { type: 'link', text: label, uri: value }
                : { type: 'postback', text: label, payload: value };
            });
          }
          const content_attributes = { items: [item] };

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
            'cards',
            content_attributes,
          );

          await ack({ tags: { id: id.toString() } });
        },
      },
    },
  },

  handler: async params => {
    const { logger, client, req } = params;
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
    const message_type = data?.message_type;
    if (message_type === 'outgoing') {
      return;
    }

    const status = data?.conversation.status;
    if (status === 'open') {
      return;
    }

    const chatwootConversationId = data?.conversation.id.toString();
    const chatwootUserId = data?.sender?.id.toString();
    const chatwootMessageId = data?.conversation.messages[0]?.id.toString();
    const phone_number = data?.sender?.phone_number || '';
    const email = data?.sender?.email || '';
    const name = data?.sender?.name || '';
    const platform =
      data?.conversation?.channel?.replace('Channel::', '') || '';
    const inboxId = data?.conversation?.inbox_id.toString();
    const content_type = data?.content_type;
    const mappedtype = {
      text: 'text',
      choice: 'choice',
      dropdown: 'dropdown',
      image: 'image',
      video: 'video',
      audio: 'audio',
      file: 'file',
    } as const satisfies Partial<
      Record<string, keyof typeof messages.defaults>
    >;

    const type: (typeof mappedtype)[keyof typeof mappedtype] | undefined =
      mappedtype[content_type as keyof typeof mappedtype];
    const content = data?.content;

    logger.forBot().debug(
      'Received message from Chatwoot \n' +
        JSON.stringify(
          {
            conversationId: chatwootConversationId,
            userId: chatwootUserId,
            messageId: chatwootMessageId,
            inboxId,
            platform,
            content_type,
            content,
          },
          null,
          2,
        ),
    );

    const { conversation } = await client.getOrCreateConversation({
      channel: 'chatwoot',
      tags: {
        id: chatwootConversationId,
        platform: platform,
        inboxId: inboxId,
      },
    });

    const { user } = await client.getOrCreateUser({
      name: name,
      tags: {
        id: chatwootUserId,
        name: name,
        email: email,
        phone_number: phone_number,
      },
    });

    await client.getOrCreateMessage({
      userId: user.id,
      conversationId: conversation.id,
      tags: {
        id: chatwootMessageId,
      },
      type,
      payload: { text: content ?? '' },
    });
  },
});
