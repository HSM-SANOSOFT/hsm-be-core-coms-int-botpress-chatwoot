// File: src/utils.ts

import axios from 'axios';
import { RuntimeError } from '@botpress/sdk';
import FormData from 'form-data';

/**
 * Sends a message to Chatwoot using the provided conversation details.
 * @param messageBody The body of the message to be sent.
 * @param ctx Integration context, containing configuration and other useful data.
 * @param conversation Conversation details, including tags.
 */
export const sendToChatwoot = async (messageBody: any, ctx: any, conversation: any) => {
    console.log("Sending message to Chatwoot");
    console.log("Conversation: ", conversation);
    console.log("Message Body: ", messageBody);

    const messageEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${conversation.tags.chatwootId}/messages`;
    console.log("Message Endpoint: ", messageEndpoint);
    await axios.post(messageEndpoint, messageBody, {
        headers: {
            'api_access_token': ctx.configuration.botToken,
            'Content-Type': 'application/json'
        },
        maxBodyLength: Infinity
    }).then((response: any) => {
        console.log("Response For Sending Message: ", response.data);
    }).catch((error: any) => {
        throw new RuntimeError(
            `Error sending message to Chatwoot! ${error}`
        );
    });
};

/**
 * Prepares a message object for Chatwoot based on the provided payload and type.
 * @param payload Payload containing message content, options, etc.
 * @param messageType Type of the message, e.g., 'input_select' for dropdowns.
 * @returns A formatted message ready to be sent to Chatwoot.
 */
export const prepareChatwootMessage = (payload: any, messageType: string) => {
    switch (messageType) {
        case 'text':
            return {
                content: payload.text,
                message_type: 'outgoing',
                private: false,
            };
        case 'markdown':
            return {
                content: payload.text,
                content_type: 'markdown',
                message_type: 'outgoing',
                private: false,
            };
        case 'input_select':
            return {
                content: payload.text,
                content_type: 'input_select',
                content_attributes: {
                    items: payload.options.map((option: any) => {
                        return { title: option.label, value: option.value };
                    }),
                },
                message_type: 'outgoing',
                private: false,
            };
        case 'media':
            return {
                content: payload.caption || '',
                attachments: [{
                    url: payload.url,
                    content_type: payload.mediaType
                }],
                message_type: 'outgoing',
                private: false,
            };
        case 'block':
            return {
                content: payload.text || '',
                attachments: payload.attachments || [],
                message_type: 'outgoing',
                private: false,
            };
        case 'interactive_button':
            return {
                content: payload.text,
                content_type: 'button',
                content_attributes: {
                    items: payload.buttons.map((button: any) => ({
                        title: button.label,
                        type: button.type,
                        value: button.payload,
                    })),
                },
                message_type: 'outgoing',
                private: false,
            };
        default:
            throw new Error(`Unsupported message type: ${messageType}`);
    }
};

/**
 * Utility to handle uploading media to Chatwoot.
 * @param mediaUrl URL of the media to be uploaded.
 * @param ctx Integration context.
 * @param conversation The conversation object, including tags.
 * @param mediaType Type of media (image, video, etc.).
 */
export const uploadMediaToChatwoot = async (mediaUrl: string, ctx: any, conversation: any, mediaType: string) => {
    try {
        console.log(`Handling ${mediaType} upload:`, mediaUrl);

        // Fetch media from the provided URL and create a stream
        const response = await axios.get(mediaUrl, {
            responseType: 'stream',
        });

        // Prepare the form data with the media stream
        const formData = new FormData();
        formData.append('attachments[]', response.data, {
            filename: `${mediaType}.${mediaUrl.split('.').pop() || 'media'}`,
            contentType: response.headers['content-type'],
        });
        formData.append('message_type', 'outgoing');

        // Get the Chatwoot conversation ID from conversation tags
        const chatwootConversationId = conversation.tags.chatwootId;
        const messageEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/messages`;

        // Make the POST request to Chatwoot
        const config = {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(),
            },
            maxBodyLength: Infinity, // Handle large files
        };

        await axios.post(messageEndpoint, formData, config);
        console.log(`${mediaType} sent successfully to Chatwoot`);
    } catch (error) {
        throw new RuntimeError(
            `Error sending ${mediaType} to Chatwoot! ${error}`
        );
    }
};
