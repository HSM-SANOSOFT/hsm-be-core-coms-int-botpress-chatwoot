import axios from 'axios';
import { RuntimeError } from '@botpress/sdk';

// Helper function to get conversation and user tags from the incoming message
const getTags = async (client, data) => {
    const conversationId = data?.conversation?.id;
    const contactId = data?.sender?.id;
    return {tags : {conversationId: conversationId, contactId: contactId}};
};

// SendToAgent: Keeps the existing functionality (toggle status to 'open')
export const sendToAgent = async ({ ctx, client, input, data }) => {
    let conversationId = input.conversationId;

    if (!conversationId || conversationId.trim() === '') {
        const { tags } = await getTags(client, data);
        conversationId = tags.conversationId;
    }

    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${conversationId}/toggle_status`;

    console.log('sendToAgent Endpoint:', endpoint);
    try {
        console.log('Sending request to:', endpoint);
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
        console.error('Error:', error);
        throw new RuntimeError(`Error sending to agent! ${error}`);
    }
};

// New action: SendToTeam (assign to a specific team)
export const sendToTeam = async ({ ctx, client, input, data }) => {
    let conversationId = input.conversationId;

    if (!conversationId || conversationId.trim() === '') {
        const { tags } = await getTags(client, data);
        conversationId = tags.conversationId;
    }

    const api_access_token = ctx.configuration.userAccessToken;

    const assignmentEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${conversationId}/assignments`;
    const assignmentMessageBody = { team_id: input.teamId };

    console.log('sendToTeam assignmentEndpoint:', assignmentEndpoint);

    const statusEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${conversationId}/toggle_status`;
    const statusMessageBody = { status: 'open' }

    console.log('sendToTeam statusEndpoint:', statusEndpoint);

    try {
        console.log('Sending request to:', assignmentEndpoint);
        const assignmentResponse = await axios.post(assignmentEndpoint, assignmentMessageBody, {
            headers: {
                'api_access_token': api_access_token,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity
        });
        console.log('assignmentResponse data:', assignmentResponse.data);

        console.log('Sending request to:', statusEndpoint);
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
        console.error('Error:', error);
        throw new RuntimeError(`Error assigning to team! ${error}`);
    }
};

export const getCustomAttributes = async ({ ctx, client, input, data }) => {
    let contactId = input.contactId;

    // If contactId is empty, use the userId set when the conversation started
    if (!contactId || contactId.trim() === '') {
        const { tags } = await getTags(client, data);
        contactId = tags.contactId;
    }

    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${contactId}`;

    console.log('getCustomAttributes Endpoint:', endpoint);

    try {
        console.log('Sending request to:', endpoint);
        const response = await axios.get(endpoint, {
            headers: {
                'api_access_token': ctx.configuration.userAccessToken,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity
        });
        console.log('Response data:', response.data);

        return {
            message: 'Custom attributes obtained successfully',
        };
    } catch (error) {
        console.error('Error:', error);
        throw new RuntimeError(`Error updating custom attributes! ${error}`);
    }
};

// Action to update custom attributes
export const updateCustomAttributes = async ({ ctx, client, input, data }) => {
    let contactId = input.contactId;

    // If contactId is empty, use the userId set when the conversation started
    if (!contactId || contactId.trim() === '') {
        const { tags } = await getTags(client, data);
        contactId = tags.contactId;
    }

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
    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${contactId}`;

    // Build the request body for Chatwoot API
    const updateBody = { custom_attributes: customAttributes };

    try {
        console.log('Sending request to:', endpoint);
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
export const updateEmail = async ({ ctx, client, input, data }) => {
    let contactId = input.contactId;

    // If contactId is empty, use the userId set when the conversation started
    if (!contactId || contactId.trim() === '') {
        const { tags } = await getTags(client, data);
        contactId = tags.contactId;
    }

    const email = input.email;  // Email to update

    // Ensure the email is a valid string
    if (typeof email !== 'string') {
        throw new RuntimeError('Email must be a string');
    }

    // Endpoint for updating the contact's email
    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${contactId}`;

    // Build the request body for Chatwoot API
    const updateBody = { email: email };

    try {
        console.log('Sending request to:', endpoint);
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
export const updatePhone = async ({ ctx, client, input, data }) => {
    let contactId = input.contactId;

    // If contactId is empty, use the userId set when the conversation started
    if (!contactId || contactId.trim() === '') {
        const { tags } = await getTags(client, data);
        contactId = tags.contactId;
    }

    const phone = input.phone;  // Phone to update

    // Ensure the Phone is a valid string
    if (typeof phone !== 'string') {
        throw new RuntimeError('Phone must be a valid');
    }

    // Endpoint for updating custom attributes
    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${contactId}`;

    // Build the request body for Chatwoot API
    const updateBody = { phone_number: phone };

    try {
        console.log('Sending request to:', endpoint);
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
