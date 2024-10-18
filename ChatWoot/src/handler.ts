import { IntegrationProps, RuntimeError } from '@botpress/sdk';

export const handleIncomingRequest = async ({ req, client }: IntegrationProps) => {
    const data = JSON.parse(req.body as string);

    if (data.message_type !== 'incoming') {
        return {
            status: 200,
            body: "Message not incoming",
        };
    }

    if (data.conversation.status == 'open') {
        return {
            status: 200,
            body: "Conversation is open",
        };
    }

    const conversationId = data?.conversation?.id;
    const userId = data?.sender?.id;
    const messageId = data?.id;
    const content = data?.content;
    const inboxId = data?.conversation?.inbox_id?.toString(); // Convert inboxId to a string
    const platform = data?.conversation?.channel?.replace('Channel::', '').toLowerCase();

    console.log("Conversation ID: ", conversationId);
    console.log("User ID: ", userId);
    console.log("Message ID: ", messageId);
    console.log("Content: ", content);
    console.log("Inbox ID: ", inboxId);
    console.log("Platform: ", platform);

    if (!conversationId || !userId || !messageId) {
        return {
            status: 400,
            body: "Handler didn't receive a valid message",
        };
    }

    const { conversation } = await client.getOrCreateConversation({
        channel: 'chatwoot',
        tags: {
            chatwootId: `${conversationId}`,
            inboxId: `${inboxId}`, // Make sure inboxId is a string
            platform: `${platform}`, // Make sure platform is a string
        },
    });

    const { user } = await client.getOrCreateUser({
        tags: { 'chatwootId': `${userId}` },
    });

    await client.createMessage({
        tags: { 'chatwootId': `${messageId}` },
        type: 'text',
        userId: user.id,
        conversationId: conversation.id,
        payload: { text: content },
    });

    return {
        status: 200,
        body: "Message received",
    };
};
