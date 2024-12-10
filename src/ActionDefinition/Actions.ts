import axios from 'axios';
import { RuntimeError } from '@botpress/sdk';


// Helper function to get conversation and user tags from the incoming message
const getTags = async (client, userId, conversationId) => {
    const { conversation } = await client.getConversation({ id: conversationId });
    const chatwootConversationId = conversation.tags.chatwootId;

    const { user } = await client.getUser({ id: userId });
    const chatwootContactId = user.tags.chatwootId;

    return { tags: { chatwootConversationId: chatwootConversationId, chatwootContactId: chatwootContactId } };
};

// SendToAgent: Keeps the existing functionality (toggle status to 'open')
export const sendToAgent = async ({ ctx, client, input }) => {
    const userId = input.userId;
    const conversationId = input.conversationId;

    const { tags } = await getTags(client, userId, conversationId);
    const chatwootConversationId = tags.chatwootConversationId;
    const chatwootContactId = tags.chatwootContactId;

    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/toggle_status`;
    console.log('sendToAgent Endpoint:', endpoint);

    try {
        const response = await axios.post(endpoint, { status: 'open' }, {
            headers: {
                'api_access_token': ctx.configuration.botToken,
                'Content-Type': 'application/json'
            },
            maxBodyLength: Infinity
        });
        console.log('Response data:', response.data);
        console.log(`Conversation assigned to agent #${conversationId}`);

        return { currentStatus: 'open' };
    } catch (error) {
        console.error('Error:', error.response.data);
        throw new RuntimeError(`Error sending to agent! ${error}`);
    }
};

// New action: SendToTeam (assign to a specific team)
export const sendToTeam = async ({ ctx, client, input }) => {
    const userId = input.userId;
    const conversationId = input.conversationId;

    const { tags } = await getTags(client, userId, conversationId);
    const chatwootConversationId = tags.chatwootConversationId;
    const chatwootContactId = tags.chatwootContactId;

    const api_access_token = ctx.configuration.userAccessToken;

    const assignmentEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/assignments`;
    const assignmentMessageBody = { team_id: input.teamId };

    const statusEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/toggle_status`;
    const statusMessageBody = { status: 'open' }

    

    try {
        console.log('sendToTeam assignmentEndpoint:', assignmentEndpoint);
        const assignmentResponse = await axios.post(assignmentEndpoint, assignmentMessageBody, {
            headers: {
                'api_access_token': api_access_token,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity
        });
        console.log('assignmentResponse data:', assignmentResponse.data);

        console.log('sendToTeam statusEndpoint:', statusEndpoint);
        const statusResponse = await axios.post(statusEndpoint, statusMessageBody, {
            headers: {
                'api_access_token': api_access_token,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity
        });
        console.log('statusResponse data:', statusResponse.data);

        return { currentStatus: 'open' };
    } catch (error) {
        console.error('Error:', error.response.data);
        throw new RuntimeError(`Error assigning to team! ${error}`);
    }
};

export const getCustomAttributes = async ({ ctx, client, input }) => {
    const userId = input.userId;
    const conversationId = input.conversationId;

    const { tags } = await getTags(client, userId, conversationId);
    const chatwootConversationId = tags.chatwootConversationId;
    const chatwootContactId = tags.chatwootContactId;


    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${chatwootContactId}`;
    console.log('getCustomAttributes Endpoint:', endpoint);

    try {
        const response = await axios.get(endpoint, {
            headers: {
                'api_access_token': ctx.configuration.userAccessToken,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity
        });
        console.log('Response data:', response.data);

        return { attributes: response.data.payload.custom_attributes};
    } catch (error) {
        console.error('Error:', error);
        throw new RuntimeError(`Error updating custom attributes! ${error}`);
    }
};

// Action to update custom attributes
export const updateCustomAttributes = async ({ ctx, client, input }) => {
    const userId = input.userId;
    const conversationId = input.conversationId;

    const { tags } = await getTags(client, userId, conversationId);
    const chatwootConversationId = tags.chatwootConversationId;
    const chatwootContactId = tags.chatwootContactId;

    const inputCustomAttributes = input.customAttributes || '{}';  // Use '{}' as default to prevent parsing errors

    let customAttributes;

    // Parse the customAttributes JSON string
    try {
        customAttributes = JSON.parse(inputCustomAttributes);
    } catch (error) {
        throw new RuntimeError('Invalid JSON format for customAttributes');
    }

    // Ensure customAttributes is an object after parsing
    if (typeof customAttributes !== 'object' || customAttributes === null) {
        throw new RuntimeError('customAttributes must be a valid JSON object');
    }

    // Endpoint for updating custom attributes
    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${chatwootContactId}`;
    console.log('updateCustomAttributes Endpoint:', endpoint);

    // Build the request body for Chatwoot API
    const updateBody = { custom_attributes: customAttributes };

    try {
        const response = await axios.put(endpoint, updateBody, {
            headers: {
                'api_access_token': ctx.configuration.userAccessToken,  // User access token for Chatwoot API
                'Content-Type': 'application/json',
            },
        });
        console.log('Response data:', response.data);

        // Return only a success message
        return {
            message: 'Custom attributes updated successfully',
        };
    } catch (error) {
        console.error('Error:', error);
        throw new RuntimeError(`Error updating custom attributes! ${error}`);
    }
};


// Action to update custom attributes
export const updateEmail = async ({ ctx, client, input }) => {
    const userId = input.userId;
    const conversationId = input.conversationId;

    const { tags } = await getTags(client, userId, conversationId);
    const chatwootConversationId = tags.chatwootConversationId;
    const chatwootContactId = tags.chatwootContactId;

    const email = input.email;  // Email to update

    // Ensure the email is a valid string
    if (typeof email !== 'string') {
        throw new RuntimeError('Email must be a string');
    }

    // Endpoint for updating the contact's email
    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${chatwootContactId}`;
    console.log('updateEmail Endpoint:', endpoint);

    // Build the request body for Chatwoot API
    const updateBody = { email: email };

    try {
        const response = await axios.put(endpoint, updateBody, {
            headers: {
                'api_access_token': ctx.configuration.userAccessToken,  // User access token for Chatwoot API
                'Content-Type': 'application/json',
            },
        });
        console.log('Response data:', response.data);

        // Return only a success message
        return {
            message: 'Email updated successfully',
        };
    } catch (error) {
        console.error('Error:', error);
        if (error.response?.status === 422) {
            const errorMessage = error.response.data?.message || 'Unprocessable Entity';
            const errorAttributes = error.response.data?.attributes || [];
            return {
                message: `Error updating email: ${errorMessage}`,
                attributes: errorAttributes,
            };
        } else {
            return {
                message: `Error updating email: ${error.response?.data || error.message}`,
            };
        }
    }
};


// Action to update custom attributes
export const updatePhone = async ({ ctx, client, input }) => {
    const userId = input.userId;
    const conversationId = input.conversationId;

    const { tags } = await getTags(client, userId, conversationId);
    const chatwootConversationId = tags.chatwootConversationId;
    const chatwootContactId = tags.chatwootContactId;

    const phone = input.phone;  // Phone to update

    // Ensure the Phone is a valid string
    if (typeof phone !== 'string') {
        throw new RuntimeError('Phone must be a valid');
    }

    // Endpoint for updating custom attributes
    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${chatwootContactId}`;
    console.log('updatePhone Endpoint:', endpoint);

    // Build the request body for Chatwoot API
    const updateBody = { phone_number: phone };

    try {
        const response = await axios.put(endpoint, updateBody, {
            headers: {
                'api_access_token': ctx.configuration.userAccessToken,  // User access token for Chatwoot API
                'Content-Type': 'application/json',
            },
        });
        console.log('Response data:', response.data);

        // Return only a success message
        return {
            message: 'Phone updated successfully',
        };
    } catch (error) {
        console.error('Error:', error);
        throw new RuntimeError(`Error updating custom attributes! ${error}`);
    }
};
