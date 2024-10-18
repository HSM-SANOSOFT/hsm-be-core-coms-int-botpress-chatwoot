import { IntegrationProps } from '@botpress/sdk';
import { handleIncomingMessage } from './msn/incoming-messages';

export const handleIncomingRequest = async ({ req, client, ctx }: IntegrationProps) => {
    try {
        if (!req.body) {
            throw new Error("Request body is missing");
        }

        const data = JSON.parse(req.body as string);

        if (!data) {
            throw new Error("Failed to parse request body");
        }

        return await handleIncomingMessage(data, client, ctx);
    } catch (error) {
        console.error(`Error handling incoming request: ${error.message || error}`);
        return {
            status: 500,
            body: "Internal server error",
        };
    }
};
