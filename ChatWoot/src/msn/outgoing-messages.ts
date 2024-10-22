//File: ChatWoot/src/msn/outgoing-messages.ts

import axios from 'axios';
import { IntegrationContext } from '@botpress/sdk';
import { Message } from './message-type';
import FormData from 'form-data';
import { platform } from 'os';

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
            case 'image':
                await sendMediaMessage(message, messageEndpoint, ctx, 'image');
                break;
            case 'video':
                await sendMediaMessage(message, messageEndpoint, ctx, 'video');
                break;
            case 'audio':
                await sendMediaMessage(message, messageEndpoint, ctx, 'audio');
                break;
            case 'file':
                await sendMediaMessage(message, messageEndpoint, ctx, 'file');
                break;
            case 'cards':  // Updated to use 'cards' instead of 'card'
                await sendCardsMessage(message, messageEndpoint, ctx);
                break;
            case 'carousel':
                await sendCarouselMessage(message, messageEndpoint, ctx);
                break;
            case 'location':
                await sendLocationMessage(message, messageEndpoint, ctx);
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

// Send a media message (image, video, audio, or file)
const sendMediaMessage = async (message: any, endpoint: string, ctx: any, mediaType: string) => {
    try {
        let mediaUrl: string | undefined;

        switch (mediaType) {
            case 'image': mediaUrl = message.payload?.imageUrl; break;
            case 'video': mediaUrl = message.payload?.videoUrl; break;
            case 'audio': mediaUrl = message.payload?.audioUrl; break;
            case 'file': mediaUrl = message.payload?.fileUrl; break;
            default: throw new Error(`Unsupported media type: ${mediaType}`);
        }

        if (!mediaUrl) {
            throw new Error(`Media URL is missing for type: ${mediaType}`);
        }

        console.log(`Fetching ${mediaType} from URL:`, mediaUrl);

        const response = await axios.get(mediaUrl, { responseType: 'stream' });
        console.log(`${mediaType} fetched successfully from URL:`, mediaUrl);

        const formData = new FormData();

        if (message.payload?.caption) {
            formData.append('content', message.payload?.caption);
        } else {
            formData.append('content', ''); // Default to empty string if no caption
        }

        formData.append('attachments[]', response.data, {
            filename: 'media',
            contentType: response.headers['content-type'],
        });

        const config = {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
        };

        const mediaResponse = await axios.post(endpoint, formData, config);
        console.log(`${mediaType} message sent successfully. Response:`, mediaResponse.data);
    } catch (error) {
        console.error(`Error sending ${mediaType} message: ${error.message}`);
        throw new Error(`Error sending ${mediaType} message: ${error}`);
    }
};

// Send a cards message
const sendCardsMessage = async (message: any, endpoint: string, ctx: any) => {
    const messageBody = {
        content: "card message",
        content_type: "cards",
        content_attributes: {
            items: [
                {
                    media_url: message.payload?.imageUrl || '', // Use dynamic media URL
                    title: message.payload?.title || 'No title provided',
                    description: message.payload?.subtitle || 'No description provided',
                    actions: message.payload?.actions.map(action => ({
                        type: action.type || 'link', // Ensure you set 'link' or 'postback'
                        text: action.text,
                        uri: action.uri || '', // Only for link type
                        payload: action.payload || '' // Only for postback type
                    }))
                }
            ]
        },
        private: false
    };

    await sendToChatwoot(messageBody, endpoint, ctx);
};


// Send a carousel message
const sendCarouselMessage = async (message: any, endpoint: string, ctx: any) => {
    const items = message.payload?.items.map(item => ({
        media_url: item.imageUrl || '',   // Dynamic media URL
        title: item.title || 'No title provided',
        description: item.subtitle || 'No description provided',
        actions: item.actions.map(action => ({
            type: action.type || 'link',   // 'link' or 'postback'
            text: action.text,
            uri: action.uri || '',         // Used for 'link' type actions
            payload: action.payload || ''  // Used for 'postback' type actions
        }))
    }));

    const messageBody = {
        content: "carousel message",
        content_type: "carousel",
        content_attributes: {
            items: items
        },
        private: false
    };

    await sendToChatwoot(messageBody, endpoint, ctx);
};



// Send a location message
const sendLocationMessage = async (message: any, endpoint: string, ctx: any) => {
    const messageBody = {
        message_type: 'outgoing',
        content_type: 'location',
        content_attributes: {
            latitude: message.payload?.latitude,
            longitude: message.payload?.longitude,
            name: message.payload?.title || 'Location', // Ensure title is sent
            address: message.payload?.address || 'No address provided', // Fallback for address
        },
        private: false
    };
    await sendToChatwoot(messageBody, endpoint, ctx);
};


// Helper function to send message to Chatwoot
const sendToChatwoot = async (messageBody: any, endpoint: string, ctx: any) => {
    try {
        const response = await axios.post(endpoint, messageBody, {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity,
        });
        console.log("Message sent to Chatwoot successfully. Response:", response.data);
    } catch (error) {
        console.error(`Error sending message to Chatwoot: ${error}`);
        throw new Error(`Error sending message to Chatwoot: ${error}`);
    }
};

// Helper function to dynamically guess content type from the URL
const guessContentTypeFromUrl = (mediaUrl: string) => {
    const extension = mediaUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'gif': return 'image/gif';
        case 'webp': return 'image/webp';
        case 'mp4': return 'video/mp4';
        case 'mp3': return 'audio/mpeg';
        case 'pdf': return 'application/pdf';
        default: return 'application/octet-stream';
    }
};
