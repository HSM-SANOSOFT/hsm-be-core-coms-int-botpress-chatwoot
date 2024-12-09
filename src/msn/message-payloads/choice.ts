export const choice = (message: any, platform: string) => {
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
    return messageBody
};