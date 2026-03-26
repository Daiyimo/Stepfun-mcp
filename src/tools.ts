/**
 * Tool implementations for StepFun MCP
 */

import { StepFunAPIClient } from './client.js';
import { TextContent } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Supported search scenario categories (matching StepFun API docs)
const SEARCH_CATEGORIES = ['programming', 'research', 'gov', 'business'] as const;

// Parameter validation schema using Zod
const webSearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  n: z.number().int().min(1).max(20).default(10),
  category: z.enum(SEARCH_CATEGORIES).optional(),
});

/**
 * Web search tool implementation
 */
export async function webSearchTool(client: StepFunAPIClient, args: unknown): Promise<TextContent[]> {
  let validated: { query: string; n: number; category?: typeof SEARCH_CATEGORIES[number] };

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

  const payload: Record<string, unknown> = {
    query: validated.query,
    n: validated.n,
  };

  // Only include category if explicitly provided
  if (validated.category) {
    payload.category = validated.category;
  }

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
