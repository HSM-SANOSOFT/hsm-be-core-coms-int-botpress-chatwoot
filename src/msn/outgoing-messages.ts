//File: ChatWoot/src/msn/outgoing-messages.ts

import axios from 'axios';
import { IntegrationContext } from '@botpress/sdk';
import { Message } from './message-type';
import FormData from 'form-data';
import { platform } from 'os';

export const sendOutgoingMessage = async (params) => {
    const { ctx, conversation, message, type, client } = params;
    if (!conversation) {
        throw new Error("Conversation object is undefined or null in sendOutgoingMessage.");
    }

    const chatwootConversationId = conversation.tags?.chatwootId;
    const platform = conversation.tags?.platform;
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
                await sendChoiceMessage(message, messageEndpoint, ctx, platform);
                break;
            case 'dropdown':
                await sendDropdownMessage(message, messageEndpoint, ctx, platform);
                break;
            case 'image':
                await sendMediaMessage(message, messageEndpoint, ctx, 'image', platform);
                break;
            case 'video':
                await sendMediaMessage(message, messageEndpoint, ctx, 'video', platform);
                break;
            case 'audio':
                await sendMediaMessage(message, messageEndpoint, ctx, 'audio', platform);
                break;
            case 'file':
                await sendMediaMessage(message, messageEndpoint, ctx, 'file', platform);
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
const sendChoiceMessage = async (message: any, endpoint: string, ctx: any, platform: string) => {
    let messageBody;
    switch (platform) {
        case 'facebookpage':
            // For FacebookPage, show the list as plain text, but still use input_select for backend processing
            const listOptions = message.payload?.options.map((option: any, index: number) => {
                return `${option.label}`;  // Format as a numbered list
            }).join('\n');  // Join all options with a new line
            messageBody = {
                content: `${message.payload?.text}\n${listOptions}`,  // Text followed by the list of options
                content_type: 'input_select',  // Still send input_select to process user selection
                content_attributes: {
                    items: message.payload?.options.map((option: any) => ({
                        title: option.label,
                        value: option.value,
                    })),
                },
                message_type: 'outgoing',
                private: false,
            };
            break;
        default:  // WhatsApp or other platforms (default behavior)
            messageBody = {
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
            break;
    }
    await sendToChatwoot(messageBody, endpoint, ctx);
};

// Send a dropdown message
const sendDropdownMessage = async (message: any, endpoint: string, ctx: any, platform: string) => {
    let messageBody;
    switch (platform) {
        case 'facebookpage':
            // For FacebookPage, show the list as plain text, but still use input_select for backend processing
            const listOptions = message.payload?.options.map((option: any, index: number) => {
                return `${option.label}`;  // Format as a numbered list
            }).join('\n');  // Join all options with a new line
            messageBody = {
                content: `${message.payload?.text}\n${listOptions}`,  // Text followed by the list of options
                content_type: 'input_select',  // Still send input_select to process user selection
                content_attributes: {
                    items: message.payload?.options.map((option: any) => ({
                        title: option.label,
                        value: option.value,
                    })),
                },
                message_type: 'outgoing',
                private: false,
            };
            break;
        default:  // WhatsApp or other platforms (default behavior)
            messageBody = {
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
            break;
    }
    await sendToChatwoot(messageBody, endpoint, ctx);
};

// Send a media message (image, video, audio, or file)
const sendMediaMessage = async (message: any, endpoint: string, ctx: any, mediaType: string, platform: string) => {
    try {
        let mediaUrl: string | undefined;
        let filename = message.payload?.title || 'media';

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

        // Platform-specific logic for file type and FacebookPage
        if (platform === 'facebookpage' && mediaType === 'file') {
            // Shorten the media URL using TinyURL API
            const shortenedUrl = await shortenUrl(mediaUrl);

            // For Facebook Messenger, send the file as a shortened link
            const messageBody = {
                content: `Puedes descargar el archivo aquí: [Descargar Archivo](${shortenedUrl})`,
                message_type: 'outgoing',
                private: false,
            };

            // Send the message body as a link to Chatwoot
            await sendToChatwoot(messageBody, endpoint, ctx);
            return;
        }

        // Fetch media for other types or platforms
        const response = await axios.get(mediaUrl, { responseType: 'stream' });
        const mimeType = response.headers['content-type'] || guessContentTypeFromUrl(mediaUrl); // Fallback to helper function


        const formData = new FormData();

        if (message.payload?.caption) {
            formData.append('content', message.payload?.caption);
        } else {
            formData.append('content', ''); // Default to empty string if no caption
        }

        formData.append('attachments[]', response.data, {
            filename: filename,
            contentType: mimeType,
        });

        const config = {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
        };

        const mediaResponse = await axios.post(endpoint, formData, config);
    } catch (error) {
        throw new Error(`Error sending ${mediaType} message: ${error}`);
    }
};

// Helper function to shorten URL using TinyURL
const shortenUrl = async (url: string): Promise<string> => {
    try {
        const responseURL = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
        return responseURL.data;
    } catch (error) {
        return url; // If the URL shortening fails, return the original URL
    }
};

// Helper function to dynamically guess content type from the URL
const guessContentTypeFromUrl = (mediaUrl: string) => {
    const extension = mediaUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
        // Image types
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'gif': return 'image/gif';
        case 'webp': return 'image/webp';
        case 'bmp': return 'image/bmp';
        case 'tiff': return 'image/tiff';
        case 'svg': return 'image/svg+xml';

        // Video types
        case 'mp4': return 'video/mp4';
        case 'mov': return 'video/quicktime';
        case 'avi': return 'video/x-msvideo';
        case 'mkv': return 'video/x-matroska';
        case 'webm': return 'video/webm';
        case 'wmv': return 'video/x-ms-wmv';
        case 'flv': return 'video/x-flv';

        // Audio types
        case 'mp3': return 'audio/mpeg';
        case 'ogg': return 'audio/ogg';
        case 'wav': return 'audio/wav';
        case 'aac': return 'audio/aac';
        case 'flac': return 'audio/flac';
        case 'm4a': return 'audio/mp4';

        // Document types
        case 'pdf': return 'application/pdf';
        case 'doc': return 'application/msword';
        case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'xls': return 'application/vnd.ms-excel';
        case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'ppt': return 'application/vnd.ms-powerpoint';
        case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        case 'txt': return 'text/plain';
        case 'rtf': return 'application/rtf';

        // Compressed and executable files
        case 'zip': return 'application/zip';
        case 'rar': return 'application/vnd.rar';
        case '7z': return 'application/x-7z-compressed';
        case 'tar': return 'application/x-tar';
        case 'gz': return 'application/gzip';
        case 'exe': return 'application/x-msdownload';
        case 'apk': return 'application/vnd.android.package-archive';
        case 'dmg': return 'application/x-apple-diskimage';

        // Default type for unknown extensions
        default: return 'application/octet-stream';
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
        message_type: 'outgoing',
        private: false,
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
        message_type: 'outgoing',
        private: false,
    };

    await sendToChatwoot(messageBody, endpoint, ctx);
};



// Send a location message as a link
const sendLocationMessage = async (message: any, endpoint: string, ctx: any) => {
    // Generate Google Maps link based on coordinates
    const latitude = message.payload?.latitude;
    const longitude = message.payload?.longitude;

    if (!latitude || !longitude) {
        throw new Error("Latitude and longitude are required to generate a Google Maps link.");
    }

    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const locationName = message.payload?.title || 'Location';
    const address = message.payload?.address || 'No address provided';

    // Create message content with the link and other location details
    const messageBody = {
        content: `${locationName}\n${address}\n[View on Google Maps](${googleMapsLink})`,
        message_type: 'outgoing',
        private: false,
    };

    await sendToChatwoot(messageBody, endpoint, ctx);
};

// Helper function to send message to Chatwoot
const sendToChatwoot = async (messageBody: any, endpoint: string, ctx: any) => {
    try {
        await axios.post(endpoint, messageBody, {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity
        });
    } catch (error) {
        throw new Error(`Error sending message to Chatwoot: ${error}`);
    }
};

