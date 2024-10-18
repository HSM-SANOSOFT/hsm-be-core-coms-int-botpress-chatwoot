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
    try {
        const messageEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${conversation.tags.chatwootId}/messages`;
        
        console.log("Sending message to Chatwoot at endpoint: ", messageEndpoint);

        const response = await axios.post(messageEndpoint, messageBody, {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                'Content-Type': 'application/json'
            },
            maxBodyLength: Infinity
        });
        
        console.log("Response from Chatwoot: ", response.data);
    } catch (error) {
        console.error("Error sending message to Chatwoot: ", error.response?.data || error.message);
        throw new RuntimeError(`Error sending message to Chatwoot! ${error}`);
    }
};

/**
 * Prepares a message object for Chatwoot based on the provided payload and type.
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
                    items: payload.options.map((option: any) => ({ title: option.label, value: option.value })),
                },
                message_type: 'outgoing',
                private: false,
            };
        case 'image':
        case 'video':
        case 'audio':
        case 'file':
            return {
                content: payload.caption || '',
                attachments: [{
                    url: payload[`${messageType}Url`],
                    content_type: payload.contentType || guessContentTypeFromUrl(payload[`${messageType}Url`]),
                }],
                message_type: 'outgoing',
                private: false,
            };
        case 'bloc':
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
        console.log(`Uploading ${mediaType} from URL: ${mediaUrl}`);
        
        // Fetch media as a stream
        const response = await axios.get(mediaUrl, { responseType: 'stream' });

        // Validate if media was fetched correctly
        if (!response.data) {
            throw new Error(`Failed to fetch media from ${mediaUrl}`);
        }

        const formData = new FormData();
        formData.append('attachments[]', response.data, {
            filename: `${mediaType}.${mediaUrl.split('.').pop() || 'media'}`,
            contentType: response.headers['content-type'], // Dynamic content type
        });
        formData.append('message_type', 'outgoing');

        const messageEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${conversation.tags.chatwootId}/messages`;

        const config = {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
        };

        const mediaResponse = await axios.post(messageEndpoint, formData, config);
        console.log(`${mediaType} uploaded successfully. Response:`, mediaResponse.data);
    } catch (error) {
        console.error(`Error uploading ${mediaType} to Chatwoot: ${error.message || error}`);
        throw new RuntimeError(`Error sending ${mediaType} to Chatwoot! ${error}`);
    }
};

/**
 * Helper function to determine the content type dynamically based on media type.
 */
const guessContentTypeFromUrl = (mediaUrl: string) => {
    const extension = mediaUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'gif': return 'image/gif';
        case 'mp4': return 'video/mp4';
        case 'mp3': return 'audio/mpeg';
        case 'pdf': return 'application/pdf';
        default: return 'application/octet-stream';
    }
};
