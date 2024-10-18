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
        case 'cards':  // Handle cards message type
            return {
                content: 'card message',
                content_type: 'cards',
                content_attributes: {
                    items: [
                        {
                            media_url: payload.imageUrl || '',
                            title: payload.title || 'No title provided',
                            description: payload.subtitle || 'No description provided',
                            actions: payload.actions.map(action => ({
                                type: action.type || 'link',
                                text: action.text,
                                uri: action.uri || '',
                                payload: action.payload || '',
                            })),
                        },
                    ],
                },
                message_type: 'outgoing',
                private: false,
            };
        case 'carousel':  // Handle carousel message type
            return {
                content: 'carousel message',
                content_type: 'carousel',
                content_attributes: {
                    items: payload.items.map(item => ({
                        media_url: item.imageUrl || '',
                        title: item.title || 'No title provided',
                        description: item.subtitle || 'No description provided',
                        actions: item.actions.map(action => ({
                            type: action.type || 'link',
                            text: action.text,
                            uri: action.uri || '',
                            payload: action.payload || '',
                        })),
                    })),
                },
                message_type: 'outgoing',
                private: false,
            };
        case 'location':  // Handle location message type
            return {
                message_type: 'outgoing',
                content_type: 'location',
                content_attributes: {
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                    name: payload.title || 'Location',
                    address: payload.address || 'No address provided',
                },
                private: false,
            };
        default:
            throw new Error(`Unsupported message type: ${messageType}`);
    }
};
