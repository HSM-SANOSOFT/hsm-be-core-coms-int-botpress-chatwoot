import { messages } from '@botpress/sdk';

export const channels = {
  chatwoot: {
    messages: {
      text: messages.defaults.text,
      choice: messages.defaults.choice,
      dropdown: messages.defaults.dropdown,
      card: messages.defaults.card,
      image: messages.defaults.image,
      audio: messages.defaults.audio,
      video: messages.defaults.video,
      file: messages.defaults.file,
    },
    message: {
      tags: {
        id: {
          title: 'Chatwoot ID',
          description: 'The Chatwoot ID of the message',
        },
      },
    },
    conversation: {
      tags: {
        id: {
          title: 'Chatwoot ID',
          description: 'The Chatwoot ID of the conversation',
        },
        platform: {
          title: 'Platform',
          description: 'The platform tag of the conversation',
        },
        inboxId: {
          title: 'Inbox ID',
          description: 'The inbox ID tag of the conversation',
        },
      },
    },
  },
};
