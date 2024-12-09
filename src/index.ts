//File: ChatWoot/src/index.ts

import * as bp from '.botpress';
import { handleIncomingRequest } from './handler';
import { sendOutgoingMessage } from './msn/outgoing-messages';
import * as Actions from './ActionDefinition/Actions';

export default new bp.Integration({
  register: async ({ }) => { },
  unregister: async ({ }) => { },
  actions: {
    sendToAgent: Actions.sendToAgent,
    sendToTeam: Actions.sendToTeam,
    getCustomAttributes: Actions.getCustomAttributes,
    updateCustomAttributes: Actions.updateCustomAttributes,
    updateEmail: Actions.updateEmail,
    updatePhone: Actions.updatePhone
  },
  channels: {
    chatwoot: {
      messages: {
        // Delegating the handling of outgoing messages to sendOutgoingMessage in outgoing-messages.ts
        text: async (params) => { await sendOutgoingMessage({ ...params, type: 'text' }); },
        markdown: async (params) => { await sendOutgoingMessage({ ...params, type: 'markdown' }); },
        choice: async (params) => { await sendOutgoingMessage({ ...params, type: 'choice' }); },
        dropdown: async (params) => { await sendOutgoingMessage({ ...params, type: 'dropdown' }); },
        image: async (params) => { await sendOutgoingMessage({ ...params, type: 'image' }); },
        video: async (params) => { await sendOutgoingMessage({ ...params, type: 'video' }); },
        audio: async (params) => { await sendOutgoingMessage({ ...params, type: 'audio' }); },
        file: async (params) => { await sendOutgoingMessage({ ...params, type: 'file' }); },
        bloc: async (params) => { await sendOutgoingMessage({ ...params, type: 'bloc' }); },
        carousel: async (params) => { await sendOutgoingMessage({ ...params, type: 'carousel' }); },
        card: async (params) => { await sendOutgoingMessage({ ...params, type: 'cards' }); },
        location: async (params) => { await sendOutgoingMessage({ ...params, type: 'location' }); },
      },
    },
  },
  handler: handleIncomingRequest,
});
