/**
 * Tool implementations for StepFun MCP
 */

import { StepFunAPIClient } from './client.js';
import { TextContent } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Parameter validation schema using Zod
const webSearchSchema = z.object({
  query: z.string().min(1, "Query is required"),
  num_results: z.number().int().min(1).max(50).default(10),
});

/**
 * Web search tool implementation
 */
export async function webSearchTool(client: StepFunAPIClient, args: unknown): Promise<TextContent[]> {
  let validated: { query: string; num_results: number };

  try {
    validated = webSearchSchema.parse(args);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return [{
        type: 'text',
        text: `Invalid parameters: ${errorMessages}`,
      }];
    }
    throw error;
  }

  const payload = {
    query: validated.query,
    num_results: validated.num_results,
  };

  try {
    const response = await client.post('/v1/search', payload);
    return [{
      type: 'text',
      text: JSON.stringify(response, null, 2),
    }];
  } catch (error) {
    return [{
      type: 'text',
      text: `Failed to perform search: ${error instanceof Error ? error.message : String(error)}`,
    }];
  }
}
