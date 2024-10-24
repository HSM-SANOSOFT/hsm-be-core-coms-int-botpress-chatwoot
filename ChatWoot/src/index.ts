//File: ChatWoot/src/index.ts

import * as sdk from '@botpress/sdk';
import * as bp from '.botpress';
import { Integration, RuntimeError } from '@botpress/sdk';
import { handleIncomingRequest } from './handler';
import { sendOutgoingMessage } from './msn/outgoing-messages';
import axios from 'axios';
import { platform } from 'process';
import { sendToAgent, sendToTeam } from './ActionDefinition/Actions';

export default new bp.Integration({
  register: async ({ }) => { },
  unregister: async ({ }) => { },
  actions: {
    sendToAgent,
    sendToTeam,
  },
  channels: {
    chatwoot: {
      messages: {
        // Delegating the handling of outgoing messages to sendOutgoingMessage in outgoing-messages.ts
        text: async (params) => { await sendOutgoingMessage({ ...params, type: 'text' }); },
        choice: async (params) => { await sendOutgoingMessage({ ...params, type: 'choice' }); },
        dropdown: async (params) => { await sendOutgoingMessage({ ...params, type: 'dropdown' }); },
        image: async (params) => { await sendOutgoingMessage({ ...params, type: 'image' }); },
        video: async (params) => { await sendOutgoingMessage({ ...params, type: 'video' }); },
        audio: async (params) => { await sendOutgoingMessage({ ...params, type: 'audio' }); },
        file: async (params) => { await sendOutgoingMessage({ ...params, type: 'file' }); },
        markdown: async (params) => { await sendOutgoingMessage({ ...params, type: 'markdown' }); },
        bloc: async (params) => { await sendOutgoingMessage({ ...params, type: 'block' }); },
        carousel: async (params) => { await sendOutgoingMessage({ ...params, type: 'carousel' }); },
        card: async (params) => { await sendOutgoingMessage({ ...params, type: 'cards' }); },  // Updated from 'card' to 'cards'
        location: async (params) => { await sendOutgoingMessage({ ...params, type: 'location' }); },
      },
    },
  },
  handler: handleIncomingRequest,
});
