// File: ChatWoot/src/msn/outgoing-messages.ts

import axios from 'axios';
import { IntegrationContext } from '@botpress/sdk';
import { Message } from './message-type';
import FormData from 'form-data';

export const sendOutgoingMessage = async (params) => {
    const { ctx, conversation, message, type, client } = params;
    console.log("Debugging in sendOutgoingMessage - Message Object:", message);
    if (!conversation) {
        throw new Error("Conversation object is undefined or null in sendOutgoingMessage.");
    }

    const chatwootConversationId = conversation.tags?.chatwootId;
    if (!chatwootConversationId) {
        throw new Error("chatwootConversationId is undefined or null in sendOutgoingMessage.");
    }

    const messageEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/messages`;

    try {
        switch (message.type) {
            case 'text':
                await sendTextMessage(message, messageEndpoint, ctx);
                break;
            case 'choice':
                await sendChoiceMessage(message, messageEndpoint, ctx);
                break;
            case 'dropdown':
                await sendDropdownMessage(message, messageEndpoint, ctx);
                break;
            case 'media':
                await sendMediaMessage(message, messageEndpoint, ctx);
                break;
            default:
                throw new Error(`Unsupported message type: ${message.type}`);
        }
    } catch (error) {
        console.error(`Error sending message: ${error}`);
        throw new Error(`Error sending message to Chatwoot: ${error}`);
    }
};

// Send a text message
const sendTextMessage = async (message: any, endpoint: string, ctx: any) => {
    const messageBody = {
        content: message.payload?.text,
        message_type: 'outgoing',
        private: false,
    };
    await sendToChatwoot(messageBody, endpoint, ctx);
};

// Send a choice message
const sendChoiceMessage = async (message: any, endpoint: string, ctx: any) => {
    const messageBody = {
        content: message.payload?.text,
        content_type: 'input_select',
        content_attributes: {
            items: message.payload?.options.map((option: any) => ({
                title: option.label,
                value: option.value,
            })),
        },
        message_type: 'outgoing',
        private: false,
    };
    await sendToChatwoot(messageBody, endpoint, ctx);
};

// Send a dropdown message
const sendDropdownMessage = async (message: any, endpoint: string, ctx: any) => {
    const messageBody = {
        content: message.payload?.text,
        content_type: 'input_select',
        content_attributes: {
            items: message.payload?.options.map((option: any) => ({
                title: option.label,
                value: option.value,
            })),
        },
        message_type: 'outgoing',
        private: false,
    };
    await sendToChatwoot(messageBody, endpoint, ctx);
};

// Send a media message
// Send a media message
const sendMediaMessage = async (message: any, endpoint: string, ctx: any) => {
    try {
        if (!message.url) {
            throw new Error('Media message is missing URL.');
        }

        // Download the media file from the provided URL
        console.log("Attempting to download media from URL:", message.url);
        const response = await axios.get(message.url, { responseType: 'stream' });

        // Prepare the form data with media and caption
        const formData = new FormData();
        formData.append('attachments[]', response.data, {
            filename: message.caption || 'media',
            contentType: response.headers['content-type'],
        });

        // Set the message type and other properties
        formData.append('message_type', 'outgoing');
        if (message.caption) {
            formData.append('content', message.caption);
        }

        // Set the request headers, including form-data specific headers
        const config = {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
        };

        console.log("Sending media message to endpoint:", endpoint);
        console.log("Form data headers:", formData.getHeaders());

        // Send the media message to Chatwoot
        const mediaResponse = await axios.post(endpoint, formData, config);
        console.log("Media message sent successfully. Request Response:", mediaResponse.data);
    } catch (error) {
        console.error(`Error sending media message. Details: ${error.message}`);
        if (error.response) {
            console.error(`Response data: ${JSON.stringify(error.response.data)}`);
        }
        throw new Error(`Error sending media message: ${error}`);
    }
};


// Helper function to send the message to Chatwoot
const sendToChatwoot = async (messageBody: any, endpoint: string, ctx: any) => {
    try {
        const response = await axios.post(endpoint, messageBody, {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity,
        });
        console.log("Request Response:", response.data);
    } catch (error) {
        console.error(`Error sending message to Chatwoot: ${error}`);
        throw new Error(`Error sending message to Chatwoot: ${error}`);
    }
};