import axios from 'axios';
import { RuntimeError } from '@botpress/sdk';

// SendToAgent: Keeps the existing functionality (toggle status to 'open')
export const sendToAgent = async ({ ctx, client, input }) => {
    const conversationId = input.conversationId;
    const { conversation } = await client.getConversation({ id: conversationId });
    const chatwootConversationId = conversation.tags.chatwootId;

    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/toggle_status`;

    try {
        const response = await axios.post(endpoint, { status: 'open' }, {
            headers: { 
                'api_access_token': ctx.configuration.botToken, 
                'Content-Type': 'application/json' 
            },
            maxBodyLength: Infinity
        });

        console.log("Response for Send to Agent:", response.data);
        return { currentStatus: 'open' };
    } catch (error) {
        throw new RuntimeError(`Error sending to agent! ${error}`);
    }
};

// New action: SendToTeam (assign to a specific team)
export const sendToTeam = async ({ ctx, client, input }) => {
    const conversationId = input.conversationId;
    const teamId = input.teamId;  // Team ID
    const { conversation } = await client.getConversation({ id: conversationId });
    const chatwootConversationId = conversation.tags.chatwootId;

    const assignmentEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/assignments`;
    const assignmentMessageBody = { team_id: teamId };

    const statusEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/toggle_status`;

    const statusMessageBody ={ status: 'open' }

    try {
        const assignmentResponse = await axios.post(assignmentEndpoint, assignmentMessageBody, {
            headers: {
                'api_access_token': ctx.configuration.userAccessToken,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity
        });

        const statusResponse = await axios.post(statusEndpoint, statusMessageBody, {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity
        });

        // Return the required property 'currentStatus' for Botpress
        return { currentStatus: 'open' };  // Ensure currentStatus is returned
    } catch (error) {
        throw new RuntimeError(`Error assigning to team! ${error}`);
    }
};

