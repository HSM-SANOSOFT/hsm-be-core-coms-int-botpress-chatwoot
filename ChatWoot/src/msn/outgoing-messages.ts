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
            items: message.options.map((option: any) => ({
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
            items: message.options.map((option: any) => ({
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
const sendMediaMessage = async (message: any, endpoint: string, ctx: any) => {
    try {
        const response = await axios.get(message.url, { responseType: 'stream' });
        const formData = new FormData();
        formData.append('attachments[]', response.data, {
            filename: message.caption || 'media',
            contentType: response.headers['content-type'],
        });
        formData.append('message_type', 'outgoing');

        const config = {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
        };

        console.log("Message Endpoint:", endpoint);
        const mediaResponse = await axios.post(endpoint, formData, config);
        console.log("Request Response:", mediaResponse.data);
    } catch (error) {
        console.error(`Error sending media message: ${error}`);
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