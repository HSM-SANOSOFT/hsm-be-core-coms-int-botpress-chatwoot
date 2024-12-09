// File: ChatWoot/src/ActionDefinition/ActionsSchema.ts

import { string, z } from '@botpress/sdk';

// Full schema for sendToAgent action
export const sendToAgentSchema = {
    title: 'Send to Agent',
    description: 'Directs the conversation to an agent that is associated with the agentBot',
    input: {
        schema: z.object({
            conversationId: z.string(),
        }),
    },
    output: {
        schema: z.object({
            currentStatus: z.string().describe('Conversation Status'),
        }),
    },
};

// Full schema for sendToTeam action
export const sendToTeamSchema = {
    title: 'send to Team',
    description: 'Assigns the conversation to a specific team based on the provided Team ID',
    input: {
        schema: z.object({
            conversationId: z.string(),
            teamId: z.number().describe('ID of the team to assign (must be a number)'), // Team ID as a number
        }),
    },
    output: {
        schema: z.object({
            currentStatus: z.string().describe('Conversation Status'),  // Expected response
        }),
    },
};

export const getCustomAttributesSchema = {
    title: 'Get Custom Attributes',
    description: 'Retrieve custom attributes for a Chatwoot contact',
    input: {
        schema: z.object({
            contactId: z.string().describe('The Chatwoot contact ID (chatwootId)'),
        }),
    },
    output: {
        schema: z.object({
            attributes: z.record(z.any()).describe('Dynamic custom attributes of the contact'),  // Capture dynamic attributes inside an "attributes" object
        }),
    },
};

// Schema for the action to update custom attributes
export const updateCustomAttributesSchema = {
    title: 'Update Custom Attributes',
    description: 'Update custom attributes for a Chatwoot contact',
    input: {
        schema: z.object({
            contactId: z.string().describe('The Chatwoot contact ID (chatwootId)'),  // Referencing Chatwoot ID
            customAttributes: z.string().describe('Body of the request (JSON). Include here the payload to send in the request.'),
        }),
    },
    output: {
        schema: z.object({
            message: z.string().describe('Success message after updating custom attributes'),  // Updated output schema
        }),
    },
};

// Schema for the action to update custom attributes
export const updateEmailSchema = {
    title: 'Update Email',
    description: 'Update email for a Chatwoot contact',
    input: {
        schema: z.object({
            contactId: z.string().describe('The Chatwoot contact ID (chatwootId)'),  // Referencing Chatwoot ID
            email: z.string().describe('Email to update'),
        }),
    },
    output: {
        schema: z.object({
            message: z.string().describe('Success message after updating custom attributes'),  // Updated output schema
        }),
    },
};

// Schema for the action to update custom attributes
export const updatePhoneSchema = {
    title: 'Update Phone',
    description: 'Update phone number for a Chatwoot contact',
    input: {
        schema: z.object({
            contactId: z.string().describe('The Chatwoot contact ID (chatwootId)'),  // Referencing Chatwoot ID
            phone: z.string().describe('phone number to update'),
        }),
    },
    output: {
        schema: z.object({
            message: z.string().describe('Success message after updating custom attributes'),  // Updated output schema
        }),
    },
};