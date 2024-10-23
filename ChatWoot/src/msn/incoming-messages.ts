//File: ChatWoot / src / msn / incoming - messages.ts

import { IntegrationContext, Client, RuntimeError } from '@botpress/sdk';

export const handleIncomingMessage = async (
    data: any,
    client: Client,
    ctx: IntegrationContext
) => {
    if (data.message_type !== 'incoming') {
        return {
            status: 200,
            body: 'Message not incoming',
        };
    }

    if (data.conversation.status === 'open') {
        return {
            status: 200,
            body: 'Conversation is open',
        };
    }

    const conversationId = data?.conversation?.id;
    const userId = data?.sender?.id;
    const messageId = data?.id;
    const content = data?.content;
    const inboxId = data?.conversation?.inbox_id?.toString();
    const platform = data?.conversation?.channel?.replace('Channel::', '').toLowerCase();

    console.log('Conversation ID:', conversationId);
    console.log('Platform:', platform);
    console.log('Inbox ID:', inboxId);
    console.log('Content:', content);
    console.log('Message ID:', messageId);
    console.log('User ID:', userId);

    if (!conversationId || !userId || !messageId) {
        return {
            status: 400,
            body: "Handler didn't receive a valid message",
        };
    }

    try {
        const { conversation } = await client.getOrCreateConversation({
            channel: 'chatwoot',
            tags: {
                chatwootId: `${conversationId}`,
                inboxId: `${inboxId}`,
                platform: `${platform}`,
            },
        });

        if (!conversation || !conversation.tags) {
            throw new RuntimeError('Conversation or its tags are not properly defined');
        }

        const { user } = await client.getOrCreateUser({
            tags: { chatwootId: `${userId}` },
        });

        // Determine the message type and handle accordingly
        let payload: any;
        let messageType: string;

        if (data?.attachments?.length) {
            const attachment = data.attachments[0];

            // Handling media types
            if (attachment.content_type.startsWith('image')) {
                messageType = 'image';
                payload = { imageUrl: attachment.data_url };
            } else if (attachment.content_type.startsWith('video')) {
                messageType = 'video';
                payload = { videoUrl: attachment.data_url };
            } else if (attachment.content_type.startsWith('audio')) {
                messageType = 'audio';
                payload = { audioUrl: attachment.data_url };
            } else if (attachment.content_type.startsWith('application') || attachment.content_type.startsWith('file')) {
                messageType = 'file';
                payload = { fileUrl: attachment.data_url };
            } else {
                messageType = 'text';
                payload = { text: content }; // Defaulting to text if unknown attachment type
            }
        } else {
            // Handling text messages
            messageType = 'text';
            payload = { text: content };
        }

        await client.createMessage({
            tags: { chatwootId: `${messageId}` },
            type: messageType,
            userId: user.id,
            conversationId: conversation.id,
            payload: payload,
        });

        return {
            status: 200,
            body: 'Message received',
        };
    } catch (error) {
        console.error('Error handling conversation or user creation:', error);
        return {
            status: 500,
            body: 'Internal server error',
        };
    }
};
