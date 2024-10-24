import { z } from '@botpress/sdk';

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
    title: 'Assign to Team',
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

