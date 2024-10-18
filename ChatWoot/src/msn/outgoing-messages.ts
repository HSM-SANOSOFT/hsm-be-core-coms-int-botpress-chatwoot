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
        // Determine the correct media URL based on the media type
        let mediaUrl: string | undefined;

        switch (mediaType) {
            case 'image':
                mediaUrl = message.payload?.imageUrl;
                break;
            case 'video':
                mediaUrl = message.payload?.videoUrl;
                break;
            case 'audio':
                mediaUrl = message.payload?.audioUrl;
                break;
            case 'file':
                mediaUrl = message.payload?.fileUrl;
                break;
            default:
                throw new Error(`Unsupported media type: ${mediaType}`);
        }

        if (!mediaUrl) {
            throw new Error(`Media URL is missing for type: ${mediaType}`);
        }

        console.log(`Fetching ${mediaType} from URL:`, mediaUrl);

        // Download media from the provided URL
        const response = await axios.get(mediaUrl, { responseType: 'stream' });
        console.log(`${mediaType} fetched successfully from URL:`, mediaUrl);

        // Prepare form data to send to Chatwoot
        const formData = new FormData();

        // Add content field (caption or description for media)
        if (message.payload?.caption) {
            formData.append('content', message.payload?.caption);
        } else {
            formData.append('content', ''); // Default to empty string if no caption
        }

        // Add the media file to 'attachments[]'
        formData.append('attachments[]', response.data, {
            filename: 'media', // You can change this dynamically based on media type or URL
            contentType: response.headers['content-type'],
        });

        const config = {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(), // Ensure proper multipart/form-data headers
            },
            maxBodyLength: Infinity, // Handle large files
        };

        // Send the media message to Chatwoot
        const mediaResponse = await axios.post(endpoint, formData, config);
        console.log(`${mediaType} message sent successfully. Response:`, mediaResponse.data);
    } catch (error) {
        console.error(`Error sending ${mediaType} message: ${error.message}`);
        throw new Error(`Error sending ${mediaType} message: ${error}`);
    }
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
