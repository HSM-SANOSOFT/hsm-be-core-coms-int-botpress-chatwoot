export const text = (message: any) => {
    return {
        content: message.payload?.text,
        message_type: 'outgoing',
        private: false,
    };
}