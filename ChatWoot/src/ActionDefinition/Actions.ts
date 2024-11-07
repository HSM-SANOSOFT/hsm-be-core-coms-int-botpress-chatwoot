// File: ChatWoot/src/ActionDefinition/Actions.ts

import axios from 'axios';
import { RuntimeError } from '@botpress/sdk';

// SendToAgent: Keeps the existing functionality (toggle status to 'open')
export const sendToAgent = async ({ ctx, client, input }) => {
    const conversationId = input.conversationId;
    const { conversation } = await client.getConversation({ id: conversationId });
    const chatwootConversationId = conversation.tags.chatwootId;

    const api_access_token = ctx.configuration.botToken;

    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/toggle_status`;

    try {
        const response = await axios.post(endpoint, { status: 'open' }, {
            headers: {
                'api_access_token': api_access_token,
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

    const api_access_token = ctx.configuration.userAccessToken;

    const assignmentEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/assignments`;
    const assignmentMessageBody = { team_id: teamId };

    const statusEndpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/conversations/${chatwootConversationId}/toggle_status`;

    const statusMessageBody = { status: 'open' }

    try {
        const assignmentResponse = await axios.post(assignmentEndpoint, assignmentMessageBody, {
            headers: {
                'api_access_token': api_access_token,
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity
        });

        const statusResponse = await axios.post(statusEndpoint, statusMessageBody, {
            headers: {
                'api_access_token': api_access_token,
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

export const getCustomAttributes = async ({ ctx, client, input }) => {
    const chatwootId = input.contactId;

    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${chatwootId}`;

    try {
        const response = await axios.get(endpoint, {
            headers: {
                'api_access_token': ctx.configuration.userAccessToken,
                'Content-Type': 'application/json',
            },
        });

        const contact = response.data.payload;

        if (!contact || !contact.custom_attributes) {
            throw new Error('No custom attributes found for this contact');
        }

        // Return the custom attributes wrapped in an object
        return { attributes: contact.custom_attributes };
    } catch (error) {
        throw new RuntimeError(`Error fetching custom attributes! ${error.message}`);
    }
};

// Action to update custom attributes
export const updateCustomAttributes = async ({ ctx, client, input }) => {
    const chatwootId = input.contactId;  // Chatwoot contact ID
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
    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${chatwootId}`;

    // Build the request body for Chatwoot API
    const updateBody = { custom_attributes: customAttributes };

    try {
        // Make the API request to update the contact's custom attributes
        const response = await axios.put(endpoint, updateBody, {
            headers: {
                'api_access_token': ctx.configuration.userAccessToken,  // User access token for Chatwoot API
                'Content-Type': 'application/json',
            },
        });

        // Log the full response to inspect the data
        console.log("Response from Chatwoot:", response.data);

        // Return only a success message
        return {
            message: 'Custom attributes updated successfully',
        };
    } catch (error) {
        console.error("Error response from Chatwoot:", error.response?.data || error.message);
        throw new RuntimeError(`Error updating custom attributes! ${error}`);
    }
};


// Action to update custom attributes
export const updateEmail = async ({ ctx, client, input }) => {
    const chatwootId = input.contactId;  // Chatwoot contact ID
    const email = input.email;  // Email to update

    // Ensure the email is a valid string
    if (typeof email !== 'string') {
        throw new RuntimeError('Email must be a string');
    }

    // Endpoint for updating custom attributes
    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${chatwootId}`;

    // Build the request body for Chatwoot API
    const updateBody = { email: email };

    try {
        // Make the API request to update the contact's custom attributes
        const response = await axios.put(endpoint, updateBody, {
            headers: {
                'api_access_token': ctx.configuration.userAccessToken,  // User access token for Chatwoot API
                'Content-Type': 'application/json',
            },
        });

        // Log the full response to inspect the data
        console.log("Response from Chatwoot:", response.data);

        // Return only a success message
        return {
            message: 'Custom attributes updated successfully',
        };
    } catch (error) {
        console.error("Error response from Chatwoot:", error.response?.data || error.message);
        throw new RuntimeError(`Error updating custom attributes! ${error}`);
    }
};


// Action to update custom attributes
export const updatePhone = async ({ ctx, client, input }) => {
    const chatwootId = input.contactId;  // Chatwoot contact ID
    const phone = input.phone;  // Phone to update

    // Ensure the Phone is a valid string
    if (typeof phone !== 'string') {
        throw new RuntimeError('Phone must be a valid');
    }

    // Endpoint for updating custom attributes
    const endpoint = `${ctx.configuration.baseUrl}/api/v1/accounts/${ctx.configuration.accountNumber}/contacts/${chatwootId}`;

    // Build the request body for Chatwoot API
    const updateBody = { phone_number: phone };

    try {
        // Make the API request to update the contact's custom attributes
        const response = await axios.put(endpoint, updateBody, {
            headers: {
                'api_access_token': ctx.configuration.userAccessToken,  // User access token for Chatwoot API
                'Content-Type': 'application/json',
            },
        });

        // Log the full response to inspect the data
        console.log("Response from Chatwoot:", response.data);

        // Return only a success message
        return {
            message: 'Custom attributes updated successfully',
        };
    } catch (error) {
        console.error("Error response from Chatwoot:", error.response?.data || error.message);
        throw new RuntimeError(`Error updating custom attributes! ${error}`);
    }
};
