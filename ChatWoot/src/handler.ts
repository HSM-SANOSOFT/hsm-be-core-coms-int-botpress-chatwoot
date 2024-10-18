// File: ChatWoot/src/handler.ts

import { IntegrationProps } from '@botpress/sdk';
import { handleIncomingMessage } from './msn/incoming-messages';

export const handleIncomingRequest = async ({ req, client, ctx }: IntegrationProps) => {
    try {
        const data = JSON.parse(req.body as string);
        return await handleIncomingMessage(data, client, ctx);
    } catch (error) {
        console.error(`Error handling incoming request: ${error}`);
        return {
            status: 500,
            body: "Internal server error",
        };
    }
};
